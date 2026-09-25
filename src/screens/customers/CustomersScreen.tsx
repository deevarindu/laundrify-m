import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { MainTabParamList, MainStackParamList } from "../../navigation/mainNavigator";
import { useEffect, useState } from "react";
import { Customer } from "../../types/customer";
import { View, Text, Button, ScrollView } from "react-native";
import { getCustomers } from "../../services/customerService";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Customers">,
  NativeStackScreenProps<MainStackParamList>
>

export default function CustomersScreen({navigation}: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customers = await getCustomers();

        setCustomers(customers);
        console.log("fetch customers berhasil:", customers)
      } catch (error) {
        console.log("fetch customer gagal", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  if (isLoading) {
    return (
      <View>
        <Text>Loading Customers...</Text>
      </View>
    );
  }

  if (customers.length === 0) {
    return (
      <View>
        <Text>No customers yet.</Text>
      </View>
    )
  }

  return (
    <SafeAreaView>
      <ScrollView className="mx-3">
        <Header
          title="Customers"
          onMenuPress={() => setIsMenuOpen(true)}
        />
        <SideMenu
          visible={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onUsersPress={() => {
            setIsMenuOpen(false);
            navigation.navigate("Users");
          }}
          onServicesPress={() => {
            setIsMenuOpen(false);
            navigation.navigate("Services");
          }}
        />
        {customers.map((customers) => (
          <View key={customers.id}>
            <Text>{customers.name}</Text>
            <Text>{customers.phone}</Text>
            <Text>{customers.address}</Text>

            <Button
              title="View Customer Detail"
              onPress={() => navigation.navigate("CustomerDetail", {
                customerId: customers.id
              })}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}