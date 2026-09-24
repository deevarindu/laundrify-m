import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList, MainTabParamList } from "../../navigation/mainNavigator";
import { View, Text, Button } from "react-native";
import { useEffect, useState } from "react";
import { User } from "../../types/user";
import { getUsers } from "../../services/userService";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Users">,
  NativeStackScreenProps<MainStackParamList>
>

export default function UsersScreen({navigation}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  
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
    <View>
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
    </View>
  )
}
