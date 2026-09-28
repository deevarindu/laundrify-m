import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../navigation/mainNavigator";
import { useEffect, useMemo, useState } from "react";
import type { Service } from "../../types/service";
import { getServices } from "../../services/serviceService";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<MainStackParamList, "Services">;

const categories = ["ALL", "REGULER", "EKSPRESS", "KHUSUS"];

const formatCategory = (category: string) => {
  if (category === "REGULER") return "Regular";
  if (category === "EKSPRESS") return "Express";
  if (category === "KHUSUS") return "Others";
  return category;
};

const formatPrice = (price: string) => {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return price;
  }

  return `Rp ${numericPrice.toLocaleString("id-ID")}`;
};

export default function ServicesScreen({ navigation }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [serviceName, setServiceName] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [serviceUnit, setServiceUnit] = useState("");
  const [servicePrice, setServicePrice] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        setServices(data);
        console.log("berhasil fetch services:", data);
      } catch (error) {
        console.log("gagal fetch services:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(keyword);

      const matchesCategory =
        selectedCategory === "ALL" ||
        service.category.toUpperCase() === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [services, search, selectedCategory]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f7f2eb]">
        <Text className="text-sm text-[#73776d]">
          Loading services...
        </Text>
      </SafeAreaView>
    );
  }

  const resetServiceForm = () => {
    setServiceName("")
    setServiceCategory("")
    setServiceUnit("")
    setServicePrice("")
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f7f2eb]">
      <Header
        title="Services"
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
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="text-2xl font-bold text-[#30352a]">
              Services
            </Text>

            <Text className="mt-1 text-sm text-[#73776d]">
              Manage laundry services and pricing
            </Text>
          </View>

          <Pressable
            onPress={() => {}}
            className="h-11 w-11 items-center justify-center rounded-xl bg-[#8b9a6e]"
          >
            <Ionicons
              name="add"
              size={25}
              color="#ffffff"
            />
          </Pressable>
        </View>

        <View className="mt-5 flex-row items-center rounded-2xl border border-[#ded8cf] bg-white px-4">
          <Ionicons
            name="search-outline"
            size={19}
            color="#73776d"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search service..."
            placeholderTextColor="#a1a39d"
            className="ml-3 flex-1 py-3.5 text-sm text-[#30352a]"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`mr-2 rounded-full px-4 py-2.5 ${
                  isSelected
                    ? "bg-[#8b9a6e]"
                    : "border border-[#ded8cf] bg-white"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isSelected
                      ? "text-white"
                      : "text-[#4b5141]"
                  }`}
                >
                  {category === "ALL"
                    ? "All"
                    : formatCategory(category)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="mt-5 mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-[#4b5141]">
            {filteredServices.length} Services
          </Text>

          {selectedCategory !== "ALL" && (
            <Text className="text-xs text-[#73776d]">
              {formatCategory(selectedCategory)}
            </Text>
          )}
        </View>

        {filteredServices.length === 0 ? (
          <View className="items-center rounded-2xl border border-[#ded8cf] bg-white px-5 py-10">
            <Ionicons
              name="search-outline"
              size={28}
              color="#a1a39d"
            />

            <Text className="mt-3 text-base font-semibold text-[#30352a]">
              No services found
            </Text>

            <Text className="mt-1 text-center text-sm text-[#73776d]">
              Try changing your search or category filter.
            </Text>
          </View>
        ) : (
          filteredServices.map((service) => (
            <Pressable
              key={service.id}
              onPress={() =>
                navigation.navigate("ServiceDetail", {
                  serviceId: service.id,
                })
              }
              className="mb-3 rounded-2xl border border-[#ded8cf] bg-white px-5 py-4"
            >
              <View className="flex-row items-start">
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text
                      className="flex-1 text-base font-bold text-[#30352a]"
                      numberOfLines={1}
                    >
                      {service.name}
                    </Text>

                    <View className="ml-2 rounded-full bg-[#eae2d6] px-2.5 py-1">
                      <Text className="text-xs font-semibold text-[#4b5141]">
                        {formatCategory(service.category)}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-3 flex-row items-center">
                    <Text className="text-sm font-semibold text-[#8b9a6e]">
                      {formatPrice(service.price)}
                    </Text>

                    <Text className="ml-2 text-sm text-[#73776d]">
                      / {service.unit}
                    </Text>
                  </View>

                  <View className="mt-3 self-start rounded-full bg-[#eeeeee] px-2.5 py-1">
                    <Text className="text-xs font-medium text-[#73776d]">
                      {service.isActive === "true" ||
                      service.isActive === "ACTIVE"
                        ? "Active"
                        : "Inactive"}
                    </Text>
                  </View>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#a1a39d"
                />
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}