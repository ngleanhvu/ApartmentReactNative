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

const PayMonthlyFee = ({ navigation }) => {
  const [monthlyFees, setMonthlyFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isModalVisible, setModalVisible] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

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
      const res = await api.post(url);

      if (res.data && res.data.clientSecret) {
        const { error } = await initPaymentSheet({
          paymentIntentClientSecret: res.data.clientSecret,
          merchantDisplayName: 'Stripe',
        });

        if (error) {
          console.error("Error initializing payment sheet:", error);
          Alert.alert("Lỗi", "Không thể khởi tạo phiên thanh toán.");
          return;
        }

        const { error: paymentError } = await presentPaymentSheet();

        if (paymentError) {
          console.error("Payment failed:", paymentError.message);
          Alert.alert("Lỗi", "Thanh toán thất bại.");
        } else {
          Alert.alert("Thành công", "Thanh toán thành công!");
          loadPendingMonthlyFees();
        }
      }
    } catch (error) {
      console.error("Error creating payment session:", error);
      Alert.alert("Lỗi", "Không thể tạo phiên thanh toán.");
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

  const createMomoPayment = useCallback(
    _.debounce(async () => {
      if (!thumbnail) {
        Alert.alert("Lỗi", "Vui lòng chọn ảnh trước khi gửi.");
        return;
      }

      setLoading(true);
      try {
        const form = new FormData();
        form.append("thumbnail", {
          uri: thumbnail.uri,
          name: thumbnail.fileName || "image.jpg",
          type: "image/jpeg",
        });

        const token = await AsyncStorage.getItem("access_token");
        const result = await APIs.post(
          `${endpoints["transaction"]}momo/`,
          form,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (result.status === 200) {
          Alert.alert("Thành công", "Gửi thanh toán thành công.");
          loadPendingMonthlyFees();
        } else {
          Alert.alert("Thất bại", "Gửi thanh toán thất bại.");
        }
      } catch (error) {
        console.error("Error creating Momo payment:", error);
        Alert.alert("Lỗi", "Có lỗi xảy ra khi gửi thanh toán.");
      } finally {
        setLoading(false);
        setThumbnail(null);
      }
    }, 1000),
    [thumbnail]
  );

  const toggleModal = () => {
    const total = monthlyFees.reduce((sum, item) => sum + item.amount, 0);
    setTotalAmount(total);
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    loadPendingMonthlyFees();
  }, []);

  const renderItem = ({ item }) => (
    <View key={item.id} style={Styles.fee}>
      <Text style={Styles.text}>{item.amount.toLocaleString("vi-VN")} VNĐ</Text>
      <Text style={Styles.text}>{item.fee.name}</Text>
      <Text style={Styles.text}>
        Tháng: {new Date(item.created_date).getMonth() + 1}
      </Text>
    </View>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPendingMonthlyFees();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subject}>Đóng phí chung cư</Text>
      <Text style={Styles.title}>Các khoản phí chưa đóng</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={monthlyFees}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text>Danh sách trống</Text>}  // Hiển thị khi danh sách trống
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      <TouchableOpacity
        style={Styles.button_stripe}
        onPress={createStripePaymentSession}
      >
        <Text style={[Styles.text, Styles.text_center]}>Stripe</Text>
      </TouchableOpacity>
      <TouchableOpacity style={Styles.button_momo} onPress={toggleModal}>
        <Text style={[Styles.text_center, Styles.text]}>Hiện Form</Text>
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
