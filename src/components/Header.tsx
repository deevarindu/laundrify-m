import { Pressable, Text, View } from "react-native";

type Props = {
  title: string;
  onMenuPress: () => void;
};

export default function Header({ title, onMenuPress }: Props) {
  return (
    <View className="flex-row items-center justify-between px-6 py-4">
      <Pressable onPress={onMenuPress}>
        <Text className="text-2xl">☰</Text>
      </Pressable>

      <Text className="text-xl font-bold text-gray-900">
        {title}
      </Text>

      <View className="w-8" />
    </View>
  );
}