import React, { useEffect, useState } from "react";
import { authApis, endpoints } from "../../configs/APIs";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Card,
  Text,
  RadioButton,
  Modal,
  Button,
  Badge,
  Avatar,
} from "react-native-paper";
import debounce from "../../utils/debounce";
import { RefreshControl } from "react-native";

const Survey = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [answers, setAnswers] = useState({});
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const loadSurveys = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const api = await authApis(token);
      const response = await api.get(endpoints.surveys);
      setSurveys(response.data);
    } catch (ex) {
      console.error("Error loading surveys:", ex);
    } finally {
      setLoading(false);
    }
  };

  const loadSurveyDetails = async (surveyId) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const api = await authApis(token);
      const response = await api.get(endpoints["survey-details"](surveyId));
      setSelectedSurvey(response.data);
    } catch (ex) {
      console.error("Error loading survey details:", ex);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSurveys();
    setRefreshing(false);
  };

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

      await api.post(endpoints["submit-survey"](selectedSurvey.id), {
        answers: formattedAnswers,
      });

      alert("Gửi khảo sát thành công!");
      setSelectedSurvey(null);
    } catch (error) {
      console.error("Error submitting survey:", error);
      alert("Có lỗi xảy ra khi gửi khảo sát.");
    }
  };

  // Gọi hàm debounce cho submit
  const handleSubmitSurvey = debounce(submitSurvey, 1000);

  useEffect(() => {
    let timer = setTimeout(() => loadSurveys(), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {surveys.length === 0 ? (
          <Text style={styles.emptyText}>Không có khảo sát nào!</Text>
        ) : (
          surveys.map((s) => (
            <Card
              key={s.id}
              style={styles.card}
              onPress={() => handleCardPress(s)}
            >
              <Card.Title
                title={s.title}
                left={(props) => (
                  <Avatar.Icon {...props} icon="database-search-outline" />
                )}
              />
              <Card.Content>
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
                <Text style={styles.description}>{s.description}</Text>
                <Text style={styles.dateText}>
                  Thời gian:{" "}
                  {new Date(s.start_date).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(s.end_date).toLocaleDateString("vi-VN")}
                </Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal
        visible={selectedSurvey !== null}
        onDismiss={() => setSelectedSurvey(null)}
      >
        <View style={styles.modalContainer}>
          {selectedSurvey && selectedSurvey.questions && (
            <>
              <Text style={styles.modalTitle}>{selectedSurvey.title}</Text>
              <ScrollView>
                {selectedSurvey.questions.map((question) => (
                  <View key={question.id} style={styles.questionContainer}>
                    <Text style={styles.questionText}>{question.content}</Text>
                    <RadioButton.Group
                      value={answers[question.id]}
                      onValueChange={(value) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [question.id]: value,
                        }))
                      }
                    >
                      {question.options.map((option) => (
                        <View key={option.id} style={styles.optionContainer}>
                          <RadioButton value={option.id} />
                          <Text>{option.content}</Text>
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
                  Gửi
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setSelectedSurvey(null)}
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
