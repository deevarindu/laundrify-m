import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList } from "../../navigation/mainNavigator";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { User } from "../../types/user";
import {
  deleteUser,
  getUserById,
  updateUser,
} from "../../services/userService";

type Props = NativeStackScreenProps<MainStackParamList, "UserDetail">;

export default function UserDetailScreen({ route, navigation }: Props) {
  const { userId } = route.params;

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [password, setPassword] = useState("");

  const fetchUser = async () => {
    try {
      const data = await getUserById(userId);

      setUser(data);
      console.log("berhasil fetch user:", data);
    } catch (error) {
      console.log("gagal fetch user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const openEditModal = () => {
    if (!user) {
      return;
    }

    setName(user.name);
    setEmail(user.email);
    setRole(user.role === "ADMIN" ? "ADMIN" : "STAFF");
    setPassword("");
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Invalid Name", "Name cannot be empty.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Invalid Email", "Email cannot be empty.");
      return;
    }

    try {
      setIsSaving(true);

      const data: {
        name: string;
        email: string;
        role: "ADMIN" | "STAFF";
        password?: string;
      } = {
        name: name.trim(),
        email: email.trim(),
        role,
      };

      if (password.trim()) {
        data.password = password.trim();
      }

      const updatedUser = await updateUser(userId, data);

      setUser(updatedUser);
      setIsEditOpen(false);
      setPassword("");

      Alert.alert("Success", "User updated successfully.");
    } catch (error: any) {
      console.log("gagal update user:", error);

      const message =
        error?.response?.data?.message ||
        "Failed to update user.";

      Alert.alert("Update Failed", message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user?.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);

      await deleteUser(userId);

      Alert.alert(
        "Success",
        "User deleted successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.log("gagal delete user:", error);

      const message =
        error?.response?.data?.message ||
        "Failed to delete user.";

      Alert.alert("Delete Failed", message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f7f2eb]">
        <Text className="text-sm text-[#73776d]">
          Loading user...
        </Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-[#f7f2eb]">
        <View className="flex-row items-center px-5 py-4">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#30352a"
            />
          </Pressable>

          <Text className="text-xl font-bold text-[#30352a]">
            User Detail
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[#eae2d6]">
            <Ionicons
              name="person-outline"
              size={28}
              color="#73776d"
            />
          </View>

          <Text className="text-base font-semibold text-[#30352a]">
            User not found
          </Text>

          <Text className="mt-1 text-center text-sm text-[#73776d]">
            The user data could not be loaded.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const roleLabel =
    user.role === "ADMIN"
      ? "Admin"
      : user.role === "STAFF"
      ? "Staff"
      : user.role;

  return (
    <SafeAreaView className="flex-1 bg-[#f7f2eb]">
      <View className="flex-row items-center justify-between px-5 py-4">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#30352a"
            />
          </Pressable>

          <Text className="text-xl font-bold text-[#30352a]">
            User Detail
          </Text>
        </View>

        <Pressable
          onPress={openEditModal}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#8b9a6e]"
        >
          <Ionicons
            name="create-outline"
            size={20}
            color="#ffffff"
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 36,
        }}
      >
        <View className="mb-5 items-center rounded-2xl border border-[#ded8cf] bg-white px-5 py-7">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-[#eae2d6]">
            <Text className="text-3xl font-bold text-[#4b5141]">
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text className="text-xl font-bold text-[#30352a]">
            {user.name}
          </Text>

          <Text className="mt-1 text-sm text-[#73776d]">
            {user.email}
          </Text>

          <View className="mt-4 flex-row items-center">
            <View className="rounded-full bg-[#eae2d6] px-3 py-1.5">
              <Text className="text-xs font-semibold text-[#4b5141]">
                {roleLabel}
              </Text>
            </View>

            <View
              className={`ml-2 rounded-full px-3 py-1.5 ${
                user.isActive
                  ? "bg-[#e7efdc]"
                  : "bg-[#f3dddd]"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  user.isActive
                    ? "text-[#63744d]"
                    : "text-[#a04e4e]"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-5 rounded-2xl border border-[#ded8cf] bg-white p-5">
          <Text className="mb-4 text-lg font-bold text-[#30352a]">
            User Information
          </Text>

          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#eae2d6]">
              <Ionicons
                name="person-outline"
                size={19}
                color="#8b9a6e"
              />
            </View>

            <View className="flex-1">
              <Text className="text-xs text-[#73776d]">
                Full Name
              </Text>

              <Text className="mt-1 text-sm font-semibold text-[#30352a]">
                {user.name}
              </Text>
            </View>
          </View>

          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#eae2d6]">
              <Ionicons
                name="mail-outline"
                size={19}
                color="#8b9a6e"
              />
            </View>

            <View className="flex-1">
              <Text className="text-xs text-[#73776d]">
                Email
              </Text>

              <Text className="mt-1 text-sm font-semibold text-[#30352a]">
                {user.email}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#eae2d6]">
              <Ionicons
                name="shield-checkmark-outline"
                size={19}
                color="#8b9a6e"
              />
            </View>

            <View className="flex-1">
              <Text className="text-xs text-[#73776d]">
                Role
              </Text>

              <Text className="mt-1 text-sm font-semibold text-[#30352a]">
                {roleLabel}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-5 rounded-2xl border border-[#ded8cf] bg-white p-5">
          <Text className="mb-4 text-lg font-bold text-[#30352a]">
            Account Status
          </Text>

          <View className="flex-row items-center">
            <View
              className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${
                user.isActive
                  ? "bg-[#e7efdc]"
                  : "bg-[#f3dddd]"
              }`}
            >
              <Ionicons
                name={
                  user.isActive
                    ? "checkmark-circle-outline"
                    : "close-circle-outline"
                }
                size={23}
                color={
                  user.isActive
                    ? "#63744d"
                    : "#a04e4e"
                }
              />
            </View>

            <View className="flex-1">
              <Text className="text-sm font-semibold text-[#30352a]">
                {user.isActive
                  ? "Account is active"
                  : "Account is inactive"}
              </Text>

              <Text className="mt-1 text-xs text-[#73776d]">
                {user.isActive
                  ? "This user can access the application."
                  : "This user cannot access the application."}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleDelete}
          disabled={isDeleting}
          className="mb-3 flex-row items-center justify-center rounded-2xl border border-[#e4bebe] bg-white py-4"
        >
          <Ionicons
            name="trash-outline"
            size={19}
            color="#b85c5c"
          />

          <Text className="ml-2 text-sm font-semibold text-[#b85c5c]">
            {isDeleting ? "Deleting..." : "Delete User"}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={isEditOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[90%] rounded-t-3xl bg-[#f7f2eb] px-5 pb-8 pt-5">
            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-[#30352a]">
                  Edit User
                </Text>

                <Text className="mt-1 text-sm text-[#73776d]">
                  Update user information
                </Text>
              </View>

              <Pressable
                onPress={() => setIsEditOpen(false)}
                className="h-9 w-9 items-center justify-center rounded-full bg-white"
              >
                <Ionicons
                  name="close"
                  size={21}
                  color="#30352a"
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text className="mb-2 text-sm font-semibold text-[#30352a]">
                Full Name
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor="#a1a39d"
                className="mb-4 rounded-xl border border-[#ded8cf] bg-white px-4 py-3.5 text-sm text-[#30352a]"
              />

              <Text className="mb-2 text-sm font-semibold text-[#30352a]">
                Email
              </Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                placeholderTextColor="#a1a39d"
                keyboardType="email-address"
                autoCapitalize="none"
                className="mb-4 rounded-xl border border-[#ded8cf] bg-white px-4 py-3.5 text-sm text-[#30352a]"
              />

              <Text className="mb-2 text-sm font-semibold text-[#30352a]">
                Role
              </Text>

              <View className="mb-4 flex-row">
                <Pressable
                  onPress={() => setRole("ADMIN")}
                  className={`mr-3 flex-1 items-center rounded-xl border py-3.5 ${
                    role === "ADMIN"
                      ? "border-[#8b9a6e] bg-[#eae2d6]"
                      : "border-[#ded8cf] bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      role === "ADMIN"
                        ? "text-[#4b5141]"
                        : "text-[#73776d]"
                    }`}
                  >
                    Admin
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setRole("STAFF")}
                  className={`flex-1 items-center rounded-xl border py-3.5 ${
                    role === "STAFF"
                      ? "border-[#8b9a6e] bg-[#eae2d6]"
                      : "border-[#ded8cf] bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      role === "STAFF"
                        ? "text-[#4b5141]"
                        : "text-[#73776d]"
                    }`}
                  >
                    Staff
                  </Text>
                </Pressable>
              </View>

              <Text className="mb-2 text-sm font-semibold text-[#30352a]">
                New Password
              </Text>

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Leave blank to keep current password"
                placeholderTextColor="#a1a39d"
                secureTextEntry
                autoCapitalize="none"
                className="mb-6 rounded-xl border border-[#ded8cf] bg-white px-4 py-3.5 text-sm text-[#30352a]"
              />

              <Pressable
                onPress={handleUpdate}
                disabled={isSaving}
                className="items-center rounded-xl bg-[#8b9a6e] py-4"
              >
                <Text className="text-sm font-bold text-white">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}