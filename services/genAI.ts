import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';

export const generateFocusSession = async (wrongAnswers: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Using Gemini 2.0 Flash Exp as it is reliable and supports the features needed
  const model = "gemini-2.0-flash-exp";

  const prompt = `
    I am a student using a quiz app. Here is a list of specific questions I have answered INCORRECTLY in the past:
    ${JSON.stringify(wrongAnswers).substring(0, 30000)} // Limit context if history is huge

    Your goal is to help me study.
    1. Analyze these mistakes to find common themes or weak topics.
    2. Write a short, encouraging "Focus Analysis" paragraph explaining what I need to work on.
    3. Generate 5 NEW multiple-choice questions that specifically target these weak areas. 
       - Do not simply repeat the old questions. Create variations or new questions on the same concepts.
       - Provide a clear "explanation" for each new question so I can learn.

    Return the response in strictly valid JSON format matching this schema.
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
            analysis: { type: Type.STRING },
            questions: {
                type: Type.ARRAY,
                items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                    timeLimit: { type: Type.INTEGER }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
                }
            }
            },
            required: ["analysis", "questions"]
        }
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Focus Mode AI Error:", error);
    throw error;
  }
}

export const generateQuizFromImage = async (
  imageBase64: string, 
  difficulty: string, 
  count: number
): Promise<{ title: string, questions: Question[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Clean base64 string if it contains the data URL prefix
  const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

  const prompt = `
    Analyze the image provided. Identify the main subject, text, or context.
    Generate a ${difficulty} difficulty quiz with ${count} multiple-choice questions based strictly on the content and context of the image.
    
    1. Create a catchy Title for the quiz.
    2. Create ${count} questions.
    3. For each question provide 4 options and the index of the correct answer (0-3).
    4. Provide a brief explanation for the answer.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Supports multimodal input
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg/png, API handles standard types
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  timeLimit: { type: Type.INTEGER }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["title", "questions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);

    // Map to application Question type
    const questions: Question[] = data.questions.map((q: any) => ({
      question: q.question,
      image: '', 
      type: 'multiple-choice',
      options: q.options,
      correctAnswer: q.correctAnswer,
      timeLimit: q.timeLimit || 20,
      explanation: q.explanation
    }));

    return {
      title: data.title || "Image Analysis Quiz",
      questions
    };

  } catch (error) {
    console.error("Image Quiz Gen Error:", error);
    throw error;
  }
};

export const generateImageForQuestion = async (text: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Prompt optimized for educational vector art style
  const prompt = `Create a clean, colorful, vector-art style educational illustration representing this quiz question: "${text}". Minimalist, icon-like, no text inside the image.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });
    
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (e) {
    console.error("Image Gen Error", e);
    return null;
  }
};