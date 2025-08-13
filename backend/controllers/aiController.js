// controllers/aiController.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const medicalPrompt = `You are a helpful medical AI assistant for a healthcare platform called PulseMate. 

IMPORTANT GUIDELINES:
1. You provide general health information and educational content only
2. You do NOT diagnose medical conditions or provide specific medical advice
3. Always recommend consulting with qualified healthcare professionals for medical concerns
4. For emergencies, always advise seeking immediate medical attention
5. Be empathetic, professional, and supportive
6. Keep responses concise but informative (max 200 words)
7. If asked about specific medications, provide general information but emphasize consulting a doctor or pharmacist

WHAT YOU CAN HELP WITH:
- General health information and wellness tips
- Common symptoms explanations (without diagnosis)
- Lifestyle and preventive health advice
- Mental health support and resources
- Nutrition and exercise guidance
- When to seek medical care

WHAT YOU SHOULD NOT DO:
- Diagnose specific medical conditions
- Recommend specific treatments or medications
- Replace professional medical consultation
- Provide advice for serious symptoms without recommending medical care

Always end serious health queries with a reminder to consult healthcare professionals on the platform or visit a doctor.`;

// Helper: retry Gemini calls
const generateWithRetry = async (modelName, prompt, retries = 2) => {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastError = err;
      if (err.status === 503 && i < retries) {
        const delay = (i + 1) * 2000;
        console.warn(`Model overloaded, retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      break;
    }
  }
  throw lastError;
};

export const chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const fullPrompt = `${medicalPrompt}\n\nUser Question: ${message}`;

    let aiText;
    try {
      aiText = await generateWithRetry("gemini-1.5-flash", fullPrompt);
    } catch (flashErr) {
      if (flashErr.status === 503) {
        console.warn("Switching to gemini-1.5-pro due to overload...");
        aiText = await generateWithRetry("gemini-1.5-pro", fullPrompt);
      } else {
        throw flashErr;
      }
    }

    console.log('AI Chat:', {
      timestamp: new Date(),
      userMessage: message,
      aiResponse: aiText.substring(0, 100) + '...'
    });

    res.json({
      success: true,
      response: aiText,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Gemini AI Error:', error);

    if (error.message?.includes('API key')) {
      return res.status(401).json({
        success: false,
        message: 'AI service configuration error. Please contact support.'
      });
    }

    if (error.status === 503) {
      return res.status(503).json({
        success: false,
        message: 'The AI is currently busy. Please try again shortly.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'I apologize, but I\'m experiencing technical difficulties. Please try again later or consult with one of our doctors directly.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    res.json({
      success: true,
      history: []
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat history'
    });
  }
};

export const healthCheck = async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    await model.generateContent("Hello");
    res.json({
      success: true,
      message: 'AI service is operational',
      status: 'healthy'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'AI service is unavailable',
      status: 'unhealthy'
    });
  }
};
