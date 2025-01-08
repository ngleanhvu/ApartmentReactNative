import { use, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { TextInput } from "react-native-paper";
import styles from "../../styles/styles";
import Styles from "./Styles";
import * as ImagePicker from "expo-image-picker";
import APIs, { authApis, endpoints } from "../../configs/APIs";
import _ from "lodash";

const ActiveUser = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    phone: "",
    password: "",
    retype_password: "",
    avatar: "",
  });

  const change = (field, value) => {
    setUser((current) => {
      return { ...current, [field]: value };
    });
  };

  const activeUser = useCallback(
    _.debounce(async () => {
      setLoading(true);
      try {
        let form = new FormData();
        for (let key in user) {
          if (key === "avatar") {
            form.append("avatar", {
              uri: user["avatar"].uri,
              name: user["avatar"].fileName,
              type: user["avatar"].uri.type,
            });
          } else {
            form.append(key, user[key]);
          }
        }

        const res = await APIs.post(endpoints["active-user"], form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.status === 200) {
          alert("Thành công! Vui lòng đăng nhập.");
          navigation.navigate("Login");
        } else if (res.status === 202) {
          alert("Tài khoản đã kích hoạt trước đó");
          navigation.navigate("Login");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setUser({
          phone: "",
          password: "",
          retype_password: "",
          avatar: "",
        });
      }
    }, 1000),
    [user, navigation]
  );

  const pickImage = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permissions denied!");
    } else {
      const result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) {
        change("avatar", result.assets[0]);
      }
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text style={styles.subject}>Kích hoạt tài khoản</Text>
          <TextInput
            value={user.phone}
            onChangeText={(t) => change("phone", t)}
            placeholder="Số điện thoại"
            style={Styles.input}
          />
          <TextInput
            value={user.password}
            onChangeText={(t) => change("password", t)}
            placeholder="Mật khẩu"
            style={Styles.input}
            secureTextEntry={true}
          />
          <TextInput
            value={user.retype_password}
            onChangeText={(t) => change("retype_password", t)}
            placeholder="Xác nhận mật khẩu"
            style={Styles.input}
            secureTextEntry={true}
          />
          <TouchableOpacity style={Styles.button} onPress={pickImage}>
            <Text style={Styles.text}>Chọn đại diện</Text>
          </TouchableOpacity>
          {user.avatar ? (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={{ uri: user.avatar.uri }}
                style={Styles.avatar}
              ></Image>
            </View>
          ) : (
            ""
          )}
          <TouchableOpacity style={Styles.button} onPress={activeUser}>
            <Text style={Styles.text}>Kích hoạt</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default ActiveUser;
