import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList } from "../../navigation/mainNavigator";
import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { Customer } from "../../types/customer";
import { getCustomerById } from "../../services/customerService";

type Props = NativeStackScreenProps<MainStackParamList, "CustomerDetail">

export default function CustomerDetailScreen({route}: Props) {
  const {customerId} = route.params;
  const [customer, setCustomer] = useState<Customer |null> (null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const customer = await getCustomerById(customerId);

        setCustomer(customer);
        console.log("berhasil fetch customer:", customer);
      } catch (error) {
        console.log("gagl fetch customer", error)
      }
    }

    fetchCustomer();
  }, [])

  return (
    <View>
      <Text>customer Id: {customerId}</Text>
      <Text>{customer?.name}</Text>
      <Text>{customer?.membership?.memberCode}</Text>
    </View>
  )
}