import { GoogleGenAI } from "@google/genai";

export const chatModel = "gemini-3-flash-preview";
export const imageModel = "gemini-2.5-flash-image";

let aiInstance: GoogleGenAI | null = null;

function getAIInstance() {
  if (aiInstance) return aiInstance;

  // Try to get the API key from various sources
  // 1. Vite environment variable (user provided)
  // 2. Platform provided process.env.GEMINI_API_KEY
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined);

  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your environment variables or Settings menu.");
  }

  aiInstance = new GoogleGenAI({ apiKey });
  return aiInstance;
}

export async function* sendMessageStream(message: string, history: any[] = []) {
  const ai = getAIInstance();
  const chat = ai.chats.create({
    model: chatModel,
    config: {
      systemInstruction: "You are a helpful and creative AI assistant. You can help with writing, coding, analysis, and more.",
    },
  });

  const result = await chat.sendMessageStream({ message });
  
  for await (const chunk of result) {
    yield chunk.text;
  }
}

export async function generateImage(prompt: string) {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: imageModel,
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString = part.inlineData.data;
      return `data:image/png;base64,${base64EncodeString}`;
    }
  }
  throw new Error("No image generated.");
}

export async function analyzeImage(prompt: string, base64Image: string, mimeType: string) {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: chatModel,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });

  return response.text;
}
