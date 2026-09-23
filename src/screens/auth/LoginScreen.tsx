import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/appNavigator";

import { useState } from "react";
import { Text, TextInput, View, Button } from "react-native";
import { login } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({navigation}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const setUser = useAuthStore((state) => state.setUser);
  
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-2 text-base font-medium">
        Email
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="your email"
        className="border rounded-xl border-gray-300 px-4 py-3"
      />

      <Text className="mb-2 mt-3 text-base font-medium">
        Password
      </Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="your password"
        secureTextEntry
        className="border rounded-xl border-gray-300 px-4 py-3"
      />

      <Button
        title="Login"
        onPress={async () => {
          try {
            const user = await login({
              email,
              password
            })

            setUser(user);
            console.log("login berhasil", user)

            navigation.navigate("Dashboard");
          } catch (error) {
            console.log("login gagal", error)
          }
        }}
      />
    </View>
  );
}