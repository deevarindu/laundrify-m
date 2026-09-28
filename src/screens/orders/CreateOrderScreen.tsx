import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type {
  MainStackParamList,
  MainTabParamList,
} from "../../navigation/mainNavigator";
import { api } from "../../lib/api";

type Props = CompositeScreenProps<
  NativeStackScreenProps<MainStackParamList, "CreateOrder">,
  BottomTabScreenProps<MainTabParamList>
>;

type Customer = {
  id: number;
  name: string;
  phone: string;
  address?: string | null;
};

type Membership = {
  id: number;
  customerId: number;
  memberCode: string;
  discountPercent: number | string;
  isActive: boolean;
};

type Service = {
  id: number;
  name: string;
  category: string;
  unit: string;
  price: number | string;
  isActive: boolean;
};

type OrderItemForm = {
  id: string;
  serviceId: string;
  serviceSearch: string;
  quantity: string;
};

const createItem = (): OrderItemForm => ({
  id: `${Date.now()}-${Math.random()}`,
  serviceId: "",
  serviceSearch: "",
  quantity: "1",
});

export default function CreateOrderScreen({ navigation }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] =
    useState(false);

  const [dueAt, setDueAt] = useState("");

  const [items, setItems] = useState<OrderItemForm[]>([
    createItem(),
  ]);

  const [openServiceDropdown, setOpenServiceDropdown] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          customersResponse,
          membershipsResponse,
          servicesResponse,
        ] = await Promise.all([
          api.get("/customer"),
          api.get("/membership"),
          api.get("/service"),
        ]);

        if (cancelled) {
          return;
        }

        setCustomers(customersResponse.data.data ?? []);
        setMemberships(membershipsResponse.data.data ?? []);

        setServices(
          (servicesResponse.data.data ?? []).filter(
            (service: Service) => service.isActive
          )
        );
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        console.error(error);

        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ??
              "Failed to load order form data."
          );
        } else {
          setError("Failed to load order form data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const keyword = customerSearch.trim().toLowerCase();

    if (!keyword) {
      return customers;
    }

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(keyword) ||
        customer.phone.toLowerCase().includes(keyword)
    );
  }, [customers, customerSearch]);

  const selectedCustomer = useMemo(() => {
    return customers.find(
      (customer) => customer.id === Number(customerId)
    );
  }, [customers, customerId]);

  const activeMembership = useMemo(() => {
    if (!selectedCustomer) {
      return null;
    }

    return (
      memberships.find(
        (membership) =>
          membership.customerId === selectedCustomer.id &&
          membership.isActive
      ) ?? null
    );
  }, [memberships, selectedCustomer]);

  const selectedItems = useMemo(() => {
    return items
      .map((item) => {
        const service = services.find(
          (currentService) =>
            currentService.id === Number(item.serviceId)
        );

        const quantity = Number(item.quantity);

        if (!service || !Number.isFinite(quantity)) {
          return null;
        }

        const subtotal = Number(service.price) * quantity;

        return {
          id: item.id,
          serviceId: service.id,
          service,
          quantity,
          subtotal,
        };
      })
      .filter(
        (
          item
        ): item is {
          id: string;
          serviceId: number;
          service: Service;
          quantity: number;
          subtotal: number;
        } => item !== null
      );
  }, [items, services]);

  const subtotal = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
  }, [selectedItems]);

  const discountPercent = Number(
    activeMembership?.discountPercent ?? 0
  );

  const discount = useMemo(() => {
    return subtotal * (discountPercent / 100);
  }, [subtotal, discountPercent]);

  const total = subtotal - discount;

  const formatCurrency = (value: number | string) => {
    return `Rp ${Number(value).toLocaleString("id-ID")}`;
  };

  const updateItem = (
    itemId: string,
    field: keyof OrderItemForm,
    value: string
  ) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const handleCustomerSearch = (value: string) => {
    setCustomerSearch(value);
    setShowCustomerDropdown(true);

    if (!value.trim()) {
      setCustomerId("");
    } else if (
      selectedCustomer &&
      value !== selectedCustomer.name
    ) {
      setCustomerId("");
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setCustomerId(String(customer.id));
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
    setFormError("");
  };

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      createItem(),
    ]);

    setOpenServiceDropdown(null);
  };

  const removeItem = (itemId: string) => {
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        return currentItems;
      }

      return currentItems.filter(
        (item) => item.id !== itemId
      );
    });

    if (openServiceDropdown === itemId) {
      setOpenServiceDropdown(null);
    }
  };

  const handleSelectService = (
    itemId: string,
    service: Service
  ) => {
    updateItem(
      itemId,
      "serviceId",
      String(service.id)
    );

    updateItem(
      itemId,
      "serviceSearch",
      service.name
    );

    setOpenServiceDropdown(null);
    setFormError("");
  };

  const getFilteredServices = (
    item: OrderItemForm
  ) => {
    const keyword = item.serviceSearch
      .trim()
      .toLowerCase();

    const selectedServiceIds = items
      .filter(
        (currentItem) => currentItem.id !== item.id
      )
      .map((currentItem) =>
        Number(currentItem.serviceId)
      );

    return services.filter((service) => {
      const alreadyUsed =
        selectedServiceIds.includes(service.id);

      if (alreadyUsed) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        service.name
          .toLowerCase()
          .includes(keyword) ||
        service.category
          .toLowerCase()
          .includes(keyword) ||
        service.unit
          .toLowerCase()
          .includes(keyword)
      );
    });
  };

  const handleSubmit = async () => {
    setFormError("");

    const parsedCustomerId = Number(customerId);

    if (
      !Number.isInteger(parsedCustomerId) ||
      parsedCustomerId <= 0
    ) {
      setFormError("Please select a customer.");
      return;
    }

    const parsedItems = items.map((item) => ({
      serviceId: Number(item.serviceId),
      quantity: Number(item.quantity),
    }));

    const hasInvalidService = parsedItems.some(
      (item) =>
        !Number.isInteger(item.serviceId) ||
        item.serviceId <= 0 ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0
    );

    if (hasInvalidService) {
      setFormError(
        "Please select a valid service and quantity."
      );
      return;
    }

    const hasInvalidSatuanQuantity = parsedItems.some(
      (item) => {
        const service = services.find(
          (currentService) =>
            currentService.id === item.serviceId
        );

        return (
          service?.unit === "SATUAN" &&
          !Number.isInteger(item.quantity)
        );
      }
    );

    if (hasInvalidSatuanQuantity) {
      setFormError(
        "Others services require a whole number quantity."
      );
      return;
    }

    const serviceIds = parsedItems.map(
      (item) => item.serviceId
    );

    if (
      new Set(serviceIds).size !== serviceIds.length
    ) {
      setFormError(
        "Each service can only be added once."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post("/order", {
        customerId: parsedCustomerId,
        items: parsedItems,
        dueAt: dueAt || undefined,
      });

      const createdOrder = response.data.data;

      Alert.alert(
        "Success",
        "Order created successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              if (createdOrder?.id) {
                navigation.navigate(
                  "OrderDetail",
                  {
                    orderId: createdOrder.id,
                  }
                );
              } else {
                navigation.goBack();
              }
            },
          },
        ]
      );
    } catch (error: unknown) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        setFormError(
          error.response?.data?.message ??
            "Failed to create order."
        );
      } else {
        setFormError("Failed to create order.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F7F2EB]">
        <ActivityIndicator size="large" />

        <Text className="mt-3 text-sm text-[#73776D]">
          Loading order form...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-[#F7F2EB] p-4">
        <View className="rounded-2xl border border-[#DED8CF] bg-white p-6">
          <Text className="text-sm text-[#B85C5C]">
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F7F2EB]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6 rounded-3xl bg-[#8B9A6E] px-6 py-7">
          <Text className="text-xs font-medium uppercase tracking-widest text-white/70">
            Order Management
          </Text>

          <Text className="mt-2 text-3xl font-semibold text-white">
            Create Laundry Order
          </Text>

          <Text className="mt-2 text-sm leading-6 text-white/75">
            Create a new order and add one or more
            laundry services.
          </Text>
        </View>

        <View className="mb-6 rounded-2xl border border-[#DED8CF] bg-white">
          <View className="border-b border-[#EAE2D6] bg-[#FAF8F4] p-5">
            <Text className="text-base font-semibold text-[#4B5141]">
              Customer
            </Text>
          </View>

          <View className="p-5">
            <Text className="mb-2 text-sm font-medium text-[#4B5141]">
              Customer
            </Text>

            <TextInput
              value={customerSearch}
              placeholder="Search customer name or phone"
              placeholderTextColor="#9A9A94"
              className="rounded-lg border border-[#D8D2C9] bg-[#FAF8F4] px-4 py-3 text-sm text-[#4B5141]"
              onChangeText={handleCustomerSearch}
              onFocus={() =>
                setShowCustomerDropdown(true)
              }
            />

            {showCustomerDropdown && (
              <View className="mt-2 max-h-64 rounded-xl border border-[#D8D2C9] bg-white">
                <ScrollView
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredCustomers.length === 0 ? (
                    <View className="p-4">
                      <Text className="text-sm text-[#73776D]">
                        Customer not found.
                      </Text>
                    </View>
                  ) : (
                    filteredCustomers
                      .slice(0, 8)
                      .map((customer) => (
                        <Pressable
                          key={customer.id}
                          onPress={() =>
                            handleSelectCustomer(
                              customer
                            )
                          }
                          className="border-b border-[#EAE2D6] px-4 py-3"
                        >
                          <Text className="font-medium text-[#30352A]">
                            {customer.name}
                          </Text>

                          <Text className="mt-1 text-xs text-[#73776D]">
                            {customer.phone}
                          </Text>
                        </Pressable>
                      ))
                  )}
                </ScrollView>
              </View>
            )}

            {selectedCustomer && (
              <View className="mt-5 rounded-2xl bg-[#EAE2D6] p-4">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="font-semibold text-[#30352A]">
                      {selectedCustomer.name}
                    </Text>

                    <Text className="mt-1 text-sm text-[#73776D]">
                      {selectedCustomer.phone}
                    </Text>

                    <Text className="mt-1 text-sm text-[#8A8D84]">
                      {selectedCustomer.address ?? "-"}
                    </Text>
                  </View>

                  {activeMembership && (
                    <View className="rounded-full bg-[#8B9A6E] px-3 py-2">
                      <Text className="text-xs font-medium text-white">
                        {Number(
                          activeMembership.discountPercent
                        )}
                        % Member Discount
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <View className="mt-5">
              <Text className="mb-2 text-sm font-medium text-[#4B5141]">
                Due Date
              </Text>

              <TextInput
                value={dueAt}
                onChangeText={setDueAt}
                placeholder="YYYY-MM-DDTHH:mm"
                placeholderTextColor="#9A9A94"
                className="rounded-lg border border-[#D8D2C9] bg-[#FAF8F4] px-4 py-3 text-sm text-[#4B5141]"
              />

              <Text className="mt-1 text-xs text-[#8A8D84]">
                Example: 2026-09-30T15:00
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-6 rounded-2xl border border-[#DED8CF] bg-white">
          <View className="border-b border-[#EAE2D6] bg-[#FAF8F4] p-5">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-semibold text-[#4B5141]">
                  Services
                </Text>

                <Text className="mt-1 text-xs text-[#73776D]">
                  Add services to this order.
                </Text>
              </View>

              <View className="rounded-full bg-[#E7ECDD] px-3 py-2">
                <Text className="text-xs font-medium text-[#4B5141]">
                  {items.length} item
                  {items.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>

          <View className="gap-3 p-5">
            {items.map((item, index) => {
              const service = services.find(
                (currentService) =>
                  currentService.id ===
                  Number(item.serviceId)
              );

              const quantity =
                Number(item.quantity) || 0;

              const itemSubtotal = service
                ? Number(service.price) * quantity
                : 0;

              const filteredServices =
                getFilteredServices(item);

              return (
                <View
                  key={item.id}
                  className="rounded-2xl border border-[#E2DDD5] bg-[#FDFCFA] p-4"
                >
                  <View className="mb-4 flex-row items-center justify-between">
                    <Text className="font-semibold text-[#4B5141]">
                      Service {index + 1}
                    </Text>

                    <Pressable
                      onPress={() =>
                        removeItem(item.id)
                      }
                      disabled={items.length === 1}
                    >
                      <Text
                        className={
                          items.length === 1
                            ? "font-medium text-gray-300"
                            : "font-medium text-red-500"
                        }
                      >
                        Remove
                      </Text>
                    </Pressable>
                  </View>

                  <Text className="mb-2 text-sm font-medium text-[#4B5141]">
                    Service
                  </Text>

                  <TextInput
                    value={item.serviceSearch}
                    placeholder="Search service"
                    placeholderTextColor="#9A9A94"
                    className="rounded-lg border border-[#D8D2C9] bg-white px-4 py-3 text-sm text-[#4B5141]"
                    onFocus={() => {
                      setOpenServiceDropdown(item.id);
                    }}
                    onChangeText={(value) => {
                      updateItem(
                        item.id,
                        "serviceSearch",
                        value
                      );

                      updateItem(
                        item.id,
                        "serviceId",
                        ""
                      );

                      setOpenServiceDropdown(
                        item.id
                      );
                    }}
                  />

                  {openServiceDropdown === item.id && (
                    <View className="mt-2 max-h-64 rounded-xl border border-[#D8D2C9] bg-white">
                      <ScrollView
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                      >
                        {filteredServices.length === 0 ? (
                          <View className="p-4">
                            <Text className="text-sm text-[#73776D]">
                              Service not found.
                            </Text>
                          </View>
                        ) : (
                          filteredServices
                            .slice(0, 8)
                            .map(
                              (serviceOption) => (
                                <Pressable
                                  key={
                                    serviceOption.id
                                  }
                                  onPress={() =>
                                    handleSelectService(
                                      item.id,
                                      serviceOption
                                    )
                                  }
                                  className="border-b border-[#EAE2D6] px-4 py-3"
                                >
                                  <Text className="font-medium text-[#30352A]">
                                    {
                                      serviceOption.name
                                    }
                                  </Text>

                                  <Text className="mt-1 text-xs text-[#73776D]">
                                    {
                                      serviceOption.category
                                    }{" "}
                                    ·{" "}
                                    {
                                      serviceOption.unit
                                    }{" "}
                                    ·{" "}
                                    {formatCurrency(
                                      Number(
                                        serviceOption.price
                                      )
                                    )}
                                  </Text>
                                </Pressable>
                              )
                            )
                        )}
                      </ScrollView>
                    </View>
                  )}

                  {service && (
                    <View className="mt-3 rounded-xl bg-[#E7ECDD] p-3">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="font-medium text-[#30352A]">
                            {service.name}
                          </Text>

                          <Text className="mt-1 text-xs text-[#73776D]">
                            {service.category} ·{" "}
                            {service.unit}
                          </Text>
                        </View>

                        <Text className="font-semibold text-[#4B5141]">
                          {formatCurrency(
                            Number(service.price)
                          )}
                        </Text>
                      </View>
                    </View>
                  )}

                  <View className="mt-4">
                    <Text className="mb-2 text-sm font-medium text-[#4B5141]">
                      Quantity
                    </Text>

                    <TextInput
                      value={item.quantity}
                      onChangeText={(value) =>
                        updateItem(
                          item.id,
                          "quantity",
                          value.replace(
                            /[^0-9.]/g,
                            ""
                          )
                        )
                      }
                      keyboardType="decimal-pad"
                      placeholder={
                        service?.unit === "SATUAN"
                          ? "Whole number"
                          : "Enter quantity"
                      }
                      placeholderTextColor="#9A9A94"
                      className="rounded-lg border border-[#D8D2C9] bg-white px-4 py-3 text-[#4B5141]"
                    />

                    {service?.unit === "SATUAN" && (
                      <Text className="mt-1 text-xs text-[#73776D]">
                        This service requires a
                        whole number.
                      </Text>
                    )}
                  </View>

                  <View className="mt-4">
                    <Text className="mb-2 text-sm font-medium text-[#4B5141]">
                      Subtotal
                    </Text>

                    <View className="rounded-lg border border-[#D8D2C9] bg-[#F7F2EB] px-4 py-3">
                      <Text className="text-sm font-medium text-[#4B5141]">
                        {formatCurrency(
                          itemSubtotal
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}

            <Pressable
              onPress={addItem}
              className="items-center rounded-xl border border-[#C8D0B7] bg-[#F0F2E9] px-4 py-3"
            >
              <Text className="font-medium text-[#4B5141]">
                + Add Service
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-6 overflow-hidden rounded-2xl border border-[#DED8CF] bg-white">
          <View className="border-b border-[#EAE2D6] bg-[#8B9A6E] p-5">
            <Text className="text-base font-semibold text-white">
              Order Summary
            </Text>

            <Text className="mt-1 text-sm text-white/75">
              Review the order before creating it.
            </Text>
          </View>

          <View className="p-5">
            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-[#73776D]">
                  Subtotal
                </Text>

                <Text className="font-medium text-[#4B5141]">
                  {formatCurrency(subtotal)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-[#73776D]">
                  Discount
                  {activeMembership
                    ? ` (${discountPercent}%)`
                    : ""}
                </Text>

                <Text className="font-medium text-[#4B5141]">
                  - {formatCurrency(discount)}
                </Text>
              </View>
            </View>

            <View className="my-5 rounded-2xl bg-[#E7ECDD] p-4">
              <View className="flex-row items-end justify-between">
                <Text className="text-sm font-medium text-[#4B5141]">
                  Total
                </Text>

                <Text className="text-xl font-semibold text-[#30352A]">
                  {formatCurrency(total)}
                </Text>
              </View>
            </View>

            {formError ? (
              <View className="mb-4 rounded-xl bg-[#F4E7E3] px-4 py-3">
                <Text className="text-sm leading-5 text-[#B85C5C]">
                  {formError}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={
                submitting ||
                !customerId ||
                items.length === 0
              }
              className={`mb-2 items-center rounded-xl py-4 ${
                submitting ||
                !customerId ||
                items.length === 0
                  ? "bg-gray-300"
                  : "bg-[#8B9A6E]"
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-semibold text-white">
                  Create Order
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() =>
                navigation.navigate("Orders")
              }
              disabled={submitting}
              className="items-center rounded-xl border border-[#D8D2C9] bg-white py-4"
            >
              <Text className="font-medium text-[#4B5141]">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}