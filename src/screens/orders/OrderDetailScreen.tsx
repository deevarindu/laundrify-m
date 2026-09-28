import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../navigation/mainNavigator";

import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOrderById } from "../../services/orderService";
import { api } from "../../lib/api";
import type { Order } from "../../types/order";

type Props = NativeStackScreenProps<
  MainStackParamList,
  "OrderDetail"
>;

type PaymentMethod = "CASH" | "TRANSFER" | "QRIS";

type Payment = {
  id: number;
  orderId: number;
  amount: string;
  method: PaymentMethod;
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

const statusFlow: OrderStatus[] = [
  "PESANAN_DITERIMA",
  "DICUCI",
  "DIKERINGKAN",
  "DISETRIKA",
  "SIAP_DIAMBIL",
  "SELESAI",
];

const statusLabels: Record<string, string> = {
  PESANAN_DITERIMA: "Received",
  DICUCI: "Washing",
  DIKERINGKAN: "Drying",
  DISETRIKA: "Ironing",
  SIAP_DIAMBIL: "Ready",
  SELESAI: "Completed",
  DIBATALKAN: "Cancelled",
};

const paymentMethods: PaymentMethod[] = [
  "CASH",
  "TRANSFER",
  "QRIS",
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
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OrderDetailScreen({
  route,
  navigation,
}: Props) {
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH");
  const [paymentPaidAt, setPaymentPaidAt] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getOrderById(orderId);

        if (cancelled) {
          return;
        }

        setOrder(data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.log("gagal fetch order:", error);
        setError("Failed to load order detail.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const nextStatus = useMemo(() => {
    if (!order) {
      return null;
    }

    const currentIndex = statusFlow.indexOf(
      order.orderStatus as OrderStatus
    );

    if (currentIndex === -1) {
      return null;
    }

    return statusFlow[currentIndex + 1] ?? null;
  }, [order]);

  const canAdvanceStatus =
    !!order &&
    !!nextStatus &&
    order.orderStatus !== "DIBATALKAN" &&
    order.orderStatus !== "SELESAI" &&
    !(
      order.orderStatus === "SIAP_DIAMBIL" &&
      order.paymentStatus !== "SUDAH_DIBAYAR"
    );

  const canRecordPayment =
    !!order &&
    order.paymentStatus === "BELUM_DIBAYAR" &&
    order.orderStatus !== "DIBATALKAN";

  const canCancelOrder =
    !!order &&
    order.orderStatus === "PESANAN_DITERIMA";

  const handleAdvanceStatus = async () => {
    if (!order || !nextStatus) {
      return;
    }

    try {
      setStatusSubmitting(true);
      setActionError("");

      const response = await api.patch(
        `/order/${order.id}/status`,
        {
          status: nextStatus,
        }
      );

      setOrder(response.data.data);
    } catch (error) {
      console.log("gagal update status:", error);
      setActionError("Failed to update order status.");
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (
      !order ||
      order.orderStatus !== "PESANAN_DITERIMA"
    ) {
      return;
    }

    try {
      setStatusSubmitting(true);
      setActionError("");

      const response = await api.patch(
        `/order/${order.id}/status`,
        {
          status: "DIBATALKAN",
          note: "Order cancelled.",
        }
      );

      setOrder(response.data.data);
    } catch (error) {
      console.log("gagal cancel order:", error);
      setActionError(
        "Order can only be cancelled before processing starts."
      );
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!order) {
      return;
    }

    try {
      setPaymentSubmitting(true);
      setActionError("");

      const response = await api.post("/payment", {
        orderId: order.id,
        amount: Number(order.total),
        method: paymentMethod,
        paidAt: paymentPaidAt || undefined,
      });

      const payment = response.data.data as Payment;

      setOrder((currentOrder) => {
        if (!currentOrder) {
          return currentOrder;
        }

        return {
          ...currentOrder,
          payment,
          paymentStatus: "SUDAH_DIBAYAR",
        };
      });

      setPaymentFormOpen(false);
      setPaymentMethod("CASH");
      setPaymentPaidAt("");
    } catch (error) {
      console.log("gagal record payment:", error);
      setActionError("Failed to record payment.");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f7f2eb]">
        <Text className="text-sm text-[#73776d]">
          Loading order...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView className="flex-1 bg-[#f7f2eb]">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-lg font-bold text-[#30352a]">
            {error || "Order not found."}
          </Text>

          <Text className="mt-2 text-center text-sm text-[#73776d]">
            The order could not be loaded.
          </Text>

          <Pressable
            onPress={() => navigation.goBack()}
            className="mt-5 rounded-xl bg-[#8b9a6e] px-5 py-3"
          >
            <Text className="text-sm font-semibold text-white">
              Back to Orders
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f2eb]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <View className="flex-row items-center px-5 pb-4 pt-3">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white"
          >
            <Text className="text-xl font-medium text-[#30352a]">
              ‹
            </Text>
          </Pressable>

          <View className="flex-1">
            <Text className="text-xl font-bold text-[#30352a]">
              Order Detail
            </Text>

            <Text className="mt-0.5 text-xs text-[#73776d]">
              {order.orderCode}
            </Text>
          </View>
        </View>

        <View className="px-5">
          <View className="mb-4 rounded-3xl bg-[#8b9a6e] p-5">
            <View className="flex-row items-start justify-between">
              <View className="mr-3 flex-1">
                <Text className="text-xs font-medium uppercase tracking-wider text-white/70">
                  Order Status
                </Text>

                <Text className="mt-2 text-2xl font-bold text-white">
                  {getStatusLabel(order.orderStatus)}
                </Text>

                <Text className="mt-2 text-xs text-white/70">
                  Created {formatDateTime(order.createdAt)}
                </Text>
              </View>

              <View
                className={`rounded-full px-3 py-2 ${
                  order.paymentStatus === "SUDAH_DIBAYAR"
                    ? "bg-white"
                    : "bg-white/20"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    order.paymentStatus === "SUDAH_DIBAYAR"
                      ? "text-[#4b5141]"
                      : "text-white"
                  }`}
                >
                  {getPaymentLabel(order.paymentStatus)}
                </Text>
              </View>
            </View>
          </View>

          {actionError ? (
            <View className="mb-4 rounded-2xl border border-[#d8caca] bg-[#f4e7e3] px-4 py-3">
              <Text className="text-sm text-[#b85c5c]">
                {actionError}
              </Text>
            </View>
          ) : null}

          <View className="mb-4 rounded-2xl border border-[#ded8cf] bg-white p-5">
            <Text className="text-lg font-bold text-[#30352a]">
              Customer
            </Text>

            <Text className="mt-4 text-base font-semibold text-[#30352a]">
              {order.customer.name}
            </Text>

            <Text className="mt-1 text-sm text-[#4b5141]">
              {order.customer.phone}
            </Text>

            <Text className="mt-1 text-sm leading-5 text-[#73776d]">
              {order.customer.address || "-"}
            </Text>
          </View>

          <View className="mb-4 rounded-2xl border border-[#ded8cf] bg-white p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-[#30352a]">
                Order Items
              </Text>

              <Text className="text-xs text-[#73776d]">
                {order.orderItems.length} item
                {order.orderItems.length !== 1 ? "s" : ""}
              </Text>
            </View>

            {order.orderItems.map((item, index) => (
              <View
                key={item.id}
                className={`py-4 ${
                  index !== order.orderItems.length - 1
                    ? "border-b border-[#ded8cf]"
                    : ""
                }`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="mr-3 flex-1">
                    <Text className="text-base font-semibold text-[#30352a]">
                      {item.service.name}
                    </Text>

                    <Text className="mt-1 text-xs text-[#73776d]">
                      {item.service.category}
                    </Text>
                  </View>

                  <Text className="text-sm font-bold text-[#30352a]">
                    {formatCurrency(item.subtotal)}
                  </Text>
                </View>

                <Text className="mt-3 text-xs text-[#73776d]">
                  {item.quantity} ×{" "}
                  {formatCurrency(item.priceSnapshot)}
                </Text>
              </View>
            ))}
          </View>

          <View className="mb-4 rounded-2xl border border-[#ded8cf] bg-white p-5">
            <Text className="mb-4 text-lg font-bold text-[#30352a]">
              Order Summary
            </Text>

            <View className="flex-row justify-between">
              <Text className="text-sm text-[#73776d]">
                Subtotal
              </Text>

              <Text className="text-sm font-medium text-[#30352a]">
                {formatCurrency(order.subtotal)}
              </Text>
            </View>

            <View className="mt-3 flex-row justify-between">
              <Text className="text-sm text-[#73776d]">
                Discount
              </Text>

              <Text className="text-sm font-medium text-[#30352a]">
                - {formatCurrency(order.discount)}
              </Text>
            </View>

            <View className="my-4 border-t border-[#ded8cf]" />

            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-[#30352a]">
                Total
              </Text>

              <Text className="text-xl font-bold text-[#8b9a6e]">
                {formatCurrency(order.total)}
              </Text>
            </View>
          </View>

          <View className="mb-4 rounded-2xl border border-[#ded8cf] bg-white p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-[#30352a]">
                Payment
              </Text>

              <View
                className={`rounded-full px-3 py-1.5 ${
                  order.payment
                    ? "bg-[#8b9a6e]"
                    : "bg-[#eeeeee]"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    order.payment
                      ? "text-white"
                      : "text-[#73776d]"
                  }`}
                >
                  {order.payment ? "Paid" : "Unpaid"}
                </Text>
              </View>
            </View>

            {order.payment ? (
              <View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-[#73776d]">
                    Amount
                  </Text>

                  <Text className="text-sm font-semibold text-[#30352a]">
                    {formatCurrency(order.payment.amount)}
                  </Text>
                </View>

                <View className="mt-3 flex-row justify-between">
                  <Text className="text-sm text-[#73776d]">
                    Method
                  </Text>

                  <Text className="text-sm font-semibold text-[#30352a]">
                    {order.payment.method}
                  </Text>
                </View>

                <View className="mt-3 flex-row justify-between">
                  <Text className="text-sm text-[#73776d]">
                    Paid At
                  </Text>

                  <Text className="ml-4 flex-1 text-right text-sm text-[#30352a]">
                    {formatDateTime(order.payment.paidAt)}
                  </Text>
                </View>
              </View>
            ) : (
              <View>
                <Text className="text-sm leading-6 text-[#73776d]">
                  This order has not been paid yet.
                </Text>

                {canRecordPayment ? (
                  <Pressable
                    onPress={() => {
                      setActionError("");
                      setPaymentFormOpen(true);
                    }}
                    className="mt-4 items-center rounded-xl bg-[#8b9a6e] px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-white">
                      Record Payment
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            )}
          </View>

          {paymentFormOpen ? (
            <View className="mb-4 rounded-2xl border border-[#ded8cf] bg-[#faf8f4] p-5">
              <Text className="text-lg font-bold text-[#30352a]">
                Record Payment
              </Text>

              <View className="mt-4 rounded-2xl bg-[#eae2d6] p-4">
                <Text className="text-xs font-medium uppercase tracking-wider text-[#73776d]">
                  Amount
                </Text>

                <Text className="mt-1 text-xl font-semibold text-[#4b5141]">
                  {formatCurrency(order.total)}
                </Text>
              </View>

              <Text className="mb-2 mt-5 text-sm font-medium text-[#4b5141]">
                Payment Method
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {paymentMethods.map((method) => {
                  const selected = paymentMethod === method;

                  return (
                    <Pressable
                      key={method}
                      onPress={() => setPaymentMethod(method)}
                      className={`rounded-xl px-4 py-3 ${
                        selected
                          ? "bg-[#8b9a6e]"
                          : "border border-[#d8d2c9] bg-white"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          selected
                            ? "text-white"
                            : "text-[#4b5141]"
                        }`}
                      >
                        {method}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text className="mb-2 mt-5 text-sm font-medium text-[#4b5141]">
                Payment Date
              </Text>

              <TextInput
                value={paymentPaidAt}
                onChangeText={setPaymentPaidAt}
                placeholder="Optional"
                placeholderTextColor="#a1a39d"
                className="rounded-xl border border-[#d8d2c9] bg-white px-4 py-3 text-sm text-[#30352a]"
              />

              <View className="mt-5 flex-row gap-3">
                <Pressable
                  onPress={() => {
                    setPaymentFormOpen(false);
                    setPaymentPaidAt("");
                    setPaymentMethod("CASH");
                  }}
                  disabled={paymentSubmitting}
                  className="flex-1 items-center rounded-xl border border-[#d8d2c9] bg-white py-3"
                >
                  <Text className="text-sm font-semibold text-[#4b5141]">
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleRecordPayment}
                  disabled={paymentSubmitting}
                  className={`flex-1 items-center rounded-xl bg-[#8b9a6e] py-3 ${
                    paymentSubmitting ? "opacity-60" : ""
                  }`}
                >
                  <Text className="text-sm font-semibold text-white">
                    {paymentSubmitting
                      ? "Saving..."
                      : "Record Payment"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View className="mb-4 rounded-2xl border border-[#ded8cf] bg-white p-5">
            <Text className="mb-4 text-lg font-bold text-[#30352a]">
              Order Information
            </Text>

            <View className="flex-row justify-between">
              <Text className="text-sm text-[#73776d]">
                Due Date
              </Text>

              <Text className="ml-4 flex-1 text-right text-sm font-medium text-[#30352a]">
                {order.dueAt
                  ? formatDateTime(order.dueAt)
                  : "-"}
              </Text>
            </View>

            <View className="mt-3 flex-row justify-between">
              <Text className="text-sm text-[#73776d]">
                Created At
              </Text>

              <Text className="ml-4 flex-1 text-right text-sm font-medium text-[#30352a]">
                {formatDateTime(order.createdAt)}
              </Text>
            </View>

            <View className="mt-3 flex-row justify-between">
              <Text className="text-sm text-[#73776d]">
                Created By
              </Text>

              <Text className="ml-4 flex-1 text-right text-sm font-medium text-[#30352a]">
                {order.user.name}
              </Text>
            </View>
          </View>

          <View className="mb-4 rounded-2xl border border-[#ded8cf] bg-white p-5">
            <Text className="mb-5 text-lg font-bold text-[#30352a]">
              Status Workflow
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {statusFlow.map((status, index) => {
                const currentIndex = statusFlow.indexOf(
                  order.orderStatus as OrderStatus
                );

                const completed =
                  currentIndex >= index &&
                  order.orderStatus !== "DIBATALKAN";

                const active = order.orderStatus === status;

                return (
                  <View
                    key={status}
                    className="mr-3 flex-row items-center"
                  >
                    <View
                      className={`rounded-xl px-3 py-2 ${
                        active
                          ? "bg-[#8b9a6e]"
                          : completed
                            ? "bg-[#e7ecdd]"
                            : "bg-[#eeeeee]"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          active
                            ? "text-white"
                            : completed
                              ? "text-[#4b5141]"
                              : "text-[#8a8d84]"
                        }`}
                      >
                        {statusLabels[status]}
                      </Text>
                    </View>

                    {index < statusFlow.length - 1 ? (
                      <Text className="ml-3 text-[#b7b8b1]">
                        →
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </ScrollView>

            {order.orderStatus === "DIBATALKAN" ? (
              <View className="mt-4 rounded-full bg-[#b85c5c] self-start px-3 py-1.5">
                <Text className="text-xs font-semibold text-white">
                  Cancelled
                </Text>
              </View>
            ) : null}

            <View className="mt-6 gap-3">
              {canAdvanceStatus ? (
                <Pressable
                  onPress={handleAdvanceStatus}
                  disabled={statusSubmitting}
                  className={`items-center rounded-xl bg-[#8b9a6e] py-3 ${
                    statusSubmitting ? "opacity-60" : ""
                  }`}
                >
                  <Text className="text-sm font-semibold text-white">
                    {statusSubmitting
                      ? "Updating..."
                      : `Move to ${getStatusLabel(nextStatus)}`}
                  </Text>
                </Pressable>
              ) : null}

              {canCancelOrder ? (
                <Pressable
                  onPress={handleCancelOrder}
                  disabled={statusSubmitting}
                  className={`items-center rounded-xl bg-[#b85c5c] py-3 ${
                    statusSubmitting ? "opacity-60" : ""
                  }`}
                >
                  <Text className="text-sm font-semibold text-white">
                    {statusSubmitting
                      ? "Cancelling..."
                      : "Cancel Order"}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {order.orderStatus === "SIAP_DIAMBIL" &&
            order.paymentStatus !== "SUDAH_DIBAYAR" ? (
              <Text className="mt-4 rounded-xl bg-[#eae2d6] px-4 py-3 text-sm leading-5 text-[#5d6253]">
                Order can only be completed after full payment is recorded.
              </Text>
            ) : null}
          </View>

          <View className="rounded-2xl border border-[#ded8cf] bg-white p-5">
            <Text className="mb-5 text-lg font-bold text-[#30352a]">
              Status History
            </Text>

            {order.orderStatusHistories.length === 0 ? (
              <View className="rounded-xl border border-dashed border-[#d8d2c9] bg-[#faf8f4] px-5 py-8">
                <Text className="text-center text-sm text-[#73776d]">
                  No status history found.
                </Text>
              </View>
            ) : (
              order.orderStatusHistories.map((history, index) => (
                <View
                  key={history.id}
                  className={`flex-row ${
                    index !== order.orderStatusHistories.length - 1
                      ? "pb-5"
                      : ""
                  }`}
                >
                  <View className="mr-4 items-center">
                    <View className="h-3 w-3 rounded-full bg-[#8b9a6e]" />

                    {index !==
                    order.orderStatusHistories.length - 1 ? (
                      <View className="mt-1 w-px flex-1 bg-[#ded8cf]" />
                    ) : null}
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-start justify-between">
                      <Text className="mr-3 flex-1 text-sm font-bold text-[#30352a]">
                        {getStatusLabel(history.orderStatus)}
                      </Text>

                      <Text className="text-xs text-[#73776d]">
                        {formatDateTime(history.changedAt)}
                      </Text>
                    </View>

                    <Text className="mt-1 text-sm text-[#73776d]">
                      {history.note ?? "-"}
                    </Text>

                    <Text className="mt-1 text-xs text-[#73776d]">
                      Changed by {history.user.name}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}