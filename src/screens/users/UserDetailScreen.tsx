import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList } from "../../navigation/mainNavigator";
import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { User } from "../../types/user";
import { getUserById, getUsers } from "../../services/userService";

type Props = NativeStackScreenProps<MainStackParamList, "UserDetail">

export default function UserDetailScreen({route}: Props) {
  const {userId} = route.params;
  const [user, setUser] = useState<User | null> (null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUserById(userId);
  
        setUser(user);
        console.log("berhasil fetch user:", user)
      } catch (error) {
        console.log("gagal fetch user", error)
      }
    }
    fetchUser();
  }, [])

  return (
    <View>
      <Text>user id: {userId}</Text>
      <Text>{user?.name}</Text>
      <Text>{user?.role}</Text>
    </View>
  )
}