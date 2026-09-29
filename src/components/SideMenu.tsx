import { Pressable, Text, View } from "react-native";
import { useAuthStore } from "../store/authStore";

type Props = {
  visible: boolean;
  onClose: () => void;
  onUsersPress: () => void;
  onServicesPress: () => void;
};

export default function SideMenu({ visible, onClose, onUsersPress, onServicesPress }: Props) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";

  if (!visible) {
    return null;
  }

  return (
    <View className="absolute inset-0 z-50 flex-row">
      <View className="h-full w-4/5 bg-white px-6 pt-16">
        <Text className="mb-8 text-2xl font-bold">
          Menu
        </Text>

        {isAdmin && (
          <>
            <Pressable
              onPress={onUsersPress}
              className="mb-4"
            >
              <Text className="text-lg">
                Users
              </Text>
            </Pressable>

            <Pressable
              onPress={onServicesPress}
              className="mb-4"
            >
              <Text className="text-lg">
                Services
              </Text>
            </Pressable>
          </>
        )}
      </View>

      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/10"
      />
    </View>
  );
}