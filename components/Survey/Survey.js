import React, { useEffect, useState } from "react";
import { authApis, endpoints } from "../../configs/APIs";
import { View, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Card,
  Text,
  RadioButton,
  Modal,
  Button,
  Badge,
  Avatar,
  IconButton,
} from "react-native-paper";
import debounce from "../../utils/debounce";

const Survey = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({}); // Thêm state answers
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadSurveys = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const api = await authApis(token);
      const response = await api.get(endpoints.surveys);
      setSurveys(response.data);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const loadSurveyDetails = async (surveyId) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const api = await authApis(token);
      const response = await api.get(endpoints["survey-details"](surveyId));
      setSelectedSurvey(response.data);
    } catch (ex) {
      console.error(ex);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handleCardPress = async (survey) => {
    setLoading(true);
    await loadSurveyDetails(survey.id);
    setLoading(false);
  };

  const submitSurvey = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const api = await authApis(token);

      const formattedAnswers = Object.entries(answers).map(
        ([questionId, optionId]) => ({
          question: parseInt(questionId),
          option: parseInt(optionId),
        })
      );

      const response = await api.post(
        endpoints["submit-survey"](selectedSurvey.id),
        { answers: formattedAnswers }
      );

      alert("Gửi khảo sát thành công!");
      handleCloseModal();
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi gửi khảo sát.");
    }
  };

  const handleSubmitSurvey = debounce(submitSurvey, 1000);

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSurvey(null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {surveys.map((s) => (
          <View key={s.id}>
            <Card style={styles.card} onPress={() => handleCardPress(s)}>
              <Card.Title
                title={s.title}
                titleStyle={styles.title}
                left={(props) => (
                  <Avatar.Icon {...props} icon="database-search-outline" />
                )}
              />
              <Card.Content>
                <View>
                  <Badge
                    style={[
                      styles.status,
                      {
                        backgroundColor:
                          s.status === "Published" ? "green" : "red",
                      },
                    ]}
                  >
                    Tình trạng: {s.status}
                  </Badge>
                </View>
                <Text style={styles.description}>
                  Nội dung: {s.description}
                </Text>
                <Text style={styles.dateText}>
                  Thời gian :{" "}
                  {new Date(s.start_date).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(s.end_date).toLocaleDateString("vi-VN")}
                </Text>
              </Card.Content>
            </Card>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={selectedSurvey !== null}
        onRequestClose={handleCloseModal}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          {selectedSurvey && selectedSurvey.questions && (
            <>
              <Text style={styles.modalTitle}>
                Khảo sát về: {selectedSurvey.title}{" "}
              </Text>
              <ScrollView style={styles.modalContent}>
                {selectedSurvey.questions.map((question, index) => (
                  <View key={question.id} style={styles.questionContainer}>
                    <Text style={styles.questionText}>
                      Câu {index + 1}: {question.content}
                    </Text>
                    <RadioButton.Group
                      onValueChange={(value) =>
                        handleAnswer(question.id, value)
                      }
                      value={answers[question.id]}
                    >
                      {question.options.map((option) => (
                        <View key={option.id} style={styles.optionContainer}>
                          <RadioButton value={option.id} />
                          <Text style={styles.optionText}>
                            {option.content}
                          </Text>
                        </View>
                      ))}
                    </RadioButton.Group>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleSubmitSurvey}
                  style={styles.submitButton}
                >
                  Gửi kết quả
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleCloseModal}
                  style={styles.closeButton}
                >
                  Đóng
                </Button>
              </View>
            </>
          )}
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
  },
  modalContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  questionContainer: {
    margin: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  dateText: {
    fontSize: 12,
    color: "#666",
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 8,
  },
  optionText: {
    fontSize: 15,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  submitButton: {
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    flex: 1,
    marginLeft: 10,
  },
  status: {
    alignSelf: "flex-start",
    fontSize: 12,
    fontFamily: "Tahamo",
    fontWeight: "bold",
  },
});

export default Survey;
