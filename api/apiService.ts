import { GenerateContentRequest, GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { useRef } from "react";

export default function useApiService() {
    const genAi = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
    const model = useRef<GenerativeModel | null>(null);

    const configureModel = (msg: string, temp: number = 0.7, topK: number = 40, topP: number = 0.9) => {
        if (model.current != null) {
            return;
        }
        model.current = genAi.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: msg,
            generationConfig: {
                temperature: temp,
                topK: topK,
                topP:topP
            }
        });
    }

    const reconfigureModel = (
      msg: string,
      temp: number = 0.7,
      topK: number = 40,
      topP: number = 0.9,
    ) => {
      model.current = genAi.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: msg,
        generationConfig: {
          temperature: temp,
          topK: topK,
          topP: topP,
        },
      });
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
        }
        catch (error) {
            onFailure(`Error occurred : ${error}`)
        }
    };
}
