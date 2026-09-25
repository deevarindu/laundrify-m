import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs" 
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CompositeScreenProps } from "@react-navigation/native";
import { MainTabParamList, MainStackParamList } from "../../navigation/mainNavigator"

import { useEffect, useState } from "react"
import { getOrders } from "../../services/orderService"
import type { Order } from "../../types/order"
import { View, Text, Button, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Orders">,
  NativeStackScreenProps<MainStackParamList>
>

export default function OrdersScreen({navigation}: Props) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  

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
    <SafeAreaView>
      <ScrollView className="mx-3">
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
            navigation.navigate("Services")
          }}
        />
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
      </ScrollView>
    </SafeAreaView>
  );
}