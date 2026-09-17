import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomAppBar from "../components/CustomAppBar";
import ChatItem from "../components/ChatItem";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useApiService from "../api/apiService";
import Feather from "@expo/vector-icons/Feather";

type chatType = {
  role: string;
  parts: { text: string }[];
};

export default function HomeScreen() {
  const { configureModel, sendMessage, streamMessage } = useApiService();
  const [chatHistory, setChatHistory] = useState<chatType[]>([
    {
      role: "model",
      parts: [{ text: "Hello, I am Gemini, your personal assistant." }],
    },
  ]);
  const [messages, setMessages] = useState<string>("");

  const insets = useSafeAreaInsets();

  useEffect(() => {
    configureModel(
      "You are the most efficient personal assistant to a person that has ever been",
    );
  }, []);

  const renderItem = (item: chatType) => {
    if (item.role === "model" && item.parts[0].text === "") {
      return (
        <View style={styles.loadingBubble}>
          <ActivityIndicator size="small" color="#2d8ae7" />
        </View>
      );
    }

    return <ChatItem chat={item.parts[0].text} role={item.role} />;
  };

  const handleSendMessage = async () => {
    if (!messages.trim()) return;

    const newChat: chatType = {
      role: "user",
      parts: [{ text: messages }],
    };

    const aiText: chatType = {
      role: "model",
      parts: [{ text: "" }],
    };

    const requestBody = [newChat, ...chatHistory];

    const updatedHistory = [aiText, newChat, ...chatHistory];

    setMessages("");
    setChatHistory(updatedHistory);

    const apiHistory = [...requestBody].reverse();

    await streamMessage({ contents: apiHistory }, onUpdate, onFailure);
  };

  const onUpdate = (response: string) => {
    setChatHistory((prevHistory) => {
      const updated = [...prevHistory];
      updated[0] = {
        role: "model",
        parts: [{ text: response }],
      };
      return updated;
    });
  };

  const onSuccess = (response: string) => {
    const responseChat: chatType = {
      role: "model",
      parts: [{ text: response }],
    };

    setChatHistory((prevHistory) => [responseChat, ...prevHistory]);
  };

  const onFileUploadPress=()=>{
    
  };

  const onFailure = (errorMessage: string) => {
    Alert.alert("An error occurred", errorMessage);

    setChatHistory((prevHistory) => {
      const updated = [...prevHistory];

      updated[0] = {
        role: "model",
        parts: [{ text: `Error: ${errorMessage}` }],
      };

      return updated;
    });
  };
  return (
    <View style={styles.mainWrapper}>
      <View style={[styles.headerSafeArea, { paddingTop: insets.top }]}>
        <StatusBar
          hidden={false}
          barStyle="light-content"
          backgroundColor="#2d8ae7"
        />
        <CustomAppBar />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={[styles.contentContainer, { paddingBottom: insets.bottom }]}
        >
          <FlatList
            data={chatHistory}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => renderItem(item)}
            style={styles.chatList}
            inverted={true}
          />

          <View
            style={[
              styles.messageInput,
              { marginBottom: insets.bottom > 0 ? 10 : 20 },
            ]}
          >
            <TouchableOpacity style={styles.fileUploadBtn} onPress={onFileUploadPress}>
              <Feather name="file-plus" size={30} color="#2d8ae7" />
            </TouchableOpacity>

            <TextInput
              value={messages}
              onChangeText={setMessages}
              returnKeyType="next"
              placeholder="Enter your message here"
              placeholderTextColor="#636060"
              multiline={true}
              style={styles.messageTextInput}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              style={styles.sendButton}
            >
              <MaterialCommunityIcons
                name="send-circle"
                size={40}
                color="#2d8ae7"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: "white",
  },
  headerSafeArea: {
    backgroundColor: "#2d8ae7",
  },
  contentContainer: {
    flex: 1,
    padding: 10,
    paddingTop: 0,
    backgroundColor: "white",
  },
  chatList: {
    flex: 1,
  },
  messageInput: {
    marginBottom: 20,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  messageTextInput: {
    backgroundColor: "#c0e3e2",
    borderRadius: 15,
    borderColor: "#203843",
    borderWidth: 1,
    padding: 12,
    flex: 1,
  },
  sendButton: {
    marginHorizontal: 10,
    justifyContent: "center",
  },
  loadingBubble: {
    backgroundColor: "#F1F1F1",
    alignSelf: "flex-start",
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    marginVertical: 4,
    marginLeft: 10,
  },
  fileUploadBtn:{
    marginHorizontal: 10,
    justifyContent: "center",
  },
});
