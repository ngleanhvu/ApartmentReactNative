import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import APIs, { endpoints } from "../../configs/APIs";
import RenderHTML from "react-native-render-html";

const NotificationDetail = ({ route }) => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const { id } = route.params;

  const loadNotificationDetail = async () => {
    setLoading(true);
    try {
      const res = await APIs.get(`${endpoints["notification"]}${id}/`);
      setNotification(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotificationDetail();
  }, [id]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : notification ? (
        <ScrollView>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.date}>{notification.created_date}</Text>
          <RenderHTML source={{ html: notification.content }} />
        </ScrollView>
      ) : (
        <Text>No notification found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    color: "#888",
    marginBottom: 15,
  },
  content: {
    fontSize: 16,
    color: "#333",
  },
});

export default NotificationDetail;
