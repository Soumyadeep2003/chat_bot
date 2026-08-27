import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";

export default function CustomAppBar() {
  return (
    <View style={styles.appBarContainer}>
      <Text style={styles.text}>Chat Bot</Text>
      <TouchableOpacity onPress={() => {}}>
        <Entypo name="dots-three-vertical" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  appBarContainer: {
    height: 50,
    backgroundColor: "#2d8ae7", 
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 30,
  },
});
