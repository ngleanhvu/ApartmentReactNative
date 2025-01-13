import { View, Text, ActivityIndicator, ScrollView, Image } from "react-native";
import { Chip, Card, List } from "react-native-paper"; // Import List.Item
import { useState, useEffect } from "react";
import APIs, { endpoints, authApis } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Styles from "./Styles";
import styles from "../../styles/styles";
import moment from "moment";

const MonthlyFeeDetail = ({ route }) => {
  const transactionId = route.params?.transactionId;
  const [loading, setLoading] = useState(false);
  const [transactionDetail, setTransactionDetail] = useState(null);

  const loadMonthlyFeeDetail = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const api = authApis(token);
      const url = `${endpoints["transaction-detail"](transactionId)}`;
      const res = await api.get(url);
      setTransactionDetail(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer = setTimeout(() => loadMonthlyFeeDetail(), 500);
    return () => clearTimeout(timer);
  }, [transactionId]);

  return (
    <ScrollView style={Styles.margin}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {transactionDetail ? (
        <Card style={Styles.margin}>
          <Card.Title
            titleStyle={Styles.transactionDescription}
            title={transactionDetail.description}
          />
          <Card.Cover source={{ uri: transactionDetail.thumbnail }} />
          <Card.Content>
            <View style={styles.row}>
              <Text style={[Styles.scrollContent, Styles.margin]}>
                Phương thức: {transactionDetail.payment_gateway}
              </Text>
              <Text style={[Styles.scrollContent, Styles.margin]}>
                Tổng tiền: {transactionDetail.amount.toLocaleString("vi-VN")}{" "}
                VNĐ
              </Text>
            </View>
            <View>
              <Text style={[Styles.transactionDate, Styles.margin]}>
                Thanh toán: {moment(transactionDetail.created_date).fromNow()}
              </Text>
            </View>
          </Card.Content>
        </Card>
      ) : (
        !loading && (
          <Text style={Styles.transactionDescription}>Không có dữ liệu</Text>
        )
      )}
      {transactionDetail?.monthly_fees?.length > 0 ? (
        <View
          style={[
            Styles.margin,
            Styles.transactionItem,
            { backgroundColor: "#F5F5F5" },
          ]}
        >
          {transactionDetail.monthly_fees.map((c) => (
            <List.Item
              key={c.id}
              title={`${c.description}`}
              titleStyle={Styles.transactionDescription}
              description={`${c.amount.toLocaleString("vi-VN")} VNĐ`}
              descriptionStyle={Styles.transactionAmount}
            />
          ))}
        </View>
      ) : (
        !loading && (
          <Text style={Styles.transactionDescription}>
            Không có phí hàng tháng nào
          </Text>
        )
      )}
    </ScrollView>
  );
};

export default MonthlyFeeDetail;
