import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import styles from "../../styles/styles";
import { Chip, Searchbar, Button } from "react-native-paper";
import { useState, useEffect } from "react";
import APIs, { endpoints, authApis } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import Styles from "./Styles";
import { RefreshControl } from "react-native";
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const MonthlyFee = ({ navigation }) => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState([]);
  const [feeId, setFeeId] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const loadFees = async () => {
    const res = await APIs.get(endpoints["fees"]);
    setFees(res.data);
  };

  const loadTransaction = async () => {
    if (page > 0) {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("access_token");
        const api = authApis(token);
        let url = `${endpoints["transaction"]}?page=${page}`;
        if (feeId || q) url = `${url}&feeId=${feeId}&q=${q}`;
        if (selectedDate) {
          const formattedDate = moment(selectedDate).format("YYYY-MM");
          url = `${url}&month=${formattedDate}`;
        }
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

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setSelectedDate(date);
    hideDatePicker();
    setPage(1);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
    setPage(1);
  };

  useEffect(() => {
    let timer = setTimeout(() => loadTransaction(), 500);
    return () => clearTimeout(timer);
  }, [feeId, q, selectedDate, page]);

  useEffect(() => {
    loadFees();
  }, []);

  const loadMore = () => {
    if (!loading && page > 0) {
      setPage(page + 1);
    }
  };

  const search = (value, callback) => {
    setPage(1);
    callback(value);
  };

  const refresh = () => {
    setPage(1);
    loadTransaction();
  };
  
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
      
      <View style={[styles.row, styles.margin]}>
        <Button 
          mode="outlined" 
          onPress={showDatePicker}
          style={{ flex: 1, marginRight: 5 }}
        >
          {selectedDate 
            ? moment(selectedDate).format("MM/YYYY") 
            : "Chọn tháng năm"}
        </Button>
        {selectedDate && (
          <Button 
            mode="outlined" 
            onPress={clearDateFilter}
            style={{ marginLeft: 5 }}
          >
            Xóa
          </Button>
        )}
      </View>

      <Searchbar
        placeholder="Tìm hóa đơn"
        style={styles.margin}
        onChangeText={(text) => search(text, setQ)}
        value={q}
      />

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
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