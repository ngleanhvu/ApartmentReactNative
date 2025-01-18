import React, { useEffect, useState } from "react";
import { authApis, endpoints } from "../../configs/APIs";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Badge,
  Text,
  ActivityIndicator,
  Searchbar,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SearchBar } from "react-native-screens";

const StorageLocker = () => {
  const [storageLockers, setStorageLockers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  const loadStorageLocker = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const api = await authApis(token);
      const response = await api.get(endpoints.storageLocker);
      setStorageLockers(response.data);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  const loadPackages = async () => {
    if (page > 0 && !loading) {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("access_token");
        const api = await authApis(token);
        let packages_url = `${endpoints.packages}?page=${page}&q=${q}`;
        let res = await api.get(packages_url);
        if (page === 1) setPackages(res.data.results);
        else if (page > 1)
          setPackages((current) => {
            return [...current, ...res.data.results];
          });

        if (res.data.next === null) setPage(0);
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };
  const loadMore = ({ nativeEvent }) => {
    if (!loading && isCloseToBottom(nativeEvent) && page > 0) setPage(page + 1);
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const search = (value, callback) => {
    setPage(1);
    callback(value);
  };

  useEffect(() => {
    loadStorageLocker();
  }, []);

  useEffect(() => {
    loadPackages();
  }, [q, page]);

  const getCloudinaryUrl = (thumbnailPath) => {
    if (thumbnailPath?.startsWith("http")) {
      return thumbnailPath;
    }

    const CLOUDINARY_CLOUD_NAME = "dea1l3vvu";
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${thumbnailPath}`;
  };

  return (
    <View style={styles.container}>
      {storageLockers.map((storage) => (
        <View key={storage.id} style={styles.storageContainer}>
          <Title style={styles.storageNumber}>Tủ đồ #{storage.number}</Title>
          <Searchbar
            placeholder="Tìm kiếm đơn hàng..."
            value={q}
            onChangeText={(k) => search(k, setQ)}
            style={styles.searchBar}
          />
          <ScrollView onScroll={loadMore}>
            {loading && <ActivityIndicator />}
            {packages.map((packages) => (
              <Card key={packages.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.packageHeader}>
                    <View style={styles.packageInfo}>
                      <Title>Đơn hàng: {packages.sender_name}</Title>
                      <Paragraph>
                        Người nhận: {packages.recipient_name}
                      </Paragraph>
                      <Paragraph>
                        Số lượng sản phẩm: {packages.quantity_items}
                      </Paragraph>
                    </View>

                    <Badge
                      style={[
                        styles.status,
                        {
                          backgroundColor:
                            packages.status === "Not received"
                              ? "red"
                              : "green",
                        },
                      ]}
                    >
                      {packages.status}
                    </Badge>
                  </View>

                  {packages.thumbnail && (
                    <Image
                      source={{ uri: getCloudinaryUrl(packages.thumbnail) }}
                      style={styles.thumbnail}
                    />
                  )}

                  {packages.description && (
                    <Text style={styles.description}>
                      *Ghi chú: {packages.description.replace(/<[^>]*>/g, "")}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            ))}
            {loading && page > 1 && <ActivityIndicator />}
          </ScrollView>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    marginTop: 10,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  storageContainer: {
    marginBottom: 20,
  },
  storageNumber: {
    marginBottom: 10,
    fontWeight: "bold",
  },
  card: {
    marginBottom: 10,
    elevation: 4,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  packageInfo: {
    flex: 1,
  },
  status: {
    alignSelf: "flex-start",
    fontSize: 12,
    fontFamily: "Tahamo",
    fontWeight: "bold",
  },
  thumbnail: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 8,
  },
  description: {
    marginTop: 10,
    color: "#666",
    fontStyle: "italic",
  },
});

export default StorageLocker;
