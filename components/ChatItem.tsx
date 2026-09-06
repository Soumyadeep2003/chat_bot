import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Markdown from "react-native-markdown-display";

const { width } = Dimensions.get("window");

type ChatItemProps = {
  chat: string;
  role: string;
};

export default function ChatItem({ chat, role }: ChatItemProps) {
  const isModel = role === "model";

  return (
    <View
      style={[styles.messageRow, isModel ? styles.rowModel : styles.rowUser]}
    >
      <View
        style={[styles.chatBox, isModel ? styles.modelBox : styles.userBox]}
      >
        <Markdown
          style={isModel ? markdownStyles.modelText : markdownStyles.userText}
        >
          {chat}
        </Markdown>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    width: "100%",
    flexDirection: "row",
    marginVertical: 4,
  },
  rowModel: {
    justifyContent: "flex-start",
  },
  rowUser: {
    justifyContent: "flex-end",
  },

  chatBox: {
    padding: 12,
    borderRadius: 16,
    maxWidth: width * 0.8,
  },
  modelBox: {
    backgroundColor: "#F1F1F1",
    borderBottomLeftRadius: 4,
  },
  userBox: {
    backgroundColor: "#2d8ae7",
    borderBottomRightRadius: 4,
  },
});

const markdownStyles = {
  modelText: {
    body: { color: "#000000" },
    paragraph: { marginTop: 0, marginBottom: 8 },
    list_item: { marginTop: 0, marginBottom: 4 },
  },
  userText: {
    body: { color: "#FFFFFF" },
    paragraph: { marginTop: 0, marginBottom: 0 },
  },
};
