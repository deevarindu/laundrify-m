import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { MainTabParamList, MainStackParamList } from "../../navigation/mainNavigator";
import { useEffect, useState } from "react";
import { Customer } from "../../types/customer";
import { View, Text, Button } from "react-native";
import { getCustomers } from "../../services/customerService";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Customers">,
  NativeStackScreenProps<MainStackParamList>
>

export default function CustomersScreen({navigation}: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
    <View>
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
    </View>
  )
}