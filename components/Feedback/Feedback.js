import React, { useEffect, useState } from "react";
import { View, StyleSheet, Modal, ScrollView, RefreshControl, useWindowDimensions } from "react-native";
import {
  Avatar,
  Card,
  Text,
  Button,
  IconButton,
  TextInput,
  ActivityIndicator,
} from "react-native-paper";
import { authApis } from "../../configs/APIs";
import { endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RenderHTML from "react-native-render-html";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    title: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const { width } = useWindowDimensions(); 
  
  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      const api = await authApis(token);
      const response = await api.get(endpoints.feedbacks);
      setFeedbacks(response.data);
    } catch (error) {
      console.log("Error fetching feedbacks:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true); // Hiển thị hiệu ứng làm mới
    await loadFeedbacks();
    setRefreshing(false); // Tắt hiệu ứng làm mới
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const createFeedback = async () => {
    if (!newFeedback.title || !newFeedback.description) {
      alert("Bạn nên điền đầy đủ thông tin");
      return;
    }

    setSubmitting(true);

    try {
      const token = await AsyncStorage.getItem("access_token");
      const api = await authApis(token);
      await api.post(endpoints.feedbacks, newFeedback);

      setNewFeedback({ title: "", description: "" });
      setCreateModalVisible(false);
      loadFeedbacks();
    } catch (error) {
      console.error("Error creating feedback:", error.message);
      alert("Có lỗi xảy ra khi tạo phản ánh");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardPress = (feedback) => {
    setSelectedFeedback(feedback);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedFeedback(null);
  };

  return (
    <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          {feedbacks.map((feedback) => (
            <Card
              key={feedback.id}
              style={styles.card}
              onPress={() => handleCardPress(feedback)}
            >
              <Card.Title
                title={feedback.title}
                subtitle={
                  <Text
                    style={[
                      styles.subtitle,
                      {
                        color: feedback.status === "Resolved" ? "green" : "red",
                      },
                    ]}
                  >
                    {feedback.status}
                  </Text>
                }
                left={(props) => (
                  <Avatar.Icon {...props} icon="alpha-f-box-outline" />
                )}
                right={(props) => (
                  <IconButton {...props} icon="dots-vertical" />
                )}
              />
              <Card.Content>
                <RenderHTML source={{ html: feedback.description }}  contentWidth={width} />
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

      <Modal
              visible={modalVisible}
              onRequestClose={handleCloseModal}
              animationType="slide"
            >
              <View style={styles.modalContainer}>
                {selectedFeedback && (
                  <>
                    <Text style={styles.title}>{selectedFeedback.title}</Text>
                    <RenderHTML source={{ html: selectedFeedback.description  || "<p><i>Chưa có phản hồi</i></p>" }} contentWidth={width}/>

                    <Text
                      style={[
                        styles.status,
                        selectedFeedback.status === "Resolved"
                          ? { color: "green" }
                          : { color: "red" },
                      ]}
                    >
                      Status: {selectedFeedback.status}
                    </Text>
                    <Text style={styles.response}>Response:</Text>
                    <RenderHTML
                      source={{ html: selectedFeedback.response?.response  || "<p><i>Chưa có phản hồi</i></p>"}}  contentWidth={width}
                    />
                  </>
                )}
                <Button
                  mode="contained"
                  onPress={handleCloseModal}
                  style={styles.createButton}
                >
                  Close
                </Button>
              </View>
            </Modal>


      <View>
        <Button
          mode="contained"
          onPress={() => setCreateModalVisible(true)}
          style={styles.createButton}
        >
          Tạo phản ánh mới
        </Button>
      </View>

      <Modal
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <Text style={[styles.title, { textAlign: "center" }]}>
            Tạo phản ánh mới
          </Text>

          <TextInput
            mode="outlined"
            label="Tiêu đề"
            value={newFeedback.title}
            onChangeText={(text) =>
              setNewFeedback((prev) => ({ ...prev, title: text }))
            }
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Nội dung"
            value={newFeedback.description}
            onChangeText={(text) =>
              setNewFeedback((prev) => ({ ...prev, description: text }))
            }
            style={styles.input}
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => setCreateModalVisible(false)}
              style={styles.button}
            >
              Hủy
            </Button>
            <Button
              mode="contained"
              onPress={createFeedback}
              loading={submitting}
              disabled={submitting}
              style={styles.button}
            >
              Gửi
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    margin: 5,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontWeight: "bold",
  },
  input: {
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  createButton: {
    position: "absolute",
    marginBottom: 10,
    bottom: 15,
    left: 10,
    right: 10,
  },
});

export default FeedbackList;
