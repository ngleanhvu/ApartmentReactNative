import { View, Text, TouchableOpacity } from "react-native";
import Styles from "./Styles";
import styles from "../../styles/styles";
import { ActivityIndicator, TextInput } from "react-native-paper";
import { useContext, useState, useCallback } from "react";
import Contexts from "../../configs/Contexts";
import APIs, { authApis, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAvoidingView } from "react-native";
import _ from "lodash";
import debounce from "../../utils/debounce";

const Login = ({ navigation }) => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [user, dispatch] = useContext(Contexts);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);
      let res = await APIs.post(endpoints["login"], {
        username: username,
        password: password,
        client_id: "RM61ZfvNgGxxg9ijdKyy4GPjfCGDGMF1LXzQ3oPt",
        client_secret:
          "M9P4hdBSyGR16yaLJfyxTAkPs6xofPNT7Q97dArowULlKnO3uFTFyl7EXpckESttrClJoXsqKGsz4l6RxxrrJ7g7Ktz7pZHPQbcuE2O004uTBZjHSpBqJ2APlrex2NW3",
        grant_type: "password",
      });

      console.log(res.data);

      setTimeout(async () => {
        const user = await authApis(res.data.access_token).get(
          endpoints["current-user"]
        );
        console.log(user.data.changed_password);
        if (user.data.changed_password === false) {
          alert("Vui lòng kích hoạt tài khoản!");
          navigation.navigate("Active user");
        } else {
          await AsyncStorage.setItem("access_token", res.data.access_token);
          dispatch({
            type: "login",
            payload: user.data,
          });
          navigation.navigate("Home");
        }
      });
    } catch (e) {
      console.log(e);
      alert("Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = debounce(login, 1000);

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
            label="Tên đăng nhập"
            style={styles.margin}
          />
          <TextInput
            value={password}
            onChangeText={(p) => setPassword(p)}
            label="Mật khẩu"
            style={styles.margin}
            secureTextEntry={true}
          />
          <TouchableOpacity style={Styles.button} onPress={handleLogin}>
            <Text style={Styles.text}>Đăng nhập</Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
};

export default Login;
