import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../navigation/mainNavigator";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Service } from "../../types/service";
import { getServices } from "../../services/serviceService";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../lib/api";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

type Props = NativeStackScreenProps<MainStackParamList, "Services">;

const categories = ["ALL", "REGULER", "EKSPRESS", "KHUSUS"];

const serviceCategories = ["REGULER", "EKSPRESS", "KHUSUS"];

const formatCategory = (category: string) => {
  if (category === "REGULER") return "Regular";
  if (category === "EKSPRESS") return "Express";
  if (category === "KHUSUS") return "Others";
  return category;
};

const formatPrice = (price: string | number) => {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return String(price);
  }

  return `Rp ${numericPrice.toLocaleString("id-ID")}`;
};

type ModalType = "service" | null;

export default function ServicesScreen({ navigation }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [modalType, setModalType] = useState<ModalType>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  const [serviceName, setServiceName] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [serviceUnit, setServiceUnit] = useState("");
  const [servicePrice, setServicePrice] = useState("");

  const [actionError, setActionError] = useState("");

  
  useFocusEffect(
    useCallback(() => {
      const fetchServices = async () => {
        try {
          setIsLoading(true);
    
          const data = await getServices();
    
          setServices(data);
        } catch (error) {
          console.log("gagal fetch services:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchServices();
  }, []));

  const filteredServices = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch = service.name
        .toLowerCase()
        .includes(keyword);

      const matchesCategory =
        selectedCategory === "ALL" ||
        service.category.toUpperCase() === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [services, search, selectedCategory]);

  const resetServiceForm = () => {
    setServiceName("");
    setServiceCategory("");
    setServiceUnit("");
    setServicePrice("");
    setIsEditing(false);
    setSelectedService(null);
    setActionError("");
  };

  const openCreateService = () => {
    resetServiceForm();
    setModalType("service");
  };

  const openEditService = (service: Service) => {
    setSelectedService(service);
    setIsEditing(true);
    setServiceName(service.name);
    setServiceCategory(service.category);
    setServiceUnit(service.unit);
    setServicePrice(String(service.price));
    setActionError("");
    setModalType("service");
  };

  const closeModal = () => {
    if (isActionLoading) {
      return;
    }

    setModalType(null);
    resetServiceForm();
  };

  const handleServiceSubmit = async () => {
    const name = serviceName.trim();
    const category = serviceCategory.trim().toUpperCase();
    const unit = serviceUnit.trim();
    const price = Number(servicePrice);

    if (!name) {
      setActionError("Service name is required.");
      return;
    }

    if (!category) {
      setActionError("Service category is required.");
      return;
    }

    if (!serviceCategories.includes(category)) {
      setActionError("Please select a valid service category.");
      return;
    }

    if (!unit) {
      setActionError("Service unit is required.");
      return;
    }

    if (!servicePrice.trim()) {
      setActionError("Service price is required.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setActionError("Service price must be a valid number.");
      return;
    }

    try {
      setIsActionLoading(true);
      setActionError("");

      if (isEditing && selectedService) {
        const response = await api.patch(
          `/service/${selectedService.id}`,
          {
            name,
            category,
            unit,
            price,
          }
        );

        setServices((currentServices) =>
          currentServices.map((service) =>
            service.id === selectedService.id
              ? response.data.data
              : service
          )
        );
      } else {
        const response = await api.post("/service", {
          name,
          category,
          unit,
          price,
        });

        setServices((currentServices) => [
          response.data.data,
          ...currentServices,
        ]);
      }

      closeModal();
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        setActionError(
          error.response?.data?.message ??
            "Failed to save service."
        );
      } else {
        setActionError("Failed to save service.");
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f7f2eb]">
        <Text className="text-sm text-[#73776d]">
          Loading services...
        </Text>
      </SafeAreaView>
    );
  }

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
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-2xl font-bold text-[#30352a]">
              Services
            </Text>

            <Text className="mt-1 text-sm text-[#73776d]">
              Manage laundry services and pricing
            </Text>
          </View>

          <Pressable
            onPress={openCreateService}
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
            const isSelected =
              selectedCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() =>
                  setSelectedCategory(category)
                }
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

        <View className="mb-3 mt-5 flex-row items-center justify-between">
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
            <View
              key={service.id}
              className="mb-3 rounded-2xl border border-[#ded8cf] bg-white px-5 py-4"
            >
              <Pressable
                onPress={() =>
                  navigation.navigate("ServiceDetail", {
                    serviceId: service.id,
                  })
                }
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
                          {formatCategory(
                            service.category
                          )}
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

                    {/* <View className="mt-3 self-start rounded-full bg-[#eeeeee] px-2.5 py-1">
                      <Text className="text-xs font-medium text-[#73776d]">
                        {service.isActive === "true" ||
                        service.isActive === "ACTIVE"
                          ? "Active"
                          : "Inactive"}
                      </Text>
                    </View> */}
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#a1a39d"
                  />
                </View>
              </Pressable>

              <View className="mt-4 border-t border-[#eee9e2] pt-3">
                <View className="flex-row">
                  <Pressable
                    onPress={() =>
                      openEditService(service)
                    }
                    className="rounded-xl border border-[#d8d2c9] bg-white px-4 py-2"
                  >
                    <Text className="text-xs font-semibold text-[#4b5141]">
                      Edit
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      navigation.navigate(
                        "ServiceDetail",
                        {
                          serviceId: service.id,
                        }
                      )
                    }
                    className="ml-2 rounded-xl bg-[#f0f2e9] px-4 py-2"
                  >
                    <Text className="text-xs font-semibold text-[#4b5141]">
                      Detail
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalType === "service"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center bg-black/40 px-5">
          <View className="max-h-[90%] rounded-3xl border border-[#ded8cf] bg-[#faf8f4] p-6">
            <View className="mb-6 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xl font-bold text-[#30352a]">
                  {isEditing
                    ? "Edit Service"
                    : "Add Service"}
                </Text>

                <Text className="mt-1 text-sm text-[#73776d]">
                  {isEditing
                    ? "Update service information."
                    : "Add a new laundry service."}
                </Text>
              </View>

              <Pressable
                disabled={isActionLoading}
                onPress={closeModal}
                className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-[#eae2d6]"
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="#4b5141"
                />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-[#4b5141]">
                  Service Name
                </Text>

                <TextInput
                  value={serviceName}
                  onChangeText={setServiceName}
                  placeholder="Service name"
                  placeholderTextColor="#a1a39d"
                  className="rounded-xl border border-[#d8d2c9] bg-white px-4 py-3 text-sm text-[#30352a]"
                />
              </View>

              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-[#4b5141]">
                  Category
                </Text>

                <View className="flex-row flex-wrap">
                  {serviceCategories.map((category) => {
                    const isSelected =
                      serviceCategory === category;

                    return (
                      <Pressable
                        key={category}
                        onPress={() =>
                          setServiceCategory(category)
                        }
                        className={`mb-2 mr-2 rounded-xl px-4 py-2.5 ${
                          isSelected
                            ? "bg-[#8b9a6e]"
                            : "border border-[#d8d2c9] bg-white"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            isSelected
                              ? "text-white"
                              : "text-[#4b5141]"
                          }`}
                        >
                          {formatCategory(category)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-[#4b5141]">
                  Unit
                </Text>

                <TextInput
                  value={serviceUnit}
                  onChangeText={setServiceUnit}
                  placeholder="kg, pcs, pair, item..."
                  placeholderTextColor="#a1a39d"
                  className="rounded-xl border border-[#d8d2c9] bg-white px-4 py-3 text-sm text-[#30352a]"
                />
              </View>

              <View className="mb-5">
                <Text className="mb-2 text-sm font-medium text-[#4b5141]">
                  Price
                </Text>

                <TextInput
                  value={servicePrice}
                  onChangeText={setServicePrice}
                  placeholder="15000"
                  placeholderTextColor="#a1a39d"
                  keyboardType="numeric"
                  className="rounded-xl border border-[#d8d2c9] bg-white px-4 py-3 text-sm text-[#30352a]"
                />
              </View>

              {actionError ? (
                <View className="mb-4 rounded-xl bg-[#f4e7e3] px-4 py-3">
                  <Text className="text-sm leading-5 text-[#b85c5c]">
                    {actionError}
                  </Text>
                </View>
              ) : null}

              <Pressable
                disabled={isActionLoading}
                onPress={handleServiceSubmit}
                className={`h-12 items-center justify-center rounded-xl bg-[#8b9a6e] ${
                  isActionLoading ? "opacity-60" : ""
                }`}
              >
                {isActionLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="font-semibold text-white">
                    {isEditing
                      ? "Update Service"
                      : "Create Service"}
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}