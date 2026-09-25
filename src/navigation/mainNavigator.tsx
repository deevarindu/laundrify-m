import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import DashboardScreen from "../screens/dashboard/DashboardScreen";
import OrdersScreen from "../screens/orders/OrdersScreen";
import CustomersScreen from "../screens/customers/CustomersScreen";
import ServicesScreen from "../screens/services/ServicesScreen";

import OrderDetailScreen from "../screens/orders/OrderDetailScreen";
import CustomerDetailScreen from "../screens/customers/CustomerDetailScreen";
import ServiceDetailScreen from "../screens/services/ServiceDetailScreen";
import UserDetailScreen from "../screens/users/UserDetailScreen";
import UsersScreen from "../screens/users/UsersScreen";

export type MainTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Customers: undefined;
  PaymentHistory: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;

  OrderDetail: {
    orderId: number;
  };

  CustomerDetail: {
    customerId: number;
  };

  Services: undefined;

  ServiceDetail: {
    serviceId: number;
  };

  Users: undefined;

  UserDetail: {
    userId: number;
  };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ headerShown: false}}
      />

      <Tab.Screen
        name="Customers"
        component={CustomersScreen}
        options={{  headerShown: false }}
      />

      {/* <Tab.Screen
        name="PaymentHistory"
        component={PaymentHistoryScreen}
        options={{  headerShown: false }}
      /> */}
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
      />

      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
      />

      <Stack.Screen
        name="Services"
        component={ServicesScreen}
        options={{  headerShown: false }}
      />

      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
      />

      <Stack.Screen
        name="Users"
        component={UsersScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="UserDetail"
        component={UserDetailScreen}
      />
    </Stack.Navigator>
  );
}