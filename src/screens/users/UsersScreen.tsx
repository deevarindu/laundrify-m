import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList, MainTabParamList } from "../../navigation/mainNavigator";
import { View, Text, Button, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { User } from "../../types/user";
import { getUsers } from "../../services/userService";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<MainStackParamList, "Users">

export default function UsersScreen({navigation}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers();
  
        setUsers(users);
        console.log("berhasil fetch users:", users)
      } catch (error) {
        console.log("gagal fetch users", error)
      }
    }
    fetchUsers();
  }, []);

  return (
    <SafeAreaView>
      <ScrollView className="mx-3">
        <Header
          title="Users"
          onMenuPress={() => setIsMenuOpen(true)}
        />
        <SideMenu
          visible={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onUsersPress={() => {
            setIsMenuOpen(false)
            navigation.navigate("Users")
          }}
          onServicesPress={() => {
            setIsMenuOpen(false)
            navigation.navigate("Services")
          }}
        />
        {users.map((users) => (
          <View key={users.id}>
            <Text>{users.name}</Text>
            <Text>{users.email}</Text>
            <Text>{users.role}</Text>

            <Button
              title="View User Detail"
              onPress={async() => navigation.navigate('UserDetail', {
                userId: users.id
              })}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}
