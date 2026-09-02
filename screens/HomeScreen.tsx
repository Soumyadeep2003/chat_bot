import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAppBar from "../components/CustomAppBar";

type chatType = {
  role: string,
  parts: { text: string }[]
}

//Test commit
export default function HomeScreen() {
  const [chatHistory, setChatHistory] = useState<chatType[]>([
    {
      role: "model",
      parts: [{ text: "Hello, I am Gemini, your personal assistant." }],
    },
  ]);

  const renderItem = ( item:chatType ) => {
    return (

    );
  };

  return (
    <View style={styles.mainWrapper}>
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <CustomAppBar />
      </SafeAreaView>

      <View style={styles.contentContainer}>
        <StatusBar style="light" />
        <FlatList
          data={chatHistory}
          renderItem={({item})=>renderItem(item)}>

        </FlatList>
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
    paddingTop:0,
    // justifyContent: "center",
    // alignItems: "center",
    backgroundColor: "white",
  },
});
