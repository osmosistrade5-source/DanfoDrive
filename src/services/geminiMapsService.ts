import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface MapGroundingResult {
  text: string;
  links: { uri: string; title: string }[];
}

export const searchWithAiMaps = async (query: string, location?: { lat: number; lng: number }): Promise<MapGroundingResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: location ? {
              latitude: location.lat,
              longitude: location.lng
            } : undefined
          }
        }
      },
    });

    const text = response.text || "No information found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const links = chunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any) => ({
        uri: chunk.maps.uri,
        title: chunk.maps.title || "View on Google Maps"
      }));

    return { text, links };
  } catch (error) {
    console.error("Gemini Maps Grounding Error:", error);
    return {
      text: "Failed to fetch AI map data. Please try again later.",
      links: []
    };
  }
};
