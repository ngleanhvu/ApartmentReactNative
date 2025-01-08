import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import styles from "../../styles/styles";
import { useState, useEffect } from "react";
import APIs, { endpoints, authApis } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PayMonthlyFee = () => {
  const [monthlyFees, setMonthlyFees] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPendingMonthlyFees = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const api = authApis(token);
      let url = `${endpoints["monthly-fees"]}pending/`;
      const res = await api.get(url);
      console.log(res.data);
      if (res.data) {
        setMonthlyFees(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingMonthlyFees();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.subject}>Đóng phí chung cư</Text>
      <ScrollView style={{ flexDirection: "column" }}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            {monthlyFees.map((m) => (
              <View key={m.id}>
                <Text>{m.amount}</Text>
                <Text>{m.status}</Text>
                <Text>{m.fee.name}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default PayMonthlyFee;
