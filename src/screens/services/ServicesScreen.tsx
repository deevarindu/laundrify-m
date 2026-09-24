import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList, MainTabParamList } from "../../navigation/mainNavigator";
import { View, Text, Button } from "react-native";
import { useEffect, useState } from "react";
import { Service } from "../../types/service";
import { getServices } from "../../services/serviceService";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Services">,
  NativeStackScreenProps<MainStackParamList>
>

export default function ServicesScreen({navigation}: Props) {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const services = await getServices();

        setServices(services);
        console.log("berhasil fetch services: ", services)
      } catch (error) {
        console.log("gagal fetch", error)
      }
    };

    fetchServices();
  }, [])
  
  return (
    <View>
      {services.map((services) => (
        <View key={services.id}>
          <Text>{services.id}</Text>
          <Text>{services.name}</Text>

          <Button
            title="View Service Detail"
            onPress={async () => navigation.navigate("ServiceDetail", {
              serviceId: services.id
            })}
          />
        </View>
      ))}  
    </View>
  )
}