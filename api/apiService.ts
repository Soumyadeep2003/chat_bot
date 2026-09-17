import {
  GenerateContentRequest,
  GenerativeModel,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { useRef } from "react";
import { Alert } from "react-native";

export default function useApiService() {
  const genAi = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY as string);
  const model = useRef<GenerativeModel | null>(null);
  const embeddingModel = useRef<GenerativeModel | null>(null);

  const configureModel = (
    msg: string,
    temp: number = 0.7,
    topK: number = 40,
    topP: number = 0.9,
  ) => {
    if (model.current != null) {
      return;
    }
    model.current = genAi.getGenerativeModel({
      model: "gemini-1.5-flash", 
      systemInstruction: msg,
      generationConfig: {
        temperature: temp,
        topK: topK,
        topP: topP,
      },
    });
    embeddingModel.current = genAi.getGenerativeModel({
      model: "text-embedding-004",
    });
  };

  const reconfigureModel = (
    msg: string,
    temp: number = 0.7,
    topK: number = 40,
    topP: number = 0.9,
  ) => {
    model.current = genAi.getGenerativeModel({
      model: "gemini-1.5-flash", 
      systemInstruction: msg,
      generationConfig: {
        temperature: temp,
        topK: topK,
        topP: topP,
      },
    });
  };

  const streamMessage = async (
    requestBody: GenerateContentRequest,
    onUpdate: (response: string) => void,
    onFailure: (errorMsg: string) => void,
  ) => {
    try {
      if (!model.current) {
        onFailure("Error: The AI model is not configured yet.");
        return;
      }
      const response = await model.current?.generateContentStream(requestBody);
      let resultText = "";
      for await (const chunk of response.stream) {
        resultText += chunk.text();
        onUpdate(resultText);
      }
    } catch (error) {
      onFailure(`Error occurred : ${error}`);
    }
  };

  const sendMessage = async (
    requestBody: GenerateContentRequest,
    onSuccess: (response: string) => void,
    onFailure: (errorMsg: string) => void,
  ) => {
    try {
      if (!model.current) {
        onFailure("Error: The AI model is not configured yet.");
        return;
      }
      const response = await model.current?.generateContent(requestBody);
      onSuccess(response?.response.text());
    } catch (error) {
      onFailure(`Error occurred : ${error}`);
    }
  };

  const getVectorCoordinates = async (text: string) => {
    try {
      if (!embeddingModel.current) {
        Alert.alert("Error", "Error: The AI model is not configured yet.");
        return;
      }
      const response = await embeddingModel.current?.embedContent(text);
      return response.embedding.values;
    } catch (error) {
      Alert.alert("Error", `Error occured : ${error}`);
    }
  };

  return {
    configureModel,
    reconfigureModel,
    sendMessage,
    streamMessage,
    getVectorCoordinates,
  };
}