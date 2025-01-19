import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/APIs";

const Profile = () => {
  const [user, setUser] = useState({
    id: "",
    email: "",
    phone: "",
    username: "",
    full_name: "",
    value: "",
    gender: "",
    citizen_card: "",
  });
  const [loading, setLoading] = useState(false);

  const profile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const api = authApis(token);
      const url = `${endpoints["current-user"]}`;
      const res = await api.get(url);
      if (res.data) {
        setUser((current) => ({ ...current, ...res.data }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer = setTimeout(() => profile(), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <View style={styles.header}>
            <Image
              source={{ uri: user.value || "https://via.placeholder.com/150" }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{user.full_name}</Text>
            <Text style={styles.phone}>{user.phone}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Date of Birth:</Text>
            <Text style={styles.infoValue}>
              {user.date_of_birth
                ? new Date(user.date_of_birth).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Gender:</Text>
            <Text style={styles.infoValue}>
              {user.gender ? "Male" : "Female"}
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Citizen Card:</Text>
            <Text style={styles.infoValue}>{user.citizen_card}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  phone: {
    fontSize: 16,
    color: "#666",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  infoLabel: {
    fontSize: 16,
    color: "#555",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  errorText: {
    fontSize: 18,
    color: "#ff0000",
  },
});

export default Profile;
