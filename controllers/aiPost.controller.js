import OpenAI from 'openai';
import { GoogleGenAI } from "@google/genai";
import { OPENAI_API_KEY, GEMINI_AI_KEY } from '../configs/env.js';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const AiPost = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const aiResponse = completion.choices[0]?.message?.content;

    res.status(200).json({
      message: 'AI response generated successfully',
      data: aiResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const ai = new GoogleGenAI({ apiKey: GEMINI_AI_KEY });

export const GeminiAiGen = async(req, res, next) => {
  try {
    const {prompt} = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    if(response) {
      res.status(200).json({ message: "Success", data: response});
    }
    else {
      res.status(500).json({ message: "Failed to generate response" });
    }

  } catch (error) {
    res.status(500).json({message: error.message});
  }
};