import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList } from "../../navigation/mainNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";

type Props = NativeStackScreenProps<MainStackParamList, "CreateOrder">

export default function CreateOrder({navigation}: Props) {


  return(
    <SafeAreaView>
      <ScrollView>
        
      </ScrollView>
    </SafeAreaView>
  )
}