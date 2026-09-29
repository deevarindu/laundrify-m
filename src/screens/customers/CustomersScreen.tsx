import { useFocusEffect } from "@react-navigation/native";
import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type {
  MainTabParamList,
  MainStackParamList,
} from "../../navigation/mainNavigator";
import { useCallback, useMemo, useState } from "react";
import type { Customer } from "../../types/customer";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCustomers } from "../../services/customerService";
import { api } from "../../lib/api";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Customers">,
  NativeStackScreenProps<MainStackParamList>
>;

type Membership = {
  id: number;
  customerId: number;
  memberCode: string;
  discountPercent: string | number;
  isActive: boolean;
  joinedAt: string;
  updatedAt: string;
};

type ModalType = "customer" | "membership" | null;

export default function CustomersScreen({ navigation }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [modalType, setModalType] = useState<ModalType>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [membershipDiscount, setMembershipDiscount] = useState("10");

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        try {
          setIsLoading(true);
          setError("");

          const [customerResponse, membershipResponse] =
            await Promise.all([
              getCustomers(),
              api.get("/membership"),
            ]);

          if (!isActive) {
            return;
          }

          setCustomers(customerResponse);
          setMemberships(membershipResponse.data.data);
        } catch (error) {
          if (!isActive) {
            return;
          }

          console.error(error);

          if (axios.isAxiosError(error)) {
            setError(
              error.response?.data?.message ??
                "Failed to load customer data."
            );
          } else {
            setError("Failed to load customer data.");
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return customers;
    }

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(keyword) ||
        customer.phone.toLowerCase().includes(keyword) ||
        customer.address?.toLowerCase().includes(keyword)
    );
  }, [customers, search]);

  const resetCustomerForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setIsEditing(false);
    setSelectedCustomer(null);
    setActionError("");
  };

  const openCreateCustomer = () => {
    resetCustomerForm();
    setModalType("customer");
  };

  const openEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditing(true);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerAddress(customer.address ?? "");
    setActionError("");
    setModalType("customer");
  };

  const closeModal = () => {
    if (isActionLoading) {
      return;
    }

    setModalType(null);
    resetCustomerForm();
    setMembershipDiscount("10");
  };

  const handleCustomerSubmit = async () => {
    const name = customerName.trim();
    const phone = customerPhone.trim();
    const address = customerAddress.trim();

    if (!name) {
      setActionError("Customer name is required.");
      return;
    }

    if (!phone) {
      setActionError("Customer phone is required.");
      return;
    }

    try {
      setIsActionLoading(true);
      setActionError("");

      if (isEditing && selectedCustomer) {
        const response = await api.patch(
          `/customer/${selectedCustomer.id}`,
          {
            name,
            phone,
            address: address || undefined,
          }
        );

        setCustomers((currentCustomers) =>
          currentCustomers.map((customer) =>
            customer.id === selectedCustomer.id
              ? response.data.data
              : customer
          )
        );
      } else {
        const response = await api.post("/customer", {
          name,
          phone,
          address: address || undefined,
        });

        setCustomers((currentCustomers) => [
          response.data.data,
          ...currentCustomers,
        ]);
      }

      closeModal();
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        setActionError(
          error.response?.data?.message ??
            "Failed to save customer."
        );
      } else {
        setActionError("Failed to save customer.");
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteCustomer = (customer: Customer) => {
    Alert.alert(
      "Delete Customer",
      `Are you sure you want to delete ${customer.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsActionLoading(true);
              setError("");

              await api.delete(`/customer/${customer.id}`);

              setCustomers((currentCustomers) =>
                currentCustomers.filter(
                  (item) => item.id !== customer.id
                )
              );

              setMemberships((currentMemberships) =>
                currentMemberships.filter(
                  (item) =>
                    item.customerId !== customer.id
                )
              );
            } catch (error) {
              console.error(error);

              if (axios.isAxiosError(error)) {
                Alert.alert(
                  "Delete Failed",
                  error.response?.data?.message ??
                    "Failed to delete customer."
                );
              } else {
                Alert.alert(
                  "Delete Failed",
                  "Failed to delete customer."
                );
              }
            } finally {
              setIsActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const openMembershipModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setMembershipDiscount("10");
    setActionError("");
    setModalType("membership");
  };

  const handleCreateMembership = async () => {
    if (!selectedCustomer) {
      return;
    }

    const discount = Number(membershipDiscount);

    if (
      !Number.isFinite(discount) ||
      discount < 0 ||
      discount > 100
    ) {
      setActionError(
        "Discount must be between 0 and 100."
      );
      return;
    }

    try {
      setIsActionLoading(true);
      setActionError("");

      const response = await api.post("/membership", {
        customerId: selectedCustomer.id,
        discountPercent: discount,
      });

      setMemberships((currentMemberships) => [
        response.data.data,
        ...currentMemberships,
      ]);

      setModalType(null);
      setSelectedCustomer(null);
      setMembershipDiscount("10");
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        setActionError(
          error.response?.data?.message ??
            "Failed to create membership."
        );
      } else {
        setActionError("Failed to create membership.");
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleMembership = async (
    membership: Membership
  ) => {
    try {
      setIsActionLoading(true);

      const response = await api.patch(
        `/membership/${membership.id}`,
        {
          isActive: !membership.isActive,
        }
      );

      setMemberships((currentMemberships) =>
        currentMemberships.map((item) =>
          item.id === membership.id
            ? response.data.data
            : item
        )
      );
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        Alert.alert(
          "Membership Update Failed",
          error.response?.data?.message ??
            "Failed to update membership."
        );
      } else {
        Alert.alert(
          "Membership Update Failed",
          "Failed to update membership."
        );
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const getMembership = (customerId: number) => {
    return memberships.find(
      (membership) => membership.customerId === customerId
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f7f2eb]">
        <Text className="text-sm text-[#73776d]">
          Loading customers...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f2eb]">
      <Header
        title="Customers"
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 110,
        }}
      >
        <View className="mb-6 mt-5">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-2xl font-bold text-[#30352a]">
                Customers
              </Text>

              <Text className="mt-1 text-sm leading-5 text-[#73776d]">
                Manage customer information and membership
                benefits.
              </Text>
            </View>

            <Pressable
              onPress={openCreateCustomer}
              className="h-11 w-11 items-center justify-center rounded-xl bg-[#8b9a6e]"
            >
              <Ionicons
                name="add"
                size={25}
                color="#ffffff"
              />
            </Pressable>
          </View>
        </View>

        {error ? (
          <View className="mb-5 rounded-2xl border border-[#e5c5c5] bg-white p-4">
            <Text className="text-sm text-[#b85c5c]">
              {error}
            </Text>
          </View>
        ) : null}

        <View className="mb-5 flex-row items-center rounded-2xl border border-[#ded8cf] bg-white px-4">
          <Ionicons
            name="search-outline"
            size={20}
            color="#73776d"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or phone..."
            placeholderTextColor="#a1a39d"
            className="ml-3 flex-1 py-3.5 text-sm text-[#30352a]"
          />
        </View>

        <View className="mb-4">
          <Text className="text-lg font-bold text-[#30352a]">
            Customer List
          </Text>

          <Text className="mt-1 text-xs text-[#73776d]">
            {customers.length} customer
            {customers.length !== 1 ? "s" : ""} registered
          </Text>
        </View>

        {filteredCustomers.length === 0 ? (
          <View className="items-center rounded-2xl border border-dashed border-[#d8d2c9] bg-white px-5 py-10">
            <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-[#eae2d6]">
              <Ionicons
                name="people-outline"
                size={24}
                color="#8b9a6e"
              />
            </View>

            <Text className="text-base font-semibold text-[#30352a]">
              No customers found
            </Text>

            <Text className="mt-1 text-center text-sm leading-5 text-[#73776d]">
              {customers.length === 0
                ? "Customers will appear here once they are added."
                : "Try searching with another keyword."}
            </Text>
          </View>
        ) : (
          filteredCustomers.map((customer) => {
            const membership = getMembership(customer.id);

            return (
              <View
                key={customer.id}
                className="mb-3 rounded-2xl border border-[#ded8cf] bg-white p-4"
              >
                <Pressable
                  onPress={() =>
                    navigation.navigate("CustomerDetail", {
                      customerId: customer.id,
                    })
                  }
                >
                  <View className="flex-row items-start">
                    <View className="flex-1 pr-3">
                      <View className="flex-row flex-wrap items-center">
                        <Text className="text-base font-bold text-[#30352a]">
                          {customer.name}
                        </Text>

                        {membership ? (
                          <View
                            className={`ml-2 rounded-full px-2.5 py-1 ${
                              membership.isActive
                                ? "bg-[#8b9a6e]"
                                : "bg-[#eae2d6]"
                            }`}
                          >
                            <Text
                              className={`text-[10px] font-semibold ${
                                membership.isActive
                                  ? "text-white"
                                  : "text-[#73776d]"
                              }`}
                            >
                              {membership.isActive
                                ? `Member ${Number(
                                    membership.discountPercent
                                  )}%`
                                : "Inactive Member"}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <Text className="mt-2 text-sm text-[#4b5141]">
                        {customer.phone}
                      </Text>

                      <Text
                        className="mt-1 text-sm leading-5 text-[#73776d]"
                        numberOfLines={2}
                      >
                        {customer.address || "No address"}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#a1a39d"
                    />
                  </View>
                </Pressable>

                <View className="mt-4 border-t border-[#eee9e2] pt-3">
                  <View className="flex-row flex-wrap">
                    {membership ? (
                      <Pressable
                        disabled={isActionLoading}
                        onPress={() =>
                          handleToggleMembership(membership)
                        }
                        className="mb-2 mr-2 rounded-xl border border-[#d8d2c9] bg-white px-3 py-2"
                      >
                        <Text className="text-xs font-semibold text-[#4b5141]">
                          {membership.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        disabled={isActionLoading}
                        onPress={() =>
                          openMembershipModal(customer)
                        }
                        className="mb-2 mr-2 rounded-xl bg-[#8b9a6e] px-3 py-2"
                      >
                        <Text className="text-xs font-semibold text-white">
                          Activate Membership
                        </Text>
                      </Pressable>
                    )}

                    <Pressable
                      onPress={() =>
                        openEditCustomer(customer)
                      }
                      className="mb-2 mr-2 rounded-xl border border-[#d8d2c9] bg-white px-3 py-2"
                    >
                      <Text className="text-xs font-semibold text-[#4b5141]">
                        Edit
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        navigation.navigate(
                          "CustomerDetail",
                          {
                            customerId: customer.id,
                          }
                        )
                      }
                      className="mb-2 mr-2 rounded-xl bg-[#f0f2e9] px-3 py-2"
                    >
                      <Text className="text-xs font-semibold text-[#4b5141]">
                        Detail
                      </Text>
                    </Pressable>

                    <Pressable
                      disabled={isActionLoading}
                      onPress={() =>
                        handleDeleteCustomer(customer)
                      }
                      className="mb-2 rounded-xl bg-[#b85c5c] px-3 py-2"
                    >
                      <Text className="text-xs font-semibold text-white">
                        Delete
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={modalType === "customer"}
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
                    ? "Edit Customer"
                    : "Add Customer"}
                </Text>

                <Text className="mt-1 text-sm text-[#73776d]">
                  {isEditing
                    ? "Update customer information."
                    : "Add a new laundry customer."}
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
                  Name
                </Text>

                <TextInput
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Customer name"
                  placeholderTextColor="#a1a39d"
                  className="rounded-xl border border-[#d8d2c9] bg-white px-4 py-3 text-sm text-[#30352a]"
                />
              </View>

              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-[#4b5141]">
                  Phone
                </Text>

                <TextInput
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  placeholder="Phone number"
                  placeholderTextColor="#a1a39d"
                  keyboardType="phone-pad"
                  className="rounded-xl border border-[#d8d2c9] bg-white px-4 py-3 text-sm text-[#30352a]"
                />
              </View>

              <View className="mb-5">
                <Text className="mb-2 text-sm font-medium text-[#4b5141]">
                  Address
                </Text>

                <TextInput
                  value={customerAddress}
                  onChangeText={setCustomerAddress}
                  placeholder="Customer address"
                  placeholderTextColor="#a1a39d"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="min-h-[90px] rounded-xl border border-[#d8d2c9] bg-white px-4 py-3 text-sm text-[#30352a]"
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
                onPress={handleCustomerSubmit}
                className={`h-12 items-center justify-center rounded-xl bg-[#8b9a6e] ${
                  isActionLoading ? "opacity-60" : ""
                }`}
              >
                {isActionLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="font-semibold text-white">
                    {isEditing
                      ? "Update Customer"
                      : "Create Customer"}
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalType === "membership"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center bg-black/40 px-5">
          <View className="rounded-3xl border border-[#ded8cf] bg-[#faf8f4] p-6">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="flex-1 text-xl font-bold text-[#30352a]">
                Activate Membership
              </Text>

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

            <View className="mb-5 rounded-2xl bg-[#eae2d6] p-4">
              <Text className="text-[10px] font-semibold uppercase tracking-wider text-[#73776d]">
                Customer
              </Text>

              <Text className="mt-1 text-base font-semibold text-[#4b5141]">
                {selectedCustomer?.name}
              </Text>
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-medium text-[#4b5141]">
                Discount Percent
              </Text>

              <TextInput
                value={membershipDiscount}
                onChangeText={setMembershipDiscount}
                placeholder="10"
                placeholderTextColor="#a1a39d"
                keyboardType="numeric"
                className="rounded-xl border border-[#d8d2c9] bg-white px-4 py-3 text-sm text-[#30352a]"
              />

              <Text className="mt-2 text-xs text-[#73776d]">
                Enter a discount between 0 and 100 percent.
              </Text>
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
              onPress={handleCreateMembership}
              className={`h-12 items-center justify-center rounded-xl bg-[#8b9a6e] ${
                isActionLoading ? "opacity-60" : ""
              }`}
            >
              {isActionLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="font-semibold text-white">
                  Activate Membership
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
