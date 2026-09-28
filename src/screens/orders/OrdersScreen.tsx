import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect, type CompositeScreenProps } from "@react-navigation/native";
import type {
  MainTabParamList,
  MainStackParamList,
} from "../../navigation/mainNavigator";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getOrders } from "../../services/orderService";
import { api } from "../../lib/api";
import type { Order } from "../../types/order";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Orders">,
  NativeStackScreenProps<MainStackParamList>
>;

type Payment = {
  id: number;
  orderId: number;
  amount: string;
  method: string;
  paidAt: string;
};

type OrderStatusFilter = "ALL" | Order["orderStatus"];
type PaymentStatusFilter = "ALL" | Order["paymentStatus"];

const statusLabels: Record<string, string> = {
  PESANAN_DITERIMA: "Received",
  DICUCI: "Washing",
  DIKERINGKAN: "Drying",
  DISETRIKA: "Ironing",
  SIAP_DIAMBIL: "Ready",
  SELESAI: "Completed",
  DIBATALKAN: "Cancelled",
};

const statuses: OrderStatusFilter[] = [
  "ALL",
  "PESANAN_DITERIMA",
  "DICUCI",
  "DIKERINGKAN",
  "DISETRIKA",
  "SIAP_DIAMBIL",
  "SELESAI",
  "DIBATALKAN",
];

const paymentStatuses: PaymentStatusFilter[] = [
  "ALL",
  "BELUM_DIBAYAR",
  "SUDAH_DIBAYAR",
];

const getStatusLabel = (status: string) => {
  return statusLabels[status] ?? status.replaceAll("_", " ");
};

const getPaymentLabel = (status: string) => {
  return status === "SUDAH_DIBAYAR" ? "Paid" : "Unpaid";
};

const formatCurrency = (value: number | string) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function OrdersScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<OrderStatusFilter>("ALL");
  const [paymentFilter, setPaymentFilter] =
    useState<PaymentStatusFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [ordersData, paymentsResponse] = await Promise.all([
          getOrders(),
          api.get("/payment"),
        ]);

        if (cancelled) {
          return;
        }

        setOrders(ordersData);
        setPayments(paymentsResponse.data.data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.log("gagal fetch orders:", error);
        setError("Failed to load orders data.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []));

  const paymentOrderIds = useMemo(() => {
    return new Set(payments.map((payment) => payment.orderId));
  }, [payments]);

  const activeOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.orderStatus !== "SELESAI" &&
        order.orderStatus !== "DIBATALKAN"
    ).length;
  }, [orders]);

  const unpaidOrders = useMemo(() => {
    return orders.filter(
      (order) => order.paymentStatus === "BELUM_DIBAYAR"
    ).length;
  }, [orders]);

  const readyOrders = useMemo(() => {
    return orders.filter(
      (order) => order.orderStatus === "SIAP_DIAMBIL"
    ).length;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName = order.customer.name.toLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 ||
        order.orderCode.toLowerCase().includes(normalizedSearch) ||
        customerName.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        order.orderStatus === statusFilter;

      const matchesPayment =
        paymentFilter === "ALL" ||
        order.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f7f2eb]">
        <Text className="text-sm text-[#73776d]">
          Loading orders...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f2eb]">
      <Header
        title="Orders"
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

        <View className="flex-row items-start justify-between mb-6 mt-5">
          <View className="flex-1 pr-4">
            <Text className="text-2xl font-bold text-[#30352a]">
              Orders
            </Text>

            <Text className="mt-1 text-sm text-[#73776d]">
              Manage laundry orders and monitor their progress.
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate("CreateOrder")}
            className="h-11 w-11 items-center justify-center rounded-xl bg-[#8b9a6e]"
          >
            <Ionicons
              name="add"
              size={25}
              color="#ffffff"
            />
          </Pressable>
        </View>

        {error ? (
          <View className="mb-5 rounded-2xl border border-[#e5c5c5] bg-white p-4">
            <Text className="text-sm text-[#b85c5c]">
              {error}
            </Text>
          </View>
        ) : null}

        <View className="mb-5 flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-[#ded8cf] bg-white p-4">
            <Text className="text-xs text-[#73776d]">
              Total Orders
            </Text>

            <Text className="mt-2 text-2xl font-semibold text-[#4b5141]">
              {orders.length}
            </Text>
          </View>

          <View className="flex-1 rounded-2xl border border-[#ded8cf] bg-[#e7ecdd] p-4">
            <Text className="text-xs text-[#73776d]">
              Active Orders
            </Text>

            <Text className="mt-2 text-2xl font-semibold text-[#4b5141]">
              {activeOrders}
            </Text>
          </View>
        </View>

        <View className="mb-5 flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-[#ded8cf] bg-[#eae2d6] p-4">
            <Text className="text-xs text-[#73776d]">
              Unpaid Orders
            </Text>

            <Text className="mt-2 text-2xl font-semibold text-[#4b5141]">
              {unpaidOrders}
            </Text>
          </View>

          <View className="flex-1 rounded-2xl border border-[#ded8cf] bg-white p-4">
            <Text className="text-xs text-[#73776d]">
              Ready
            </Text>

            <Text className="mt-2 text-2xl font-semibold text-[#4b5141]">
              {readyOrders}
            </Text>
          </View>
        </View>

        <View className="mb-4 rounded-2xl border border-[#ded8cf] bg-white px-4">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search order or customer..."
            placeholderTextColor="#a1a39d"
            className="py-3.5 text-sm text-[#30352a]"
          />
        </View>

        <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#73776d]">
          Order Status
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5"
        >
          {statuses.map((status) => {
            const isSelected = statusFilter === status;

            return (
              <Pressable
                key={status}
                onPress={() => setStatusFilter(status)}
                className={`mr-2 rounded-full px-4 py-2.5 ${
                  isSelected
                    ? "bg-[#8b9a6e]"
                    : "border border-[#ded8cf] bg-white"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected
                      ? "text-white"
                      : "text-[#4b5141]"
                  }`}
                >
                  {status === "ALL"
                    ? "All"
                    : getStatusLabel(status)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#73776d]">
          Payment Status
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          {paymentStatuses.map((status) => {
            const isSelected = paymentFilter === status;

            return (
              <Pressable
                key={status}
                onPress={() => setPaymentFilter(status)}
                className={`mr-2 rounded-full px-4 py-2.5 ${
                  isSelected
                    ? "bg-[#8b9a6e]"
                    : "border border-[#ded8cf] bg-white"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected
                      ? "text-white"
                      : "text-[#4b5141]"
                  }`}
                >
                  {status === "ALL"
                    ? "All"
                    : getPaymentLabel(status)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-bold text-[#30352a]">
              Order List
            </Text>

            <Text className="mt-1 text-xs text-[#73776d]">
              {filteredOrders.length} order
              {filteredOrders.length !== 1 ? "s" : ""} found
            </Text>
          </View>

          <View className="rounded-lg bg-[#e7ecdd] px-3 py-1.5">
            <Text className="text-xs font-medium text-[#4b5141]">
              Ready: {readyOrders}
            </Text>
          </View>
        </View>

        {filteredOrders.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-[#d8d2c9] bg-white px-6 py-10">
            <Text className="text-center text-sm text-[#73776d]">
              No orders found.
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const hasPayment = paymentOrderIds.has(order.id);

            return (
              <Pressable
                key={order.id}
                onPress={() =>
                  navigation.navigate("OrderDetail", {
                    orderId: order.id,
                  })
                }
                className="mb-3 rounded-2xl border border-[#e2ddd5] bg-[#fdfcfa] p-4"
              >
                <View className="flex-row items-start justify-between">
                  <View className="mr-3 min-w-0 flex-1">
                    <View className="flex-row flex-wrap items-center gap-2">
                      <Text className="text-sm font-semibold text-[#30352a]">
                        {order.orderCode}
                      </Text>

                      <View className="rounded-full bg-[#eae2d6] px-2.5 py-1">
                        <Text className="text-[11px] font-medium text-[#4b5141]">
                          {getStatusLabel(order.orderStatus)}
                        </Text>
                      </View>
                    </View>

                    <View className="mt-2 flex-row items-center">
                      <Text className="text-sm font-medium text-[#4b5141]">
                        {order.customer.name}
                      </Text>

                      <Text className="mx-2 text-[#d0cbc2]">
                        •
                      </Text>

                      <Text className="text-xs text-[#8a8d84]">
                        {formatDate(order.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="mt-4 border-t border-[#e2ddd5] pt-3">
                  <View className="flex-row items-end justify-between">
                    <View>
                      <Text className="text-xs text-[#73776d]">
                        Total
                      </Text>

                      <Text className="mt-1 text-base font-semibold text-[#4b5141]">
                        {formatCurrency(order.total)}
                      </Text>

                      {hasPayment ? (
                        <Text className="mt-1 text-[11px] text-[#8b9a6e]">
                          Payment recorded
                        </Text>
                      ) : null}
                    </View>

                    <View
                      className={`rounded-full px-3 py-1.5 ${
                        order.paymentStatus === "SUDAH_DIBAYAR"
                          ? "bg-[#8b9a6e]"
                          : "bg-[#eeeeee]"
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-semibold ${
                          order.paymentStatus === "SUDAH_DIBAYAR"
                            ? "text-white"
                            : "text-[#73776d]"
                        }`}
                      >
                        {getPaymentLabel(order.paymentStatus)}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-3 flex-row justify-end">
                    <Text className="text-xs font-semibold text-[#8b9a6e]">
                      View details
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}