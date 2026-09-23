import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { getOrders } from "../../services/orderService";
import { getDashboardStats } from "../../utils/dashboard";

import { useAuthStore } from "../../store/authStore";

type DashboardStats = {
  activeOrders: number;
  processing: number;
  ready: number;
  unpaid: number;
};

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);

  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    processing: 0,
    ready: 0,
    unpaid: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const orders = await getOrders();

        const dashboardStats = getDashboardStats(orders);

        setStats(dashboardStats);
      } catch (error) {
        console.log("GAGAL FETCH DASHBOARD:", error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <View className="flex-1 bg-gray-50 px-6 pt-12">
      <Text className="text-3xl font-bold text-gray-900">
        Welcome back, {user?.name}
      </Text>

      <Text className="mt-8 text-lg">
        Active Orders: {stats.activeOrders}
      </Text>

      <Text className="mt-2 text-lg">
        Processing: {stats.processing}
      </Text>

      <Text className="mt-2 text-lg">
        Ready: {stats.ready}
      </Text>

      <Text className="mt-2 text-lg">
        Unpaid: {stats.unpaid}
      </Text>
    </View>
  );
}