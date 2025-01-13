import React, { useReducer } from "react";
import { StyleSheet, Button, View } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./components/Home/Home";
import MyUserReducer from "./reducers/MyReducers";
import Contexts from "./configs/Contexts";
import ActiveUser from "./components/User/ActiveUser";
import PayMonthlyFee from "./components/MonthlyFee/PayMonthlyFee";
import Login from "./components/User/Login";
import { StripeProvider } from "@stripe/stripe-react-native";
import MonthlyFee from "./components/MonthlyFee/MonthlyFee";
import Transaction from "./components/MonthlyFee/MonthlyFee";
import MonthlyFeeDetail from "./components/MonthlyFee/MonthlyFeeDetail";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegisterVehicleCard from "./components/VehicleCard/RegisterVehicleCard";
import ListVehicleCards from "./components/VehicleCard/ListVehicleCards";
import Chat from "./components/Chat/Chat";

const Stack = createNativeStackNavigator();

const TransactionStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Monthly fee"
      component={MonthlyFee}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Monthly fee detail"
      component={MonthlyFeeDetail}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const VehicleNativeStack = createNativeStackNavigator();

const VehicleStack = () => (
  <VehicleNativeStack.Navigator>
    <VehicleNativeStack.Screen
      name="Register vehicle card"
      component={RegisterVehicleCard}
      options={{ headerShown: false }}
    />
    <VehicleNativeStack.Screen
      name="List vehicle cards"
      component={ListVehicleCards}
      options={{ headerShown: false }}
    />
  </VehicleNativeStack.Navigator>
);

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const [user, dispatch] = React.useContext(Contexts);

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      {user && (
        <Button
          title="Logout"
          onPress={() => {
            dispatch({ type: "logout" });
          }}
        />
      )}
    </DrawerContentScrollView>
  );
};

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <StripeProvider publishableKey="pk_test_51QVllgLGRlPpjKfjb0kJx1duZJodKVhBPgUrlEqAWHSweobrx0xToWMeFmfwbfMQ72QOzSOTnDyqjR5Fq6XODa1H007P3RGFcj">
      <Contexts.Provider value={[user, dispatch]}>
        <NavigationContainer>
          <Drawer.Navigator
            initialRouteName="Home"
            drawerContent={(props) => <CustomDrawerContent {...props} />}
          >
            <Drawer.Screen name="Home" component={Home} />
            {user ? (
              <>
                <Drawer.Screen name={user.username} component={Home} />
                <Drawer.Screen
                  name="Pay monthly fee"
                  component={PayMonthlyFee}
                />
                <Drawer.Screen
                  name="Transaction"
                  component={TransactionStack}
                />
                <Drawer.Screen name="Vehicle card" component={VehicleStack} />
                <Drawer.Screen name="Chat" component={Chat}></Drawer.Screen>
              </>
            ) : (
              <>
                <Drawer.Screen name="Login" component={Login} />
                <Drawer.Screen name="Active user" component={ActiveUser} />
              </>
            )}
          </Drawer.Navigator>
        </NavigationContainer>
      </Contexts.Provider>
    </StripeProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
