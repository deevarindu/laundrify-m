import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../navigation/mainNavigator";

import { View, Text } from "react-native";
import { useEffect, useState } from "react";

import { getOrderById } from "../../services/orderService";
import type { Order } from "../../types/order";

type Props = NativeStackScreenProps<
  MainStackParamList,
  "OrderDetail"
>;

export default function OrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const order = await getOrderById(orderId);

        setOrder(order);
        console.log("berhasil fetch order:", order);
      } catch (error) {
        console.log("gagal fetch order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <View>
        <Text>Loading order...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View>
        <Text>Order not found.</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Order Detail</Text>

      <Text>Order Code: {order.orderCode}</Text>
      <Text>Customer: {order.customer.name}</Text>
      <Text>Phone: {order.customer.phone}</Text>
      <Text>Status: {order.orderStatus}</Text>
      <Text>Payment Status: {order.paymentStatus}</Text>
      <Text>Subtotal: Rp {Number(order.subtotal).toLocaleString("id-ID")}</Text>
      <Text>Discount: Rp {Number(order.discount).toLocaleString("id-ID")}</Text>
      <Text>Total: Rp {Number(order.total).toLocaleString("id-ID")}</Text>
      <Text>Due Date: {order.dueAt ?? "-"}</Text>
      <Text>Created At: {order.createdAt}</Text>
      <Text>Created By: {order.user.name}</Text>
      <Text>
        Payment:{" "}
        {order.payment
          ? `${order.payment.method} - Rp ${Number(
              order.payment.amount
            ).toLocaleString("id-ID")}`
          : "Belum ada pembayaran"}
      </Text>
    </View>
  );
}