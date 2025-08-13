// routes/aiRoute.js
import express from 'express';
import { chatWithAI, getChatHistory, healthCheck } from '../controllers/aiController.js';
// import authUser from '../middlewares/authUser.js';

const aiRouter = express.Router();

// Chat with AI endpoint
aiRouter.post('/chat', chatWithAI);

// Get chat history (optional feature)
aiRouter.get('/history', getChatHistory);

// Health check for AI service
aiRouter.get('/health', healthCheck);

export default aiRouter;