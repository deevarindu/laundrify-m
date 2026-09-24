import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList } from "../../navigation/mainNavigator";
import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { Service } from "../../types/service";
import { getServiceById, getServices } from "../../services/serviceService";

type Props = NativeStackScreenProps<MainStackParamList, "ServiceDetail">

export default function ServiceDetailScreen({route}: Props) {
  const {serviceId} = route.params
  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const service = await getServiceById(serviceId);

        setService(service);
        console.log("berhasil fetch service:", service)
      } catch (error) {
        console.log("gagal fetch service", error)
      }
    }

    fetchService();
  }, [])

  return (
    <View>
      <Text>service id: {serviceId}</Text>
      <Text>{service?.name}</Text>
    </View>
  )
}