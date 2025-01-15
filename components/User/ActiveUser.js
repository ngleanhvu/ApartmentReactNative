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
import debounce from "../../utils/debounce";

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

  const activeUser = async () => {
    setLoading(true);
    try {
      console.log(user.avatar);
      let form = new FormData();
      for (let key in user) {
        if (key === "avatar") {
          form.append("avatar", {
            uri: user.avatar.uri,
            name: user.avatar.fileName,
            type: user.avatar.type,
          });
        } else {
          form.append(key, user[key]);
        }
      }
      console.log(user["avatar"]);
      console.log(form);
      const res = await APIs.post(endpoints["active-user"], form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200) {
        alert("Thành công! Vui lòng đăng nhập.");
      } else if (res.status === 202) {
        alert("Tài khoản đã kích hoạt trước đó");
      } else {
        alert("Kích hoạt người dùng thất bại!");
      }
      navigation.navigate("Login");
    } catch (error) {
      console.log(error);
      alert("Kích hoạt người dùng thất bại!");
    } finally {
      setLoading(false);
      setUser({
        phone: "",
        password: "",
        retype_password: "",
        avatar: "",
      });
    }
  };

  const pickImage = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permissions denied!");
    } else {
      const result = await ImagePicker.launchImageLibraryAsync();
      console.log(result);
      if (!result.canceled) {
        change("avatar", result.assets[0]);
      }
    }
  };

  const handleActiveUser = debounce(activeUser, 1000);

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
            label="Số điện thoại"
            style={styles.margin}
          />
          <TextInput
            value={user.password}
            onChangeText={(t) => change("password", t)}
            label="Mật khẩu"
            secureTextEntry={true}
            right={<TextInput.Icon icon="eye" />}
            style={styles.margin}
          />
          <TextInput
            value={user.retype_password}
            onChangeText={(t) => change("retype_password", t)}
            label="Xác nhận mật khẩu"
            secureTextEntry={true}
            right={<TextInput.Icon icon="eye" />}
            style={styles.margin}
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
          <TouchableOpacity style={Styles.button} onPress={handleActiveUser}>
            <Text style={Styles.text}>Kích hoạt</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default ActiveUser;
