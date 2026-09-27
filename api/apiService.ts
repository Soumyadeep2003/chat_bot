import {
  GenerateContentRequest,
  GenerativeModel,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { Alert } from "react-native";

const genAi = new GoogleGenerativeAI(
  process.env.EXPO_PUBLIC_GEMINI_API_KEY as string,
);
let globalModel: GenerativeModel | null = null;
let globalEmbeddingModel: GenerativeModel | null = null;

export default function useApiService() {
  const configureModel = (
    msg: string,
    temp: number = 0.7,
    topK: number = 40,
    topP: number = 0.9,
  ) => {
    if (globalModel != null) {
      return;
    }

    globalModel = genAi.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: msg,
      generationConfig: {
        temperature: temp,
        topK: topK,
        topP: topP,
      },
    });

    globalEmbeddingModel = genAi.getGenerativeModel({
      model: "gemini-embedding-2-preview",
    });
  };

  const reconfigureModel = (
    msg: string,
    temp: number = 0.7,
    topK: number = 40,
    topP: number = 0.9,
  ) => {
    globalModel = genAi.getGenerativeModel({
      model: "gemini-3.6-flash",
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
      if (!globalModel) {
        onFailure("Error: The AI model is not configured yet.");
        return;
      }
      const response = await globalModel.generateContentStream(requestBody);
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
      if (!globalModel) {
        onFailure("Error: The AI model is not configured yet.");
        return;
      }
      const response = await globalModel.generateContent(requestBody);
      onSuccess(response?.response.text());
    } catch (error) {
      onFailure(`Error occurred : ${error}`);
    }
  };

  const getVectorCoordinates = async (text: string) => {
    try {
      if (!globalEmbeddingModel) {
        Alert.alert("Error", "Error: The AI model is not configured yet.");
        return;
      }
      const response = await globalEmbeddingModel.embedContent(text);
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
