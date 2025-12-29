
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { VideoInfo, GenerationSettings } from "../types";

export const analyzeVideoLink = async (url: string): Promise<VideoInfo> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Extract Video ID if it's a YouTube URL
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;

  if (!videoId) throw new Error("Invalid YouTube URL");

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this YouTube video link: ${url}. Provide the video title, typical content description, and channel name if possible. Use your search capabilities if needed. Return ONLY JSON.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          channelName: { type: Type.STRING },
        },
        required: ["title", "description", "channelName"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    ...data,
    id: videoId,
    originalThumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  };
};

export const generateThumbnail = async (videoInfo: VideoInfo, settings: GenerationSettings): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `Create a high-impact YouTube thumbnail for a video titled "${videoInfo.title}". 
  The video is about: ${videoInfo.description}.
  Visual Style: ${settings.style}. 
  Additional details: ${settings.extraPrompt}. 
  Make it look professional, vibrant, and click-worthy with bold text elements or eye-catching focus. 
  No actual text readable if not specified, but imply high quality cinematography.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: settings.aspectRatio,
      }
    }
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data returned from Gemini");
};
