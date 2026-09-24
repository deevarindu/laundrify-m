import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../navigation/mainNavigator";
import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { getOrderById } from "../../services/orderService";
import { Order } from "../../types/order";

type Props = NativeStackScreenProps<MainStackParamList, "OrderDetail">

export default function OrderDetailScreen({route}: Props) {
  const {orderId} = route.params
  const [order, setOrder] = useState<Order | null>(null);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const order = await getOrderById(orderId);

        setOrder(order);
        console.log("berhasil fetch order", order)
      } catch (error) {
        console.log("gagal fetch order", error)
      }
    }
    fetchOrder();
  }, [])

  return (
    <View>
      <Text>Order Id: {orderId}</Text>
      <Text>{order?.orderCode}</Text>
      <Text>{order?.customer.name}</Text>
    </View>
  )
}