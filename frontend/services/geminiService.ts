
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// Note: In a real production app, ensure strict backend proxying for keys.
// Here we follow the requested structure using process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  /**
   * Generates a friendly welcome message or insight based on the user's name.
   */
  getWelcomeInsight: async (userName: string): Promise<string> => {
    try {
      const isPlaceholder = !process.env.API_KEY || process.env.API_KEY === 'PLACEHOLDER_API_KEY';
      if (isPlaceholder) return `Bem-vindo de volta, ${userName}.`;

      // Use gemini-3-flash-preview for basic text tasks as per guidelines
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Gere uma frase curta, motivadora e elegante de boas-vindas para um sistema financeiro pessoal para o usuário ${userName}. Apenas a frase.`,
      });

      return response.text || `Olá, ${userName}. Organize suas finanças hoje.`;
    } catch (error) {
      console.warn("Gemini service unavailable, using fallback.");
      return `Olá, ${userName}. Que bom ter você aqui!`;
    }
  },

  /**
   * Example function to suggest cost center categorization (future use)
   */
  suggestCategory: async (transactionDescription: string): Promise<string> => {
    try {
      if (!process.env.API_KEY) return "Geral";

      // Use gemini-3-flash-preview for simple classification tasks
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Categorize a transação financeira: "${transactionDescription}" em uma única palavra curta (Ex: Alimentação, Transporte, Lazer, Serviços).`,
      });

      return response.text?.trim() || "Geral";
    } catch (error) {
      return "Geral";
    }
  }
};
