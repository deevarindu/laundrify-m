import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList, MainTabParamList } from "../../navigation/mainNavigator";
import { View, Text, Button, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { Service } from "../../types/service";
import { getServices } from "../../services/serviceService";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<MainStackParamList, "Services">

export default function ServicesScreen({navigation}: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <SafeAreaView>
      <ScrollView className="mx-3">
        <Header
          title="Services"
          onMenuPress={() => setIsMenuOpen(true)}
        />
        <SideMenu
          visible={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onUsersPress={() => {
            setIsMenuOpen(false);
            navigation.navigate('Users')
          }}
          onServicesPress={() => {
            setIsMenuOpen(false);
            navigation.navigate("Services");
          }}
        />
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
      </ScrollView>
    </SafeAreaView>
  )
}