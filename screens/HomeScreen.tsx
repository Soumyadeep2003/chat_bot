import React, { useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAppBar from "../components/CustomAppBar";
import { Color } from "react-native/types_generated/Libraries/Animated/AnimatedExports";
import ChatItem from "../components/ChatItem";

type chatType = {
  role: string;
  parts: { text: string }[];
};

export default function HomeScreen() {
  const [chatHistory, setChatHistory] = useState<chatType[]>([
    {
      role: "model",
      parts: [{ text: "Hello, I am Gemini, your personal assistant." }],
    },
  ]);
  const [messages, setMessages] = useState<string>("");

  const renderItem = (item: chatType) => {
    return <ChatItem chat={item.parts[0].text} role={item.role} />;
  };

  return (
    <View style={styles.mainWrapper}>
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <CustomAppBar />
      </SafeAreaView>

      <View style={styles.contentContainer}>
        <StatusBar hidden={true} />
        <FlatList
          data={chatHistory}
          renderItem={({ item }) => renderItem(item)}
          style={styles.chatList}
          inverted={true}
        ></FlatList>
        <View style={styles.messageInput}>
          <TextInput
            value={messages}
            onChangeText={(text) => {
              setMessages(text);
            }}
            returnKeyType="next"
            placeholder="Enter your message here"
            placeholderTextColor="#636060"
            multiline={true}
            style={styles.messageTextInput}
          />
        </View>
      </View>
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
    // justifyContent: "center",
    // alignItems: "center",
    backgroundColor: "white",
  },
  chatList: {},
  messageInput: {
    marginBottom: 20,
  },
  messageTextInput: {
    backgroundColor: "#c0e3e2",
    borderRadius: 15,
    borderColor: "#203843",
    borderCurve: "circular",
    borderWidth: 1,
    padding: 12,
  },
});
