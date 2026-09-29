import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type {
  MainTabParamList,
  MainStackParamList,
} from "../../navigation/mainNavigator";
import { getOrders } from "../../services/orderService";
import { getServices } from "../../services/serviceService";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import type { Order } from "../../types/order";
import type { Service } from "../../types/service";
import { getPayments } from "../../services/paymentService";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Dashboard">,
  NativeStackScreenProps<MainStackParamList>
>;

type Payment = {
  id: number;
  orderId: number;
  amount: string;
  method: string;
  paidAt: string;
};

type OrderStatus =
  | "PESANAN_DITERIMA"
  | "DICUCI"
  | "DIKERINGKAN"
  | "DISETRIKA"
  | "SIAP_DIAMBIL"
  | "SELESAI"
  | "DIBATALKAN";

type BestSeller = {
  category: string;
  label: string;
  service: Service | null;
  soldQuantity: number;
};

const statusLabels: Record<OrderStatus, string> = {
  PESANAN_DITERIMA: "Received",
  DICUCI: "Washing",
  DIKERINGKAN: "Drying",
  DISETRIKA: "Ironing",
  SIAP_DIAMBIL: "Ready",
  SELESAI: "Completed",
  DIBATALKAN: "Cancelled",
};

const categoryLabels: Record<string, string> = {
  REGULER: "Reguler",
  EKSPRESS: "Ekspress",
  KHUSUS: "Khusus",
};

const formatCurrency = (value: number) =>
  `Rp ${value.toLocaleString("id-ID")}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getStatusLabel = (status: string) =>
  statusLabels[status as OrderStatus] ?? status.replaceAll("_", " ");

const getSoldQuantity = (
  orders: Order[],
  serviceId: number
) => {
  return orders
    .filter((order) => order.orderStatus !== "DIBATALKAN")
    .reduce((total, order) => {
      return (
        total +
        order.orderItems
          .filter((item) => item.serviceId === serviceId)
          .reduce((sum, item) => sum + Number(item.quantity), 0)
      );
    }, 0);
};

const getBestSeller = (
  services: Service[],
  orders: Order[],
  category: string
): BestSeller => {
  const categoryServices = services.filter(
    (service) => service.category === category
  );

  let selectedService: Service | null = null;
  let selectedQuantity = 0;

  for (const service of categoryServices) {
    const soldQuantity = getSoldQuantity(orders, service.id);

    if (soldQuantity > selectedQuantity) {
      selectedService = service;
      selectedQuantity = soldQuantity;
    }
  }

  return {
    category,
    label: categoryLabels[category] ?? category,
    service: selectedService,
    soldQuantity: selectedQuantity,
  };
};

export default function DashboardScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);

  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [ordersData, paymentsData, servicesData] =
          await Promise.all([
            getOrders(),
            getPayments(),
            getServices(),
          ]);

        if (cancelled) {
          return;
        }

        setOrders(ordersData);
        setPayments(paymentsData);
        setServices(servicesData);
      } catch (error) {
        console.log("GAGAL FETCH DASHBOARD:", error);

        if (!cancelled) {
          setError("Failed to load dashboard data.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeOrders = orders.filter(
    (order) =>
      order.orderStatus !== "SELESAI" &&
      order.orderStatus !== "DIBATALKAN"
  ).length;

  const processingOrders = orders.filter((order) =>
    ["DICUCI", "DIKERINGKAN", "DISETRIKA"].includes(
      order.orderStatus
    )
  ).length;

  const readyOrders = orders.filter(
    (order) => order.orderStatus === "SIAP_DIAMBIL"
  ).length;

  const unpaidOrders = orders.filter(
    (order) => order.paymentStatus === "BELUM_DIBAYAR"
  ).length;

  const today = new Date();

  const todayRevenue = payments
    .filter((payment) => {
      const paidDate = new Date(payment.paidAt);

      return (
        paidDate.getDate() === today.getDate() &&
        paidDate.getMonth() === today.getMonth() &&
        paidDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );

  const statusCards = [
    {
      title: "Received",
      value: orders.filter(
        (order) => order.orderStatus === "PESANAN_DITERIMA"
      ).length,
    },
    {
      title: "Washing",
      value: orders.filter(
        (order) => order.orderStatus === "DICUCI"
      ).length,
    },
    {
      title: "Drying",
      value: orders.filter(
        (order) => order.orderStatus === "DIKERINGKAN"
      ).length,
    },
    {
      title: "Ironing",
      value: orders.filter(
        (order) => order.orderStatus === "DISETRIKA"
      ).length,
    },
    {
      title: "Ready",
      value: readyOrders,
    },
  ];

  const recentOrders = orders.slice(0, 5);

  const bestSellers: BestSeller[] = [
    getBestSeller(services, orders, "REGULER"),
    getBestSeller(services, orders, "EKSPRESS"),
    getBestSeller(services, orders, "KHUSUS"),
  ];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f7f2eb]">
        <Text className="text-sm text-[#73776d]">
          Loading dashboard...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f2eb]">
      <Header
        title="Dashboard"
        onMenuPress={() => setIsMenuOpen(true)}
      />

      <SideMenu
        visible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onUsersPress={() => {
          setIsMenuOpen(false);
          navigation.navigate("Users");
        }}
        onServicesPress={() => {
          setIsMenuOpen(false);
          navigation.navigate("Services");
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 110,
        }}
      >
        <View className="mb-6 mt-5">
          <Text className="text-sm text-[#73776d]">
            Welcome back,
          </Text>

          <Text className="mt-1 text-2xl font-bold text-[#30352a]">
            {user?.name ?? "Laundrify Staff"}
          </Text>

          <Text className="mt-2 text-sm leading-5 text-[#73776d]">
            Here's what's happening with your laundry today.
          </Text>
        </View>

        <View className="mb-7 rounded-3xl bg-[#8b9a6e] p-6">
          <Text className="text-sm font-medium text-white/75">
            Laundrify
          </Text>

          <Text className="mt-2 text-2xl font-bold text-white">
            Dashboard
          </Text>

          <Text className="mt-2 text-sm leading-5 text-white/80">
            Keep track of today's laundry operations at a glance.
          </Text>

          <View className="mt-6 border-t border-white/20 pt-5">
            <Text className="text-xs text-white/75">
              Total Orders
            </Text>

            <Text className="mt-1 text-3xl font-bold text-white">
              {orders.length}
            </Text>
          </View>
        </View>

        {error ? (
          <View className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <Text className="text-sm text-red-700">
              {error}
            </Text>
          </View>
        ) : null}

        <View className="mb-7">
          <View className="mb-4 flex-row items-end justify-between">
            <View>
              <Text className="text-xl font-bold text-[#30352a]">
                Overview
              </Text>

              <Text className="mt-1 text-xs text-[#73776d]">
                Your business at a glance
              </Text>
            </View>

            <View className="rounded-full bg-[#eae2d6] px-3 py-2">
              <Text className="text-xs font-semibold text-[#4b5141]">
                Today
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {[
              {
                title: "Active Orders",
                value: activeOrders,
                description: "Orders in progress",
              },
              {
                title: "Processing",
                value: processingOrders,
                description: "Currently processing",
              },
              {
                title: "Ready",
                value: readyOrders,
                description: "Ready for pickup",
              },
              {
                title: "Unpaid",
                value: unpaidOrders,
                description: "Awaiting payment",
              },
            ].map((item) => (
              <View
                key={item.title}
                className="mb-3 w-[48%] rounded-2xl border border-[#ded8cf] bg-white p-4"
              >
                <Text className="text-xs font-medium text-[#73776d]">
                  {item.title}
                </Text>

                <Text className="mt-2 text-3xl font-bold text-[#30352a]">
                  {item.value}
                </Text>

                <Text className="mt-1 text-xs text-[#73776d]">
                  {item.description}
                </Text>
              </View>
            ))}
          </View>

          {/* <View className="rounded-2xl border border-[#ded8cf] bg-white p-5">
            <Text className="text-sm font-medium text-[#73776d]">
              Today's Revenue
            </Text>

            <Text className="mt-2 text-2xl font-bold text-[#30352a]">
              {formatCurrency(todayRevenue)}
            </Text>

            <Text className="mt-1 text-xs text-[#73776d]">
              Total paid orders today
            </Text>
          </View> */}
        </View>

        <View className="mb-7">
          <View className="mb-4">
            <Text className="text-xl font-bold text-[#30352a]">
              Order Status
            </Text>

            <Text className="mt-1 text-xs text-[#73776d]">
              Current orders by status
            </Text>
          </View>

          <View className="overflow-hidden rounded-2xl border border-[#ded8cf] bg-white">
            {statusCards.map((item, index) => (
              <View
                key={item.title}
                className={`flex-row items-center justify-between px-4 py-4 ${
                  index !== statusCards.length - 1
                    ? "border-b border-[#eee9e2]"
                    : ""
                }`}
              >
                <Text className="text-sm font-medium text-[#4b5141]">
                  {item.title}
                </Text>

                <Text className="text-base font-semibold text-[#30352a]">
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mb-7">
          <View className="mb-4">
            <Text className="text-xl font-bold text-[#30352a]">
              Best Sellers
            </Text>

            <Text className="mt-1 text-xs text-[#73776d]">
              Top service in each category
            </Text>
          </View>

          {bestSellers.map((item) => (
            <View
              key={item.category}
              className="mb-3 rounded-2xl border border-[#ded8cf] bg-white p-4"
            >
              <Text className="text-xs font-medium text-[#73776d]">
                {item.label}
              </Text>

              {item.service !== null ? (
                <>
                  <Text className="mt-2 text-base font-semibold text-[#30352a]">
                    {item.service.name}
                  </Text>

                  <View className="mt-3 flex-row items-center justify-between">
                    <Text className="text-xs text-[#73776d]">
                      {item.soldQuantity} sold
                    </Text>

                    <Text className="text-sm font-semibold text-[#30352a]">
                      {formatCurrency(Number(item.service.price))}
                    </Text>
                  </View>

                  <Text
                    className={`mt-2 self-start text-xs ${
                      item.service.isActive
                        ? "text-[#68764f]"
                        : "text-[#9a5d4d]"
                    }`}
                  >
                    {item.service.isActive ? "Active" : "Inactive"}
                  </Text>
                </>
              ) : (
                <Text className="mt-3 text-sm text-[#73776d]">
                  No sales yet
                </Text>
              )}
            </View>
          ))}
        </View>

        <View>
          <View className="mb-4 flex-row items-end justify-between">
            <View>
              <Text className="text-xl font-bold text-[#30352a]">
                Recent Orders
              </Text>

              <Text className="mt-1 text-xs text-[#73776d]">
                Latest laundry transactions
              </Text>
            </View>

            <Pressable
              onPress={() => navigation.navigate("Orders")}
              className="rounded-xl bg-[#eae2d6] px-3 py-2"
            >
              <Text className="text-sm font-semibold text-[#4b5141]">
                See All
              </Text>
            </Pressable>
          </View>

          {recentOrders.length === 0 ? (
            <View className="items-center rounded-2xl border border-[#ded8cf] bg-white px-5 py-10">
              <Text className="text-base font-semibold text-[#30352a]">
                No recent orders
              </Text>

              <Text className="mt-1 text-center text-sm text-[#73776d]">
                New orders will appear here.
              </Text>
            </View>
          ) : (
            recentOrders.map((order) => (
              <Pressable
                key={order.id}
                onPress={() =>
                  navigation.navigate("OrderDetail", {
                    orderId: order.id,
                  })
                }
                className="mb-3 rounded-2xl border border-[#ded8cf] bg-white p-4"
              >
                <View className="flex-row items-start justify-between">
                  <View className="mr-3 flex-1">
                    <Text className="text-sm font-bold text-[#30352a]">
                      {order.orderCode}
                    </Text>

                    <Text className="mt-1 text-sm text-[#73776d]">
                      {order.customer.name}
                    </Text>

                    <Text className="mt-1 text-xs text-[#9a9d94]">
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>

                  <View className="items-end">
                    <View className="rounded-full bg-[#eae2d6] px-3 py-1.5">
                      <Text className="text-xs font-semibold text-[#4b5141]">
                        {getStatusLabel(order.orderStatus)}
                      </Text>
                    </View>

                    <Text
                      className={`mt-2 text-xs font-semibold ${
                        order.paymentStatus === "SUDAH_DIBAYAR"
                          ? "text-[#68764f]"
                          : "text-[#9a5d4d]"
                      }`}
                    >
                      {order.paymentStatus === "SUDAH_DIBAYAR"
                        ? "Paid"
                        : "Unpaid"}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 flex-row items-center justify-between border-t border-[#ded8cf] pt-3">
                  <View>
                    <Text className="text-xs text-[#73776d]">
                      Total
                    </Text>

                    <Text className="mt-1 text-base font-bold text-[#30352a]">
                      {formatCurrency(Number(order.total))}
                    </Text>
                  </View>

                  <Text className="text-xs font-semibold text-[#8b9a6e]">
                    View details
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}