import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import Styles from "../MonthlyFee/Styles";
import styles from "../../styles/styles";
import { TextInput } from "react-native-paper";
import { useEffect, useState } from "react";
import UserStyles from "../User/Styles";
import APIs, { endpoints, authApis } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import debounce from "../../utils/debounce";

const RegisterVehicleCard = ({ navigation }) => {
  const [vehicleInfo, setVehicleInfo] = useState({
    fullName: "",
    citizenCard: "",
    vehicleNumber: "",
  });

  const [loading, setLoading] = useState(false);

  const change = (field, value) => {
    setVehicleInfo((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const registerVehicleCard = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const api = authApis(token);
      const url = endpoints["register"];
      const res = await api.post(url, vehicleInfo);

      if (res.status === 201) {
        alert("Đăng ký thành công");
        refresh();
      } else {
        alert("Đăng ký thất bại");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setVehicleInfo({
        fullName: "",
        citizenCard: "",
        vehicleNumber: "",
      });
    }
  };

  const handleRegisterVehicleCard = debounce(registerVehicleCard, 1000);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Text style={[Styles.title, Styles.margin]}>Đăng ký thẻ giữ xe</Text>
          <TextInput
            style={Styles.margin}
            value={vehicleInfo.fullName}
            onChangeText={(t) => change("fullName", t)}
            label="Họ và tên"
          />
          <TextInput
            style={Styles.margin}
            value={vehicleInfo.citizenCard}
            onChangeText={(t) => change("citizenCard", t)}
            label="Căn cước công dân"
          />
          <TextInput
            style={Styles.margin}
            value={vehicleInfo.vehicleNumber}
            onChangeText={(t) => change("vehicleNumber", t)}
            label="Biển số xe"
          />
          <TouchableOpacity
            style={UserStyles.button}
            onPress={handleRegisterVehicleCard}
          >
            <Text style={UserStyles.text}>Đăng ký</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={UserStyles.button}
            onPress={() => navigation.navigate("List vehicle cards")}
          >
            <Text style={UserStyles.text}>Xem danh sách</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default RegisterVehicleCard;
