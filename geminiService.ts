
import { GoogleGenAI, Type, Modality } from "@google/genai";

// [Fix: Initialize GoogleGenAI strictly using process.env.API_KEY per guidelines]
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Fast AI Responses (Gemini Flash Lite)
export async function getQuickSummary(topic: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    // [Fix: Use compliant model name 'gemini-flash-lite-latest']
    model: 'gemini-flash-lite-latest',
    contents: `Provide a 2-sentence quick summary of: ${topic}`,
  });
  return response.text || "No summary available.";
}

// 2. NGO Assistant Chat (Gemini 3 Pro Preview)
export async function chatWithNGOAssistant(history: { role: string; text: string }[], message: string): Promise<string> {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: 'You are a helpful NGO assistant for "NGO Nexus". You assist donors and volunteers with questions about campaigns, social impact, and volunteering opportunities.',
    },
  });
  const response = await chat.sendMessage({ message });
  return response.text || "I'm sorry, I couldn't process that.";
}

// 3. Search Grounding (Gemini 3 Flash Preview)
export async function searchCharityTrends(query: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean) || [];
  return {
    text: response.text,
    sources
  };
}

// 4. Maps Grounding (Gemini 2.5 Flash)
// IMPORTANT: Gemini 2.5 series supports Google Maps grounding.
export async function findNearbyCharities(lat: number, lng: number) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `List 5 highly-rated charity organizations, food banks, or donation centers physically located near coordinates ${lat}, ${lng}. For each, provide a brief description of their work.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      }
    },
  });
  
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const places = chunks
    .filter((c: any) => c.maps)
    .map((c: any) => ({
      title: c.maps.title,
      uri: c.maps.uri,
      // Attempt to extract lat/lng from URI if possible, or just return the metadata
    }));

  return {
    text: response.text,
    places
  };
}

// 5. Image Generation (Gemini 3 Pro Image Preview)
export async function generateCampaignPoster(prompt: string, size: "1K" | "2K" | "4K"): Promise<string | null> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: `A professional NGO campaign poster: ${prompt}` }],
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
        imageSize: size
      }
    },
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

// 6. Image Editing (Gemini 2.5 Flash Image)
export async function editImpactPhoto(base64Image: string, instruction: string): Promise<string | null> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
        { text: instruction }
      ],
    },
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

// 7. Image Analysis (Gemini 3 Pro Preview)
export async function analyzeFieldPhoto(base64Image: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
        { text: "Analyze this field photo. What are the visible needs or current project status shown here? Provide a concise report for an NGO admin." }
      ],
    },
  });
  return response.text || "Analysis failed.";
}
