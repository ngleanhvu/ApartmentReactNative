import { View, Text, TouchableOpacity } from "react-native";
import Styles from "./Styles";
import styles from "../../styles/styles";
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import { useContext, useState } from "react";
import Contexts from "../../configs/Contexts";
import APIs, { authApis, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAvoidingView } from "react-native";

const Login = ({ navigation }) => {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
  const [user, dispatch] = useContext(Contexts);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);
      let res = await APIs.post(endpoints["login"], {
        username: username,
        password: password,
        client_id: "avNDRFvIcem1sLjC5ZXcE8FZsDN3qVPBH1T4e4Eo",
        client_secret:
          "nlOzWqZUjDaov9MMmVeNWBOElG48il82i0Sr0IUxtcf7bOt06HvWONHxHYibgrhDyMWIwfJvwqMRJ42MXkMiEuks6sBdu8rfiXcHKtXTEmpgv9BhcdCJUaEvA32AKRSM",
        grant_type: "password",
      });

      await AsyncStorage.setItem("access_token", res.data.access_token);

      setTimeout(async () => {
        const user = await authApis(res.data.access_token).get(
          endpoints["current-user"]
        );
        console.log(user.data.changed_password);
        if (user.data.changed_password === false) {
          alert("Vui lòng kích hoạt tài khoản!");
          navigation.navigate("Active user");
        } else {
          dispatch({
            type: "login",
            payload: user.data,
          });
          navigation.navigate("Home");
        }
      }, 1000);
    } catch (e) {
      alert("Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }

    // if (username === "Admin" && password === "1234") {
    //   dispatch({
    //     type: "login",
    //     payload: {
    //       username: "Admin",
    //     },
    //   });
    //   navigation.navigate("Home");
    // } else {
    //   alert("Đăng nhập thất bại!");
    // }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text style={styles.subject}>Login</Text>
          <TextInput
            value={username}
            onChangeText={(u) => setUserName(u)}
            placeholder="Tên đăng nhập"
            style={Styles.input}
          />
          <TextInput
            value={password}
            onChangeText={(p) => setPassword(p)}
            placeholder="Mật khẩu"
            style={Styles.input}
            secureTextEntry={true}
          />
          <TouchableOpacity style={Styles.button} onPress={login}>
            <Text style={Styles.text}>Đăng nhập</Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
};

export default Login;
