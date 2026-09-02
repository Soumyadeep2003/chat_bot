import React from "react";
import { StyleSheet, Text, View } from "react-native";

type ChatItemProps = {
  chat: string;
  role: string;
};

export default function ChatItem({ chat, role }: ChatItemProps) {
  const isModel = role === "model";

  return (
    <View style={[styles.chatBox, isModel ? styles.modelBox : styles.userBox]}>
      <Text style={isModel ? styles.modelText : styles.userText}>
        {chat}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chatBox: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: "80%", 
  },

  modelBox: {
    backgroundColor: "#F1F1F1",
    alignSelf: "flex-start",    
    borderBottomLeftRadius: 4,  
  },
  modelText: {
    color: "#000000",
  },

  userBox: {
    backgroundColor: "#2d8ae7", 
    alignSelf: "flex-end",    
    borderBottomRightRadius: 4,
  },
  userText: {
    color: "#FFFFFF",
  },
});