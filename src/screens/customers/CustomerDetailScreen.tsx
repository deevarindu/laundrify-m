import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../navigation/mainNavigator";
import { useCallback, useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Customer } from "../../types/customer";
import { getCustomerById } from "../../services/customerService";
import {
  createMembership,
  updateMembership,
} from "../../services/membershipService";

type Props = NativeStackScreenProps<
  MainStackParamList,
  "CustomerDetail"
>;

export default function CustomerDetailScreen({route,navigation}: Props) {
  const { customerId } = route.params;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("10");
  const [isMembershipActive, setIsMembershipActive] = useState(true);
  const [isSavingMembership, setIsSavingMembership] = useState(false);

  const fetchCustomer = useCallback(async () => {
    try {
      const data = await getCustomerById(customerId);

      setCustomer(data);
      console.log("berhasil fetch customer:", data);
    } catch (error) {
      console.log("gagal fetch customer", error);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const openAddMembership = () => {
    setDiscountPercent("10");
    setIsMembershipActive(true);
    setIsMembershipModalOpen(true);
  };

  const openEditMembership = () => {
    if (!customer?.membership) {
      return;
    }

    setDiscountPercent(
      String(customer.membership.discountPercent)
    );
    setIsMembershipActive(customer.membership.isActive);
    setIsMembershipModalOpen(true);
  };

  const closeMembershipModal = () => {
    if (isSavingMembership) {
      return;
    }

    setIsMembershipModalOpen(false);
  };

  const handleSaveMembership = async () => {
    const discount = Number(discountPercent);

    if (
      discountPercent.trim() === "" ||
      Number.isNaN(discount) ||
      discount < 0 ||
      discount > 100
    ) {
      Alert.alert(
        "Invalid Discount",
        "Discount must be between 0 and 100 percent."
      );
      return;
    }

    try {
      setIsSavingMembership(true);

      if (customer?.membership) {
        await updateMembership(customer.membership.id, {
          discountPercent: discount,
          isActive: isMembershipActive,
        });
      } else {
        await createMembership({
          customerId,
          discountPercent: discount,
        });
      }

      setIsMembershipModalOpen(false);
      setIsLoading(true);
      await fetchCustomer();
    } catch (error) {
      console.log("gagal menyimpan membership:", error);

      Alert.alert(
        "Failed",
        "Failed to save membership. Please try again."
      );
    } finally {
      setIsSavingMembership(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f7f2eb]">
        <Text className="text-sm text-[#73776d]">s
          Loading customers...
        </Text>
      </SafeAreaView>
    );
  }

  if (!customer) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f7f2eb] px-5">
        <View className="w-full items-center rounded-2xl border border-[#ded8cf] bg-white px-5 py-10">
          <Text className="text-lg font-bold text-[#30352a]">
            Customer not found
          </Text>

          <Text className="mt-2 text-center text-sm text-[#73776d]">
            The customer you're looking for could not be found.
          </Text>

          <Pressable
            onPress={() => navigation.goBack()}
            className="mt-6 rounded-xl bg-[#8b9a6e] px-5 py-3"
          >
            <Text className="font-semibold text-white">
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f2eb]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 36,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          className="mb-5 mt-2 h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#30352a"
          />
        </Pressable>

        <View className="mb-6">
          <Text className="text-sm font-medium text-[#73776d]">
            Customer Details
          </Text>

          <View className="mt-2 flex-row items-center">
            <Text className="flex-1 text-2xl font-bold text-[#30352a]">
              {customer.name}
            </Text>

            {customer.membership?.isActive && (
              <View className="rounded-full bg-[#eae2d6] px-3 py-1.5">
                <Text className="text-xs font-bold text-[#4b5141]">
                  Member
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="mb-4 rounded-2xl border border-[#ded8cf] bg-white p-5">
          <Text className="mb-4 text-base font-bold text-[#30352a]">
            Contact Information
          </Text>

          <View className="mb-4">
            <Text className="mb-1 text-xs font-medium text-[#73776d]">
              Phone
            </Text>

            <Text className="text-sm font-medium text-[#30352a]">
              {customer.phone}
            </Text>
          </View>

          <View>
            <Text className="mb-1 text-xs font-medium text-[#73776d]">
              Address
            </Text>

            <Text className="text-sm leading-5 text-[#30352a]">
              {customer.address || "No address"}
            </Text>
          </View>
        </View>

        <View className="mb-4 rounded-2xl border border-[#ded8cf] bg-white p-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-base font-bold text-[#30352a]">
              Membership
            </Text>

            {customer.membership && (
              <Pressable
                onPress={openEditMembership}
                className="rounded-xl bg-[#eae2d6] px-4 py-2"
              >
                <Text className="text-xs font-bold text-[#4b5141]">
                  Edit
                </Text>
              </Pressable>
            )}
          </View>

          {customer.membership ? (
            <>
              <View className="mb-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-xs text-[#73776d]">
                    Member Code
                  </Text>

                  <Text className="mt-1 text-sm font-semibold text-[#30352a]">
                    {customer.membership.memberCode}
                  </Text>
                </View>

                <View
                  className={`rounded-full px-3 py-1.5 ${
                    customer.membership.isActive
                      ? "bg-[#eae2d6]"
                      : "bg-[#eeeeee]"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      customer.membership.isActive
                        ? "text-[#4b5141]"
                        : "text-[#73776d]"
                    }`}
                  >
                    {customer.membership.isActive
                      ? "Active"
                      : "Inactive"}
                  </Text>
                </View>
              </View>

              <View className="mb-4 rounded-xl bg-[#f7f2eb] px-4 py-3">
                <Text className="text-xs text-[#73776d]">
                  Discount
                </Text>

                <Text className="mt-1 text-lg font-bold text-[#8b9a6e]">
                  {customer.membership.discountPercent}%
                </Text>
              </View>

              <View className="rounded-xl bg-[#f7f2eb] px-4 py-3">
                <Text className="text-sm leading-5 text-[#4b5141]">
                  This customer is registered as a laundry member.
                </Text>
              </View>
            </>
          ) : (
            <>
              <View className="rounded-xl bg-[#f7f2eb] px-4 py-3">
                <Text className="text-sm leading-5 text-[#73776d]">
                  This customer is not a member.
                </Text>
              </View>

              <Pressable
                onPress={openAddMembership}
                className="mt-4 items-center rounded-xl bg-[#8b9a6e] px-4 py-3"
              >
                <Text className="font-semibold text-white">
                  Add Membership
                </Text>
              </Pressable>
            </>
          )}
        </View>

        <View className="rounded-2xl border border-[#ded8cf] bg-white p-5">
          <Text className="mb-4 text-base font-bold text-[#30352a]">
            Customer Status
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-[#73776d]">
              Account Status
            </Text>

            <View
              className={`rounded-full px-3 py-1.5 ${
                customer.isActive
                  ? "bg-[#eae2d6]"
                  : "bg-[#eeeeee]"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  customer.isActive
                    ? "text-[#4b5141]"
                    : "text-[#73776d]"
                }`}
              >
                {customer.isActive ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isMembershipModalOpen}
        transparent
        animationType="slide"
        onRequestClose={closeMembershipModal}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View className="rounded-t-3xl bg-[#f7f2eb] px-5 pb-8 pt-5">
            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-[#30352a]">
                  {customer.membership
                    ? "Edit Membership"
                    : "Add Membership"}
                </Text>

                <Text className="mt-1 text-sm text-[#73776d]">
                  {customer.membership
                    ? "Update membership settings"
                    : `Add membership for ${customer.name}`}
                </Text>
              </View>

              <Pressable
                onPress={closeMembershipModal}
                className="h-9 w-9 items-center justify-center rounded-full bg-white"
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="#30352a"
                />
              </Pressable>
            </View>

            <View className="rounded-2xl border border-[#ded8cf] bg-white p-5">
              <Text className="mb-2 text-sm font-semibold text-[#30352a]">
                Discount Percentage
              </Text>

              <View className="flex-row items-center rounded-xl border border-[#ded8cf] bg-[#f7f2eb] px-4">
                <TextInput
                  value={discountPercent}
                  onChangeText={setDiscountPercent}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor="#a1a39d"
                  className="flex-1 py-3.5 text-base text-[#30352a]"
                />

                <Text className="text-base font-semibold text-[#73776d]">
                  %
                </Text>
              </View>

              {customer.membership && (
                <Pressable
                  onPress={() =>
                    setIsMembershipActive(!isMembershipActive)
                  }
                  className="mt-5 flex-row items-center justify-between rounded-xl bg-[#f7f2eb] px-4 py-3"
                >
                  <View>
                    <Text className="text-sm font-semibold text-[#30352a]">
                      Membership Status
                    </Text>

                    <Text className="mt-1 text-xs text-[#73776d]">
                      {isMembershipActive
                        ? "Membership is active"
                        : "Membership is inactive"}
                    </Text>
                  </View>

                  <View
                    className={`h-7 w-12 justify-center rounded-full px-1 ${
                      isMembershipActive
                        ? "bg-[#8b9a6e]"
                        : "bg-[#d8d2c9]"
                    }`}
                  >
                    <View
                      className={`h-5 w-5 rounded-full bg-white ${
                        isMembershipActive
                          ? "self-end"
                          : "self-start"
                      }`}
                    />
                  </View>
                </Pressable>
              )}
            </View>

            <Pressable
              onPress={handleSaveMembership}
              disabled={isSavingMembership}
              className={`mt-4 items-center rounded-xl px-4 py-3.5 ${
                isSavingMembership
                  ? "bg-[#aeb79b]"
                  : "bg-[#8b9a6e]"
              }`}
            >
              <Text className="font-semibold text-white">
                {isSavingMembership
                  ? "Saving..."
                  : "Save Membership"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}