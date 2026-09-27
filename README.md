# React Native RAG Chatbot

A local-first Retrieval-Augmented Generation (RAG) chat application built with React Native. This app processes uploaded documents, computes vector embeddings, and queries Google's Gemini models to provide context-aware answers directly from your files.

## Features

* **Retrieval-Augmented Generation (RAG):** Upload documents (like the Apollo spaceflight history) and ask specific, factual questions based on the text.
* **Seamless Context Switching:** The app recognizes when a query falls outside the scope of the uploaded document and seamlessly falls back on general LLM knowledge.
* **Local Vector Storage:** Uses `react-native-mmkv` to store and query vector coordinates directly on the device for fast retrieval.
* **Mathematical Semantic Search:** Computes Cosine Similarity (cos θ) to match user queries with the most relevant document chunks based on semantic proximity.

## Tech Stack

* **Framework:** React Native / Expo
* **LLM:** Google Gemini (`gemini-3.6-flash`)
* **Embeddings:** Google Gemini (`gemini-embedding-2-preview`)
* **Storage:** `react-native-mmkv`
* **Native Modules:** `react-native-nitro-modules`

## How It Works

1. **Vector Embeddings:** Document text is broken into manageable chunks and passed through the `gemini-embedding-2-preview` model. This translates human language into arrays of numbers, plotting them as exact coordinates in a high-dimensional mathematical space.
2. **Cosine Similarity (cos θ):** When a user asks a question, the prompt is converted into a vector. The app calculates the Cosine Similarity between the query vector and the stored document vectors. By dividing the dot product by the magnitudes of the vectors, it measures the exact angle (cos θ) between them.
3. **Context Generation:** Text chunks that meet the 0.6 similarity threshold are pulled from local storage and fed to `gemini-3.6-flash` to generate a precise, context-aware response.

## Prerequisites

Because this project relies on custom C++ native databases and modules (`react-native-mmkv` and `react-native-nitro-modules`), it **cannot** be run in the standard Expo Go sandbox. You must compile the native iOS or Android code.

* macOS with Xcode 16+ (for iOS development)
* CocoaPods
* Node.js

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Soumyadeep2003/chat_bot.git](https://github.com/Soumyadeep2003/chat_bot.git)
   cd chat_bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Google Gemini API key. Ensure this file is added to your `.gitignore`.
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

4. **Build and Run:**
   Bypass Expo Go and compile the custom native app directly to your simulator:
   ```bash
   npx expo run:ios
   ```