import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList } from "../../navigation/mainNavigator";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { Service } from "../../types/service";
import { getServiceById } from "../../services/serviceService";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<MainStackParamList, "ServiceDetail">;

const formatCategory = (category: string) => {
  if (category === "REGULER") return "Reguler";
  if (category === "EKSPRESS") return "Express";
  if (category === "KHUSUS") return "Khusus";
  return category;
};

const formatPrice = (price: string) => {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return price;
  }

  return `Rp ${numericPrice.toLocaleString("id-ID")}`;
};

const isServiceActive = (isActive: string) => {
  return isActive === "true" || isActive === "ACTIVE";
};

export default function ServiceDetailScreen({ route, navigation }: Props) {
  const { serviceId } = route.params;

  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await getServiceById(serviceId);

        setService(data);
        console.log("berhasil fetch service:", data);
      } catch (error) {
        console.log("gagal fetch service:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f7f2eb]">
        <Text className="text-sm text-[#73776d]">
          Loading service...
        </Text>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f7f2eb] px-6">
        <Text className="text-lg font-bold text-[#30352a]">
          Service not found
        </Text>

        <Text className="mt-2 text-center text-sm text-[#73776d]">
          The service you are looking for could not be found.
        </Text>

        <Pressable
          onPress={() => navigation.goBack()}
          className="mt-5 rounded-xl bg-[#8b9a6e] px-5 py-3"
        >
          <Text className="font-semibold text-white">
            Go Back
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const active = isServiceActive(service.isActive);

  return (
    <SafeAreaView className="flex-1 bg-[#f7f2eb]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          className="mb-5 h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#30352a"
          />
        </Pressable>

        <Text className="text-2xl font-bold text-[#30352a]">
          Service Details
        </Text>

        <Text className="mt-1 text-sm text-[#73776d]">
          View service information and pricing
        </Text>

        <View className="mt-6 rounded-2xl border border-[#ded8cf] bg-white p-5">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-xl font-bold text-[#30352a]">
                {service.name}
              </Text>

              <View className="mt-3 self-start rounded-full bg-[#eae2d6] px-3 py-1.5">
                <Text className="text-xs font-semibold text-[#4b5141]">
                  {formatCategory(service.category)}
                </Text>
              </View>
            </View>

            <View
              className={`rounded-full px-3 py-1.5 ${
                active ? "bg-[#e7eee0]" : "bg-[#eeeeee]"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  active ? "text-[#61704c]" : "text-[#73776d]"
                }`}
              >
                {active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>

        <Text className="mb-3 mt-6 text-base font-bold text-[#30352a]">
          Service Information
        </Text>

        <View className="rounded-2xl border border-[#ded8cf] bg-white">
          <View className="border-b border-[#ded8cf] px-5 py-4">
            <Text className="text-xs text-[#73776d]">
              Service ID
            </Text>

            <Text className="mt-1 text-sm font-semibold text-[#30352a]">
              #{service.id}
            </Text>
          </View>

          <View className="border-b border-[#ded8cf] px-5 py-4">
            <Text className="text-xs text-[#73776d]">
              Category
            </Text>

            <Text className="mt-1 text-sm font-semibold text-[#30352a]">
              {formatCategory(service.category)}
            </Text>
          </View>

          <View className="border-b border-[#ded8cf] px-5 py-4">
            <Text className="text-xs text-[#73776d]">
              Unit
            </Text>

            <Text className="mt-1 text-sm font-semibold text-[#30352a]">
              {service.unit}
            </Text>
          </View>

          <View className="px-5 py-4">
            <Text className="text-xs text-[#73776d]">
              Price
            </Text>

            <Text className="mt-1 text-lg font-bold text-[#8b9a6e]">
              {formatPrice(service.price)}
            </Text>
          </View>
        </View>

        <Text className="mb-3 mt-6 text-base font-bold text-[#30352a]">
          Status
        </Text>

        <View className="rounded-2xl border border-[#ded8cf] bg-white px-5 py-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-[#73776d]">
              Service status
            </Text>

            <View
              className={`rounded-full px-3 py-1.5 ${
                active ? "bg-[#e7eee0]" : "bg-[#eeeeee]"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  active ? "text-[#61704c]" : "text-[#73776d]"
                }`}
              >
                {active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}