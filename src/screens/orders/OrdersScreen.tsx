import { BottomTabScreenProps } from "@react-navigation/bottom-tabs" 
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CompositeScreenProps } from "@react-navigation/native";
import { MainTabParamList, MainStackParamList } from "../../navigation/mainNavigator"

import { useEffect, useState } from "react"
import { getOrders } from "../../services/orderService"
import type { Order } from "../../types/order"
import { View, Text, Button } from "react-native"

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Orders">,
  NativeStackScreenProps<MainStackParamList>
>

export default function OrdersScreen({navigation}: Props) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async() => {
      try {
        const orders = await getOrders();

        setOrders(orders);
        console.log("berhasil fetch data orders:", orders)
      } catch (error) {
        console.log("gagal fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [])

  if (isLoading) {
    return (
      <View>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View>
        <Text>No orders yet.</Text>
      </View>
    );
  }
  
  return (
    <View>
      {orders.map((order) => (
        <View key={order.id}>
          <Text>{order.orderCode}</Text>
          <Text>{order.customer.name}</Text>
          <Text>{order.orderStatus}</Text>
          <Text>{order.paymentStatus}</Text>
          <Text>Rp {order.total}</Text>
          
          <Button
            title="View Order Detail"
            onPress={async () => navigation.navigate("OrderDetail", {
              orderId: order.id
            })}
          />
        </View>
      ))}
    </View>
  );
}