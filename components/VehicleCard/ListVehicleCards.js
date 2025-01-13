import styles from "../../styles/styles";
import Styles from "../MonthlyFee/Styles";
import { useState, useEffect } from "react";
import APIs, { endpoints, authApis } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { Searchbar } from "react-native-paper";

const ListVehicleCards = () => {
  const [listVehicleCards, setListVehicleCards] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  const loadVehicleCards = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("access_token");
      const api = authApis(token);
      let url = `${endpoints["vehicle-cards"]}?page=${page}`;
      if (q) url = `${url}&q=${q}`;
      const res = await api.get(url);

      if (page > 1)
        setListVehicleCards((current) => [...current, ...res.data.results]);
      else setListVehicleCards(res.data.results);

      if (res.data.next === null) setPage(0);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={Styles.transactionItem}>
      <Text style={Styles.transactionDescription}>
        {item.full_name} - {item.relationship}
      </Text>
      <Text style={Styles.transactionDescription}>{item.vehicle_number}</Text>
      <Text style={Styles.transactionDescription}>{item.citizen_card}</Text>
    </View>
  );

  useEffect(() => {
    let timer = setTimeout(() => loadVehicleCards(), 500);
    return () => clearTimeout(timer);
  }, [q]);

  const loadMore = () => {
    if (!loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const search = (value, callback) => {
    setPage(1);
    callback(value);
  };

  const refresh = async () => {
    setPage(1);
    loadVehicleCards();
  };

  return (
    <View style={styles.container}>
      <Text style={Styles.title}>Danh sách thẻ giữ xe đã đăng ký</Text>
      <Searchbar
        placeholder="Tìm thẻ giữ xe"
        style={styles.margin}
        onChangeText={(text) => search(text, setQ)}
        value={q}
      />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <FlatList
        style={Styles.margin}
        data={listVehicleCards}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        onEndReached={loadMore}
      />
    </View>
  );
};

export default ListVehicleCards;
