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
            dispatch({ type: "logout" }); // Cập nhật trạng thái đăng xuất
          }}
        />
      )}
    </DrawerContentScrollView>
  );
};

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
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
              <Drawer.Screen name="Pay monthly fee" component={PayMonthlyFee} />
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
