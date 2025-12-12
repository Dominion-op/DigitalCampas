import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// Note: In a real production app, ensure API_KEY is set in environment variables.
const apiKey = process.env.API_KEY || ''; 
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateNoticeContent = async (topic: string, tone: 'formal' | 'exciting' | 'urgent'): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key missing");
    return `[Mock AI]: ${topic} (${tone})`;
  }

  try {
    const model = ai.models;
    const prompt = `Write a short, clear digital signage notice for a college campus about: "${topic}". 
    The tone should be ${tone}. Keep it under 20 words. Do not include quotes.`;

    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating content:", error);
    return topic; // Fallback
  }
};

export const refineContent = async (text: string): Promise<string> => {
    if (!ai) return text;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Rewrite this text to be more professional and concise for a TV display: "${text}"`
        });
        return response.text.trim();
    } catch (e) {
        return text;
    }
}
