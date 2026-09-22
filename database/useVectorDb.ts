import { createMMKV } from "react-native-mmkv";
import useApiService from "../api/apiService";

const storage = createMMKV();
const dbKey = "My_Storage_Key";

export type Item = {
  text: string;
  vector: number[];
  score?: number;
};

const cosineSimilarity = (vecA: number[], vecB: number[]) => {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0,
    magA = 0,
    magB = 0;
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

  const addChunksToDb = async (chunks: string[]) => {
    const docs = getAllDocuments();
    let addedNewDocs = false;

    for (const chunk of chunks) {
      const alreadyExists = docs.some((doc) => doc.text === chunk);
      if (alreadyExists) continue;

      const vectorCo = await apiService.getVectorCoordinates(chunk);
      if (vectorCo) {
        docs.push({ text: chunk, vector: vectorCo });
        addedNewDocs = true;
      }
    }

    if (addedNewDocs) {
      storage.set(dbKey, JSON.stringify(docs));
    }
  };

  const searchFromDb = async (
    query: string,
    topK: number = 3,
    threshold: number = 0.6, 
  ): Promise<Item[]> => {
    const docs = getAllDocuments();
    const queryVector = await apiService.getVectorCoordinates(query);

    if (queryVector !== undefined) {
      docs.forEach((item) => {
        item.score = cosineSimilarity(item.vector, queryVector);
      });
    }

    return (
      docs
        .filter((item) => (item.score ?? 0) >= threshold)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, topK)
    );
  };

  return { addChunksToDb, searchFromDb, getAllDocuments };
}
