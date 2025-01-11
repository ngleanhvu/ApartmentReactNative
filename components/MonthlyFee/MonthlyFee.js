import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import styles from "../../styles/styles";
import { Chip, Searchbar } from "react-native-paper";
import { useState, useEffect } from "react";
import APIs, { endpoints, authApis } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import Styles from "./Styles";
import { RefreshControl } from "react-native";

const MonthlyFee = ({ navigation }) => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState([]);
  const [feeId, setFeeId] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  // Load fees
  const loadFees = async () => {
    const res = await APIs.get(endpoints["fees"]);
    setFees(res.data);
  };

  // Load transactions
  const loadTransaction = async () => {
    if (page > 0) {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("access_token");
        const api = authApis(token);
        let url = `${endpoints["transaction"]}?page=${page}`;
        if (feeId || q) url = `${url}&feeId=${feeId}&q=${q}`;
        const res = await api.get(url);

        if (page > 1)
          setTransaction((current) => [...current, ...res.data.results]);
        else setTransaction(res.data.results);
        if (res.data.next === null) setPage(0);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Load transactions on change of filters
  useEffect(() => {
    let timer = setTimeout(() => loadTransaction(), 500);

    return () => clearTimeout(timer);
  }, [feeId, q, page]);

  // Load fees when the component mounts
  useEffect(() => {
    loadFees();
  }, []);

  // Load more data when the user reaches the end of the list
  const loadMore = () => {
    if (!loading && page > 0) {
      setPage(page + 1);
    }
  };

  // Handle search
  const search = (value, callback) => {
    setPage(1);
    callback(value);
  };

  // Refresh the data
  const refresh = () => {
    setPage(1);
    loadTransaction();
  };

  // Render each transaction item
  const renderTransactionItem = ({ item }) => (
    <View key={item.id} style={Styles.transactionItem}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Monthly fee detail", { transactionId: item.id })
        }
      >
        <Text style={Styles.transactionDescription}>{item.description}</Text>
        <Text style={Styles.transactionAmount}>
          Tổng tiền: {item.amount.toLocaleString("vi-VN")} VNĐ
        </Text>
        <Text style={Styles.transactionDate}>
          Thanh toán: {moment(item.created_date).fromNow()}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.wrap]}>
        <TouchableOpacity onPress={() => search(null, setFeeId)}>
          <Chip icon="label" style={styles.margin}>
            Tất cả
          </Chip>
        </TouchableOpacity>
        {fees.map((f) => (
          <TouchableOpacity key={f.id} onPress={() => search(f.id, setFeeId)}>
            <Chip icon="label" style={styles.margin}>
              {f.name}
            </Chip>
          </TouchableOpacity>
        ))}
      </View>
      <Searchbar
        placeholder="Tìm hóa đơn"
        style={styles.margin}
        onChangeText={(text) => search(text, setQ)}
        value={q}
      />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <FlatList
        style={Styles.margin}
        data={transaction}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        onEndReached={loadMore}
      />
    </View>
  );
};

export default MonthlyFee;
