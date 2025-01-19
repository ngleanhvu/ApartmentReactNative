import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import APIs, { endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const navigation = useNavigation();

  const loadNotification = async () => {
    if (page > 0) {
      setLoading(true);
      try {
        let url = `${endpoints["notification"]}?page=${page}`;
        const res = await APIs.get(url);
        console.log(res.data);

        if (page > 1) setNotifications((current) => [...current, ...res.data]);
        else setNotifications(res.data);
        if (res.data.next === null) setPage(0);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePressNotification = (notificationId) => {
    navigation.navigate("Notification Detail", { id: notificationId });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handlePressNotification(item.id)}>
      <View style={styles.notificationItem}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDate}>{item.created_date}</Text>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    loadNotification();
  }, [page]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notifications</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  notificationItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  notificationDate: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
});

export default Home;
