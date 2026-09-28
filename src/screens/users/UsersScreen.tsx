import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../navigation/mainNavigator";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getUsers } from "../../services/userService";
import type { User } from "../../types/user";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

type Props = NativeStackScreenProps<MainStackParamList, "Users">;

export default function UsersScreen({ navigation }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useFocusEffect(
    useCallback(() => {
      const fetchUsers = async () => {
        try {
          const data = await getUsers();

          console.log("USERS API:", JSON.stringify(data, null, 2));

          setUsers(data);
        } catch (error) {
          console.log("gagal fetch users:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUsers();
  }, []));

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.role.toLowerCase().includes(keyword)
    );
  }, [users, search]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f7f2eb]">
        <Text className="text-sm text-[#73776d]">
          Loading users...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f2eb]">
      <Header
        title="Users"
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
          paddingBottom: 36,
        }}
      >
        <View className="mb-6 mt-5">
          <Text className="text-2xl font-bold text-[#30352a]">
            Users
          </Text>

          <Text className="mt-1 text-sm text-[#73776d]">
            Manage staff and administrator accounts
          </Text>
        </View>

        <View className="mb-5 flex-row items-center rounded-2xl border border-[#ded8cf] bg-white px-4">
          <Ionicons
            name="search-outline"
            size={20}
            color="#73776d"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search user..."
            placeholderTextColor="#a1a39d"
            className="ml-3 flex-1 py-3.5 text-sm text-[#30352a]"
          />
        </View>

        <View className="mb-4">
          <Text className="text-lg font-bold text-[#30352a]">
            User List
          </Text>

          <Text className="mt-1 text-xs text-[#73776d]">
            {filteredUsers.length} user
            {filteredUsers.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {filteredUsers.length === 0 ? (
          <View className="items-center rounded-2xl border border-[#ded8cf] bg-white px-5 py-10">
            <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#eae2d6]">
              <Ionicons
                name="search-outline"
                size={22}
                color="#8b9a6e"
              />
            </View>

            <Text className="text-base font-semibold text-[#30352a]">
              No users found
            </Text>

            <Text className="mt-1 text-center text-sm text-[#73776d]">
              Try another search.
            </Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <Pressable
              key={user.id}
              onPress={() =>
                navigation.navigate("UserDetail", {
                  userId: user.id,
                })
              }
              className="mb-3 rounded-2xl border border-[#ded8cf] bg-white p-4"
            >
              <View className="flex-row items-start">
                <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-[#eae2d6]">
                  <Text className="text-base font-bold text-[#4b5141]">
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View className="flex-1">
                  <View className="flex-row items-start justify-between">
                    <View className="mr-3 flex-1">
                      <Text
                        className="text-base font-bold text-[#30352a]"
                        numberOfLines={1}
                      >
                        {user.name}
                      </Text>

                      <Text
                        className="mt-1 text-sm text-[#73776d]"
                        numberOfLines={1}
                      >
                        {user.email}
                      </Text>
                    </View>

                    <View className="rounded-full bg-[#eae2d6] px-3 py-1.5">
                      <Text className="text-xs font-semibold text-[#4b5141]">
                        {user.role}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-3 flex-row items-center justify-between border-t border-[#ded8cf] pt-3">
                    <View className="flex-row items-center">
                      <View
                        className={`mr-2 h-2 w-2 rounded-full ${
                          user.isActive
                            ? "bg-[#8b9a6e]"
                            : "bg-[#b85c5c]"
                        }`}
                      />

                      <Text className="text-xs font-medium text-[#73776d]">
                        {user.isActive ? "Active" : "Inactive"}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Text className="mr-1 text-xs font-semibold text-[#8b9a6e]">
                        View details
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={15}
                        color="#8b9a6e"
                      />
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}