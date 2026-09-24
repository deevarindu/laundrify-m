import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { MainTabParamList, MainStackParamList } from "../../navigation/mainNavigator";
import { getOrders } from "../../services/orderService";
import { getDashboardStats } from "../../utils/dashboard";
import { useAuthStore } from "../../store/authStore";
import type { Order } from "../../types/order";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Dashboard">,
  NativeStackScreenProps<MainStackParamList>
>;

type DashboardStats = {
  activeOrders: number;
  processing: number;
  ready: number;
  unpaid: number;
  todayRevenue: number;
};

export default function DashboardScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);

  const [orders, setOrders] = useState<Order[]>([]);

  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    processing: 0,
    ready: 0,
    unpaid: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const orders = await getOrders();

        setOrders(orders);

        const dashboardStats = getDashboardStats(orders);

        setStats(dashboardStats);
      } catch (error) {
        console.log("GAGAL FETCH DASHBOARD:", error);
      }
    };

    fetchDashboard();
  }, []);

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <ScrollView className="flex-1 bg-gray-50 px-6 pt-12">
      {/* Header */}
      <Text className="text-xl font-light text-gray-500">
        Welcome back, {user?.name}
      </Text>

      <Text className="mt-3 text-3xl font-bold text-gray-900">
        Dashboard
      </Text>

      {/* Statistics */}
      <View className="mt-8 flex-row flex-wrap justify-between">
        <View className="mb-4 w-[48%] rounded-2xl bg-white p-5">
          <Text className="text-sm text-gray-500">
            Active Orders
          </Text>

          <Text className="mt-2 text-3xl font-bold text-gray-900">
            {stats.activeOrders}
          </Text>
        </View>

        <View className="mb-4 w-[48%] rounded-2xl bg-white p-5">
          <Text className="text-sm text-gray-500">
            Processing
          </Text>

          <Text className="mt-2 text-3xl font-bold text-gray-900">
            {stats.processing}
          </Text>
        </View>

        <View className="mb-4 w-[48%] rounded-2xl bg-white p-5">
          <Text className="text-sm text-gray-500">
            Ready
          </Text>

          <Text className="mt-2 text-3xl font-bold text-gray-900">
            {stats.ready}
          </Text>
        </View>

        <View className="mb-4 w-[48%] rounded-2xl bg-white p-5">
          <Text className="text-sm text-gray-500">
            Unpaid
          </Text>

          <Text className="mt-2 text-3xl font-bold text-gray-900">
            {stats.unpaid}
          </Text>
        </View>
      </View>

      {/* Today's Revenue */}
      <View className="mb-8 rounded-2xl bg-white p-5">
        <Text className="text-sm text-gray-500">
          Today's Revenue
        </Text>

        <Text className="mt-2 text-3xl font-bold text-gray-900">
          Rp {stats.todayRevenue.toLocaleString("id-ID")}
        </Text>
      </View>

      {/* Recent Orders */}
      <View className="mt-2">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-900">
            Recent Orders
          </Text>

          <Pressable
            onPress={() => navigation.navigate("Orders")}
          >
            <Text className="font-semibold text-blue-600">
              See All &gt;&gt;
            </Text>
          </Pressable>
        </View>

        {recentOrders.map((order) => (
          <Pressable
            key={order.id}
            onPress={() =>
              navigation.navigate("OrderDetail", {
                orderId: order.id,
              })
            }
            className="mb-3 rounded-2xl bg-white p-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-gray-900">
                {order.orderCode}
              </Text>

              <Text className="text-sm text-gray-500">
                {order.orderStatus}
              </Text>
            </View>

            <Text className="mt-2 text-gray-600">
              {order.customer.name}
            </Text>

            <Text className="mt-1 font-medium text-gray-900">
              Rp {Number(order.total).toLocaleString("id-ID")}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}