import React, { useState, useEffect, useContext } from "react";
import {
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { database } from "../Firebase/config"; // Cấu hình Firebase
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import Contexts from "../../configs/Contexts"; // Import Context

const Chat = ({ route }) => {
  const receiverId = 1;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user] = useContext(Contexts);
  const [roomId, setRoomId] = useState(null);

  const getRoomId = (userId1, userId2) => {
    return userId1 < userId2
      ? `${userId1}-${userId2}`
      : `${userId2}-${userId1}`;
  };

  // Thiết lập roomId khi người dùng hoặc receiverId thay đổi
  useEffect(() => {
    setRoomId(getRoomId(user.id, receiverId)); // Tạo roomId duy nhất
  }, [user.id, receiverId]);

  // Hàm lấy tin nhắn trong phòng chat giữa hai người
  useEffect(() => {
    if (!roomId) return;

    // Lấy các tin nhắn trong phòng chat giữa 2 người
    const messagesRef = collection(database, "rooms", roomId, "messages");
    const q = query(messagesRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map((doc) => doc.data());
      setMessages(messagesList);
    });

    return () => unsubscribe(); // Dọn dẹp khi component bị hủy
  }, [roomId]);

  // Hàm gửi tin nhắn
  const sendMessage = async () => {
    if (message.trim()) {
      if (!roomId) {
        console.error("Room ID is not defined.");
        return;
      }
      try {
        await addDoc(collection(database, "rooms", roomId, "messages"), {
          senderId: user.id, // ID người gửi
          receiverId: receiverId, // ID người nhận
          message,
          timestamp: new Date(),
        });
        setMessage(""); // Xóa ô nhập sau khi gửi
      } catch (error) {
        console.error("Error sending message: ", error);
      } finally {
      }
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          {/* Hiển thị tin nhắn */}
          <FlatList
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.message,
                  item.senderId === user.id
                    ? styles.sentMessage
                    : styles.receivedMessage,
                ]}
              >
                <Text>
                  {item.senderId === user.id ? "You" : "Admin"}: {item.message}
                </Text>
                <Text style={styles.timestamp}>
                  {new Date(item.timestamp.seconds * 1000).toLocaleString()}
                </Text>
              </View>
            )}
          />

          {/* Nhập tin nhắn */}
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message"
            style={styles.input}
          />

          {/* Nút gửi tin nhắn */}
          <TouchableOpacity style={styles.button} onPress={sendMessage}>
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
    justifyContent: "flex-end",
  },
  message: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 10,
    borderRadius: 10,
    maxWidth: "80%", // Set max width for message bubbles
  },
  sentMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-end", // Align sent messages to the right
    color: "#fff",
  },
  receivedMessage: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    alignSelf: "flex-start", // Align received messages to the left
  },
  timestamp: {
    fontSize: 10,
    color: "#888",
    textAlign: "right",
    marginTop: 5,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#3b5998",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Chat;
