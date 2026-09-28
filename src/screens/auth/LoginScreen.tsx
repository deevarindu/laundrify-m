import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/appNavigator";
import { useState } from "react";
import { Text, TextInput, View, Pressable } from "react-native";
import axios from "axios";
import { login } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const user = await login({
        email: email.trim(),
        password,
      });

      setUser(user);
      navigation.navigate("Main");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ?? "Failed to login."
        );
      } else {
        setError("Failed to login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-[#f7f2eb] px-5 py-10">
      <View className="w-full max-w-md rounded-[28px] border border-[#e3dbcf] bg-white p-7">
        <View className="mb-8">
          <Text className="text-2xl font-semibold tracking-tight text-[#30352a]">
            Sign in
          </Text>

          <Text className="mt-2 text-sm text-[#73776d]">
            Sign in to your Laundrify account.
          </Text>
        </View>

        {error ? (
          <View className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <Text className="text-sm text-red-700">
              {error}
            </Text>
          </View>
        ) : null}

        <View className="mb-5">
          <Text className="mb-2 text-sm font-medium text-[#4b5141]">
            Email
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            className="h-11 rounded-xl border border-[#d8d2c9] bg-[#faf9f6] px-4"
          />
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-[#4b5141]">
            Password
          </Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            className="h-11 rounded-xl border border-[#d8d2c9] bg-[#faf9f6] px-4"
          />
        </View>

        <Pressable
          disabled={loading}
          onPress={handleLogin}
          className={`h-11 items-center justify-center rounded-xl bg-[#8b9a6e] ${
            loading ? "opacity-60" : ""
          }`}
        >
          <Text className="font-medium text-white">
            {loading ? "Signing in..." : "Sign In"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}