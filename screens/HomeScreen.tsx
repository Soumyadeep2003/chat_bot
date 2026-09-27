import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useRef, useState } from "react";
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
import useApiService from "../api/apiService";
import ChatItem from "../components/ChatItem";
import CustomAppBar from "../components/CustomAppBar";
import useVectorDb from "../database/useVectorDb";

type chatType = {
  role: string;
  parts: { text: string }[];
};

export default function HomeScreen() {
  const { configureModel, streamMessage } = useApiService();
  const { addChunksToDb, searchFromDb } = useVectorDb();
  const [chatHistory, setChatHistory] = useState<chatType[]>([
    {
      role: "model",
      parts: [{ text: "Hello, I am Gemini, your personal assistant." }],
    },
  ]);
  const [messages, setMessages] = useState<string>("");

  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [isFileAttached, setIsFileAttached] = useState<boolean>(false);

  const insets = useSafeAreaInsets();
  const fileTextContent = useRef<string>("");

  useEffect(() => {
    configureModel(
      "You are the most efficient personal assistant. Answer based on context provided if available.",
    );
  }, []);

  const chunkText = (text: string, maxCharLength: number = 1000) => {
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: string[] = [];

    paragraphs.forEach((para) => {
      let remainingText = para.trim();

      while (remainingText.length > 0) {
        if (remainingText.length <= maxCharLength) {
          chunks.push(remainingText);
          break;
        }

        let splitIndex = remainingText.lastIndexOf(" ", maxCharLength);

        if (splitIndex === -1) {
          splitIndex = maxCharLength;
        }

        chunks.push(remainingText.substring(0, splitIndex).trim());
        remainingText = remainingText.substring(splitIndex).trim();
      }
    });

    return chunks;
  };

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
    if (!messages.trim() || isProcessingFile) return;

    const displayUserChat: chatType = {
      role: "user",
      parts: [{ text: messages }],
    };
    const aiChatPlaceholder: chatType = {
      role: "model",
      parts: [{ text: "" }],
    };

    let promptToSendToAPI = messages;

    if (isFileAttached && fileTextContent.current !== "") {
      const relevantChunks = await searchFromDb(messages, 3);

      if (relevantChunks.length > 0) {
        const injectedContext = `
          You are an intelligent assistant. You have access to the user's local documents. 
          
          Instructions:
          1. If the user's question can be answered using the local context, prioritize it and explicitly state that you are referencing their documents.
          2. If the user's question is a general world query (like programming, math, advice) OR the local context does not contain the answer, ignore the context and answer using your general knowledge.
          
          --- LOCAL CONTEXT START ---
          ${relevantChunks.map((result, i) => `[Source ${i + 1}]:${result.text}`).join("\n")}
          --- LOCAL CONTEXT END ---
        `;

        promptToSendToAPI = `${injectedContext}\n\nUser Question: ${messages}`;
      }
    }

    const filteredHistory = chatHistory.filter(
      (chat) =>
        !(
          chat.role === "model" &&
          chat.parts[0].text === "Hello, I am Gemini, your personal assistant."
        ),
    );

    setChatHistory([aiChatPlaceholder, displayUserChat, ...chatHistory]);
    setMessages("");

    const apiUserChat: chatType = {
      role: "user",
      parts: [{ text: promptToSendToAPI }],
    };

    const requestBody = [apiUserChat, ...filteredHistory];
    const apiHistory = [...requestBody].reverse();

    await streamMessage({ contents: apiHistory }, onUpdate, onFailure);
  };

  const onUpdate = (response: string) => {
    setChatHistory((prevHistory) => {
      const updated = [...prevHistory];
      updated[0] = { role: "model", parts: [{ text: response }] };
      return updated;
    });
  };

  const onFileUploadPress = async () => {
    try {
      console.log("Opening file picker...");

      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: false,
        copyToCacheDirectory: true,
      });

      console.log("Picker result:", pickerResult);

      if (pickerResult.canceled) {
        console.log("Picker was canceled or instantly aborted.");
        return;
      }

      const fileUri = pickerResult.assets[0].uri;
      const fileName = pickerResult.assets[0].name;

      if (!fileName.toLowerCase().endsWith(".txt")) {
        Alert.alert("Invalid File", "Please select a valid .txt file.");
        return;
      }

      setIsProcessingFile(true);

      const textContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      fileTextContent.current = textContent;

      const chunks = chunkText(textContent);
      await addChunksToDb(chunks);

      setIsFileAttached(true);
      setIsProcessingFile(false);

      Alert.alert(
        "Success",
        "File attached! Your next question will search this file.",
      );
    } catch (error) {
      setIsProcessingFile(false);
      console.error("File error:", error);
      Alert.alert("Error", "Could not read the file.");
    }
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
        <StatusBar barStyle="light-content" backgroundColor="#2d8ae7" />
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
            keyExtractor={(_, index) => index.toString()}
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
            {/* Show an indicator if processing chunks */}
            {isProcessingFile ? (
              <ActivityIndicator
                size="small"
                color="#2d8ae7"
                style={{ marginHorizontal: 15 }}
              />
            ) : (
              <TouchableOpacity
                style={styles.fileUploadBtn}
                onPress={onFileUploadPress}
              >
                <Feather
                  name="file-plus"
                  size={30}
                  color={isFileAttached ? "#28a745" : "#2d8ae7"}
                />
              </TouchableOpacity>
            )}

            <TextInput
              value={messages}
              onChangeText={setMessages}
              placeholder="Enter your message here"
              placeholderTextColor="#636060"
              multiline={true}
              style={styles.messageTextInput}
              editable={!isProcessingFile}
            />

            <TouchableOpacity
              onPress={handleSendMessage}
              style={styles.sendButton}
              disabled={isProcessingFile}
            >
              <MaterialCommunityIcons
                name="send-circle"
                size={40}
                color={isProcessingFile ? "#aaa" : "#2d8ae7"}
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
  fileUploadBtn: {
    marginHorizontal: 10,
    justifyContent: "center",
  },
});
