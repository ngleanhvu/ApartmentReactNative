import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  View,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import styles from "../../styles/styles";
import { useState, useEffect, useCallback } from "react";
import APIs, { endpoints, authApis } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Styles from "./Styles";
import { useStripe } from "@stripe/stripe-react-native";
import Modal from "react-native-modal";
import * as ImagePicker from "expo-image-picker";
import _ from "lodash";
import { Ionicons } from "@expo/vector-icons";

const PayMonthlyFee = ({ navigation }) => {
  const [monthlyFees, setMonthlyFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isModalVisible, setModalVisible] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const [selectedItems, setSelectedItems] = useState([]);

  const loadPendingMonthlyFees = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const api = authApis(token);
      const url = `${endpoints["monthly-fees"]}pending/`;
      const res = await api.get(url);

      if (res.data) {
        setMonthlyFees(res.data);
      }
    } catch (error) {
      console.error("Error fetching monthly fees: ", error);
    } finally {
      setLoading(false);
    }
  };

  const createStripePaymentSession = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const api = authApis(token);
      const url = `${endpoints["transaction"]}stripe/`;
      const res = await api.post(url, {
        ids: JSON.stringify(selectedItems),
      });

      if (res.data && res.data.clientSecret) {
        const { error } = await initPaymentSheet({
          paymentIntentClientSecret: res.data.clientSecret,
          merchantDisplayName: "Stripe",
        });

        if (error) {
          console.log("Error initializing payment sheet:", error);
          alert("Thanh toán thất bại");
          return;
        }

        const { error: paymentError } = await presentPaymentSheet();

        if (paymentError) {
          console.log("Payment failed:", paymentError.message);
          alert("Thanh toán thất bại.");
        } else {
          alert("Thanh toán thành công!");
          loadPendingMonthlyFees();
        }
      }
    } catch (error) {
      console.log("Error creating payment session:", error);
      alert("Thanh toán thất bại");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Bạn cần cấp quyền để sử dụng tính năng này.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setThumbnail(result.assets[0]);
    }
  };

  const createMomoPayment = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("thumbnail", {
        uri: thumbnail.uri,
        name: thumbnail.fileName || "image.jpg",
        type: "image/jpeg",
      });

      form.append("ids", JSON.stringify(selectedItems));

      const token = await AsyncStorage.getItem("access_token");
      const result = await APIs.post(`${endpoints["transaction"]}momo/`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (result.status === 200) {
        alert("Thanh toán thành công.");
        loadPendingMonthlyFees();
      } else {
        alert("Thanh toán thất bại.");
      }
    } catch (error) {
      console.log("Error creating Momo payment:", error);
      alert("Thanh toán thất bại.");
    } finally {
      setLoading(false);
      setThumbnail(null);
    }
  };

  const toggleModal = () => {
    const total = monthlyFees
      .filter((item) => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.amount, 0);
    setTotalAmount(total);
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    let timer = setTimeout(() => loadPendingMonthlyFees(), 500);
    return () => clearTimeout(timer);
  }, []);

  const renderItem = ({ item }) => (
    <View>
      <View key={item.id} style={Styles.transactionItem}>
        <Text style={Styles.transactionAmount}>
          {item.amount.toLocaleString("vi-VN")} VNĐ
        </Text>
        <Text style={Styles.transactionDescription}>{item.fee.name}</Text>
        <Text style={Styles.transactionDate}>
          {new Date(item.created_date).getMonth() + 1}-
          {new Date(item.created_date).getFullYear()}
        </Text>

        <TouchableOpacity onPress={() => toggleSelection(item.id)}>
          <Ionicons
            name={
              selectedItems.includes(item.id) ? "checkbox" : "checkbox-outline"
            }
            size={24}
            color="primary"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const toggleSelection = (id) => {
    setSelectedItems((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      } else {
        return [...current, id];
      }
    });
  };

  const refresh = async () => {
    loadPendingMonthlyFees();
    setSelectedItems([]);
  };

  return (
    <View style={styles.container}>
      <Text style={Styles.title}>Các khoản phí chưa đóng</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={monthlyFees}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text>Danh sách trống</Text>}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} />
          }
        />
      )}
      <TouchableOpacity
        style={Styles.button_stripe}
        onPress={createStripePaymentSession}
      >
        <Text style={[Styles.text, Styles.text_center]}>Stripe</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[Styles.button_momo]} onPress={toggleModal}>
        <Text style={[Styles.text_center, Styles.text]}>Momo</Text>
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        style={{ justifyContent: "flex-end", margin: 0 }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={Styles.modalContent}>
          <Text style={Styles.title}>Form Thanh Toán</Text>
          <TextInput
            style={Styles.input}
            value={`${totalAmount.toLocaleString("vi-VN")} VNĐ`}
            editable={false}
          />
          <TouchableOpacity style={Styles.submitButton} onPress={pickImage}>
            <Text style={Styles.submitButtonText}>Chọn ảnh</Text>
          </TouchableOpacity>
          {thumbnail && (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Image source={{ uri: thumbnail.uri }} style={Styles.avatar} />
            </View>
          )}
          <TouchableOpacity
            style={Styles.submitButton}
            onPress={createMomoPayment}
          >
            <Text style={Styles.submitButtonText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default PayMonthlyFee;
