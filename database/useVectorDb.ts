import { createMMKV } from "react-native-mmkv";
import useApiService from "../api/apiService";

const storage = createMMKV();
const dbKey = "My_Storage_Key";

type Item = {
  text: string;
  vector: number[];
  score?: number;
};

const cosineSimilarity = (vecA: number[], vecB: number[]) => {
  if (vecA.length !== vecB.length) {
    console.log("2 vectors are not of the same length");
    return 0; 
  }
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  if (magA === 0 || magB === 0) return 0; 
  
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
};

export default function useVectorDb() {
  const apiService = useApiService(); 

  const getAllDocuments = (): Item[] => {
    const result = storage.getString(dbKey);
    return JSON.parse(result ?? "[]");
  };

  const addToDb = async (text: string) => {
    const vectorCo = (await apiService.getVectorCoordinates(text)) ?? [];
    const newItem: Item = { text: text, vector: vectorCo };
    const docs = getAllDocuments();
    docs.push(newItem);
    storage.set(dbKey, JSON.stringify(docs));
  };

  const searchFromDb = async (query: string, topK: number = 3) => {
    const docs = getAllDocuments();
    const queryVector = await apiService.getVectorCoordinates(query);
    
    if (queryVector !== undefined) {
      docs.forEach((item) => {
        item.score = cosineSimilarity(item.vector, queryVector);
      });
    }
    
    const resultArr = docs
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, topK);

    return resultArr;
  };

  return { addToDb, searchFromDb };
}