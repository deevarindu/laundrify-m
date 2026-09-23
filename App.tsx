import { useEffect } from "react";
import "./global.css";
import { NavigationContainer } from "@react-navigation/native";

import { useAuthStore } from "./src/store/authStore";
import AppNavigator from "./src/navigation/appNavigator";

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <NavigationContainer>
      <AppNavigator/>
    </NavigationContainer>
  );
}
