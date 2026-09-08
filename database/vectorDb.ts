
import {
  GenerateContentRequest,
  GenerativeModel,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import useApiService from "../api/apiService";

export default function vectorDb (){
    const {getVectorCoordinates} = useApiService();
    const getAllDocuments =()=>{
        
    }
    const addToDb = (text:string)=>{
        
    };

    const searchFromDb=(query:string)=>{

    };

    return {addToDb,searchFromDb};
}