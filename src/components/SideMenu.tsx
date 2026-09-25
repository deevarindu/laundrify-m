import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList } from "../navigation/mainNavigator";
import { Pressable, Text, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onUsersPress: () => void;
  onServicesPress: () => void;
};

export default function SideMenu({visible, onClose, onUsersPress, onServicesPress}: Props) {
  if (!visible) {
    return null;
  }

  return (
    <View className="absolute inset-0 z-50 flex-row">
      <View className="h-full w-4/5 bg-white px-6 pt-16">
        <Text className="mb-8 text-2xl font-bold">
          Menu
        </Text>

        <Pressable
          onPress={onClose}
          className="mb-4"
        >
          <Text className="text-lg">
            Close Menu
          </Text>
        </Pressable>

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
      </View>

      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/10"
      />
    </View>
  );
}