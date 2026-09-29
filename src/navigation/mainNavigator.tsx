import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import DashboardScreen from "../screens/dashboard/DashboardScreen";
import OrdersScreen from "../screens/orders/OrdersScreen";
import CustomersScreen from "../screens/customers/CustomersScreen";
import ServicesScreen from "../screens/services/ServicesScreen";
import OrderDetailScreen from "../screens/orders/OrderDetailScreen";
import CustomerDetailScreen from "../screens/customers/CustomerDetailScreen";
import ServiceDetailScreen from "../screens/services/ServiceDetailScreen";
import UserDetailScreen from "../screens/users/UserDetailScreen";
import UsersScreen from "../screens/users/UsersScreen";
import CreateOrderScreen from "../screens/orders/CreateOrderScreen";
import PaymentHistoriesScreen from "../screens/payment/PaymentHistoriesScreen";
import { useAuthStore } from "../store/authStore";

export type MainTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Customers: undefined;
  PaymentHistories: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  OrderDetail: {
    orderId: number;
  };
  CreateOrder: undefined;
  Orders: undefined;
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
  const user = useAuthStore((state) => state.user);

  const isAdmin = user?.role === "ADMIN";

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#8b9a6e",
        tabBarInactiveTintColor: "#9a9d94",
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 2,
        },
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 14,
          height: 68,
          borderRadius: 24,
          borderTopWidth: 0,
          backgroundColor: "#ffffff",
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 8,
          elevation: 8,
          shadowColor: "#30352a",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        tabBarItemStyle: {
          borderRadius: 18,
          marginHorizontal: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName:
            | "grid-outline"
            | "grid"
            | "receipt-outline"
            | "receipt"
            | "people-outline"
            | "people"
            | "card-outline"
            | "card";

          if (route.name === "Dashboard") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "Orders") {
            iconName = focused
              ? "receipt"
              : "receipt-outline";
          } else if (route.name === "Customers") {
            iconName = focused
              ? "people"
              : "people-outline";
          } else {
            iconName = focused
              ? "card"
              : "card-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={focused ? size + 1 : size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: "Home",
        }}
      />

      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: "Orders",
        }}
      />

      <Tab.Screen
        name="Customers"
        component={CustomersScreen}
        options={{
          tabBarLabel: "Customers",
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="PaymentHistories"
          component={PaymentHistoriesScreen}
          options={{
            tabBarLabel: "Payments",
          }}
        />
      )}
    </Tab.Navigator>  
  );
}

export default function MainNavigator() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";

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
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CreateOrder"
        component={CreateOrderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={{ headerShown: false }}
      />

      {isAdmin && (
        <>
          <Stack.Screen
            name="Services"
            component={ServicesScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ServiceDetail"
            component={ServiceDetailScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Users"
            component={UsersScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="UserDetail"
            component={UserDetailScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}