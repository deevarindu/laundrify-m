import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { MainTabParamList, MainStackParamList } from "../../navigation/mainNavigator";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { api } from "../../lib/api";
import type { Payment, PaymentMethod } from "../../types/payment";
import type { Order } from "../../types/order";
import type { Customer } from "../../types/customer";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList,"PaymentHistories">,
  NativeStackScreenProps<MainStackParamList>
>;

type MethodFilter = "ALL" | PaymentMethod;

export default function PaymentHistoriesScreen({navigation}: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const [
        paymentsResponse,
        ordersResponse,
        customersResponse,
      ] = await Promise.all([
        api.get("/payment"),
        api.get("/order"),
        api.get("/customer"),
      ]);

      setPayments(paymentsResponse.data.data);
      setOrders(ordersResponse.data.data);
      setCustomers(customersResponse.data.data);
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ??
            "Failed to load payments data."
        );
      } else {
        setError("Failed to load payments data.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        try {
          setIsLoading(true);
          setError("");

          const [
            paymentsResponse,
            ordersResponse,
            customersResponse,
          ] = await Promise.all([
            api.get("/payment"),
            api.get("/order"),
            api.get("/customer"),
          ]);

          if (!isActive) {
            return;
          }

          setPayments(paymentsResponse.data.data);
          setOrders(ordersResponse.data.data);
          setCustomers(customersResponse.data.data);
        } catch (error) {
          if (!isActive) {
            return;
          }

          console.error(error);

          if (axios.isAxiosError(error)) {
            setError(
              error.response?.data?.message ??
                "Failed to load payments data."
            );
          } else {
            setError("Failed to load payments data.");
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  //agar setiap melakukan perncarian dan filter method, tidak perlu melakukan perulangan lagi ke array payments, orders, dan customers. cukup memanggil filteredPayments saja
  const orderMap = useMemo(() => {
    return new Map(
      orders.map((order) => [
        order.id,
        order,
      ])
    );
  }, [orders]);

  const customerMap = useMemo(() => {
    return new Map(
      customers.map((customer) => [
        customer.id,
        customer.name,
      ])
    );
  }, [customers]);

  // payment yang ditampilkan setelah search dan filter diterapkan
  const filteredPayments = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return payments.filter((payment) => {
      const order = orderMap.get(payment.orderId);

      const customerName = order
        ? customerMap.get(order.customer.id) ??
          ""
        : "";

      const matchesSearch =
        payment.orderId
          .toString()
          .includes(normalizedSearch) ||
        (order?.orderCode ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        customerName
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesMethod =
        methodFilter === "ALL" ||
        payment.method === methodFilter;

      return (
        matchesSearch &&
        matchesMethod
      );
    });
  }, [
    payments,
    orders,
    customers,
    orderMap,
    customerMap,
    search,
    methodFilter,
  ]);

  const totalRevenue = useMemo(() => {
    return filteredPayments.reduce(
      (sum, payment) =>
        sum + Number(payment.amount),
      0
    );
  }, [filteredPayments]);

  const cashPayments = useMemo(() => {
    return filteredPayments.filter(
      (payment) =>
        payment.method === "CASH"
    ).length;
  }, [filteredPayments]);

  const transferPayments = useMemo(() => {
    return filteredPayments.filter(
      (payment) =>
        payment.method === "TRANSFER"
    ).length;
  }, [filteredPayments]);

  const qrisPayments = useMemo(() => {
    return filteredPayments.filter(
      (payment) =>
        payment.method === "QRIS"
    ).length;
  }, [filteredPayments]);

  const formatCurrency = (
    value: number | string
  ) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const formatDateTime = (
    value: string
  ) => {
    return new Date(value).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getOrder = (payment: Payment) => {
    return orderMap.get(payment.orderId);
  };

  const getCustomerName = (
    payment: Payment
  ) => {
    const order = getOrder(payment);

    if (!order) {
      return "Unknown Customer";
    }

    return (
      customerMap.get(order.customer.id) ??
      order.customer.name ??
      "Unknown Customer"
    );
  };

  const getOrderCode = (
    payment: Payment
  ) => {
    return (
      getOrder(payment)?.orderCode ??
      `Order #${payment.orderId}`
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f7f2eb]">
        <Text className="text-sm text-[#73776d]">
          Loading payments...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f2eb]">
      <Header
        title="Payments"
        onMenuPress={() =>
          setIsMenuOpen(true)
        }
      />

      <SideMenu
        visible={isMenuOpen}
        onClose={() =>
          setIsMenuOpen(false)
        }
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
          paddingBottom: 120,
        }}
      >
        <View className="mb-6 mt-4">
          <View className="flex-1 pr-4">
            <Text className="text-2xl font-bold text-[#30352a]">
              Payments
            </Text>

            <Text className="mt-1 text-sm leading-5 text-[#73776d]">
              View and monitor recorded payment transactions.
            </Text>
          </View>
        </View>

        {error ? (
          <View className="mb-5 rounded-2xl border border-[#e5c5c5] bg-white p-4">
            <Text className="text-sm text-[#b85c5c]">
              {error}
            </Text>
          </View>
        ) : null}

        <View className="mb-5">
          <View className="mb-3 rounded-2xl border border-[#ded8cf] bg-white p-5">
            <Text className="text-sm text-[#73776d]">
              Transactions
            </Text>

            <Text className="mt-3 text-3xl font-semibold text-[#4b5141]">
              {filteredPayments.length}
            </Text>
          </View>

          <View className="mb-3 rounded-2xl border border-[#ded8cf] bg-[#e7ecdd] p-5">
            <Text className="text-sm text-[#73776d]">
              Total Amount
            </Text>

            <Text className="mt-3 text-xl font-semibold text-[#4b5141]">
              {formatCurrency(totalRevenue)}
            </Text>
          </View>

          <View className="rounded-2xl border border-[#ded8cf] bg-[#eae2d6] p-5">
            <Text className="text-sm text-[#73776d]">
              Payment Methods
            </Text>

            <View className="mt-3 flex-row flex-wrap items-center">
              <Text className="text-sm font-semibold text-[#4b5141]">
                Cash{" "}
                <Text className="font-normal text-[#73776d]">
                  {cashPayments}
                </Text>
              </Text>

              <Text className="mx-3 text-[#c8c2b8]">
                •
              </Text>

              <Text className="text-sm font-semibold text-[#4b5141]">
                Transfer{" "}
                <Text className="font-normal text-[#73776d]">
                  {transferPayments}
                </Text>
              </Text>

              <Text className="mx-3 text-[#c8c2b8]">
                •
              </Text>

              <Text className="text-sm font-semibold text-[#4b5141]">
                QRIS{" "}
                <Text className="font-normal text-[#73776d]">
                  {qrisPayments}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-4 flex-row items-center rounded-2xl border border-[#ded8cf] bg-white px-4">
          <Ionicons
            name="search-outline"
            size={20}
            color="#73776d"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search order or customer..."
            placeholderTextColor="#a1a39d"
            className="ml-3 flex-1 py-3.5 text-sm text-[#30352a]"
          />
        </View>

        <View className="mb-5">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#73776d]">
            Payment Method
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {(
              [
                "ALL",
                "CASH",
                "TRANSFER",
                "QRIS",
              ] as MethodFilter[]
            ).map((method) => {
              const active =
                methodFilter === method;

              return (
                <Pressable
                  key={method}
                  onPress={() =>
                    setMethodFilter(method)
                  }
                  className={`mr-2 rounded-full px-4 py-2.5 ${
                    active
                      ? "bg-[#8b9a6e]"
                      : "border border-[#d8d2c9] bg-white"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      active
                        ? "text-white"
                        : "text-[#4b5141]"
                    }`}
                  >
                    {method === "ALL"
                      ? "All"
                      : method}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="overflow-hidden rounded-3xl border border-[#ded8cf] bg-white">
          <View className="border-b border-[#eae2d6] bg-[#faf8f4] px-5 py-4">
            <Text className="text-base font-semibold text-[#4b5141]">
              Payment History
            </Text>
            
            <Text className="mt-1 text-xs text-[#73776d]">
              {filteredPayments.length} transaction
              {filteredPayments.length !== 1
                ? "s"
                : ""}{" "}
              found
            </Text>
          </View>

          <View className="p-4">
            {filteredPayments.length === 0 ? (
              <View className="items-center rounded-2xl border border-dashed border-[#d8d2c9] bg-[#faf8f4] px-5 py-10">
                <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-[#eae2d6]">
                  <Ionicons
                    name="card-outline"
                    size={24}
                    color="#8b9a6e"
                  />
                </View>

                <Text className="text-sm font-semibold text-[#4b5141]">
                  No payment transactions
                </Text>

                <Text className="mt-1 text-center text-xs leading-5 text-[#73776d]">
                  Try searching with another
                  keyword or payment method.
                </Text>
              </View>
            ) : (
              filteredPayments.map(
                (payment) => (
                  <View
                    key={payment.id}
                    className="mb-2 rounded-2xl border border-[#e2ddd5] bg-[#fdfcfa] px-4 py-4"
                  >
                    <Pressable
                      key={payment.id}
                      onPress={() =>
                        navigation.navigate("OrderDetail", {
                          orderId: payment.id,
                        })
                      }
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-3">
                          <View className="flex-row flex-wrap items-center">
                            <Text className="text-sm font-semibold text-[#30352a]">
                              {getOrderCode(
                                payment
                              )}
                            </Text>

                            <View className="ml-2 rounded-full bg-[#8b9a6e] px-2 py-1">
                              <Text className="text-[10px] font-semibold text-white">
                                Paid
                              </Text>
                            </View>
                          </View>

                          <Text className="mt-2 text-sm font-medium text-[#4b5141]">
                            {getCustomerName(
                              payment
                            )}
                          </Text>

                          <Text className="mt-1 text-xs text-[#8a8d84]">
                            {formatDateTime(
                              payment.paidAt
                            )}
                          </Text>
                        </View>

                        <View className="items-end">
                          <View className="rounded-full bg-[#eae2d6] px-2.5 py-1">
                            <Text className="text-[10px] font-semibold text-[#4b5141]">
                              {payment.method}
                            </Text>
                          </View>

                          <Text className="mt-2 text-sm font-semibold text-[#4b5141]">
                            {formatCurrency(
                              payment.amount
                            )}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  </View>
                )
              )
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}