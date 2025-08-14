// components/AIChat.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Send, X, MessageCircle, Bot, User, Loader, Lock, Maximize2, Minimize2 } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const AIChat = () => {
  const { token, userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello ${userData?.name?.split(' ')[0] || 'there'}! I'm your personal medical AI assistant. How can I assist you today?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleChatToggle = () => {
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleLoginRedirect = () => {
    setShowLoginPrompt(false);
    navigate('/login');
  };

  const sendMessage = async () => {
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: inputMessage,
          context: 'medical_health',
          userId: userData?._id,
          userName: userData?.name
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage = {
        id: messages.length + 2,
        text: data.response || "I apologize, but I'm having trouble processing your request right now.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: messages.length + 2,
        text: "I'm sorry, I'm experiencing technical difficulties.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Login Prompt */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <Lock className="mx-auto mb-4 text-blue-600" size={48} />
              <h3 className="text-lg font-semibold mb-2">Login Required</h3>
              <p className="text-gray-600 mb-4">
                Please log in to access our AI medical assistant.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLoginRedirect}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={handleChatToggle}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-3 sm:p-4 rounded-full shadow-lg transition-all duration-300 z-50 ${
          token 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-400 hover:bg-gray-500 text-white'
        }`}
        aria-label="Open AI Chat"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {!token && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && token && (
        <div
          className={`fixed ${
            isFullScreen
              ? 'top-0 left-0 w-full h-full rounded-none'
              : 'bottom-20 right-4 sm:bottom-24 sm:right-6 w-[95%] h-[70vh] sm:w-96 sm:h-96 rounded-lg'
          } bg-white shadow-2xl border border-gray-200 flex flex-col z-50`}
        >
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={18} className="sm:size-20" />
              <div>
                <h3 className="font-semibold text-sm sm:text-base">Medical AI Assistant</h3>
                <p className="text-[10px] sm:text-xs opacity-90">
                  Hello {userData?.name?.split(' ')[0] || 'User'}! • Powered by Gemini AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-100'
                  }`}>
                    {message.sender === 'user' ? (
                      <User size={14} className="text-white" />
                    ) : (
                      <Bot size={14} className="text-gray-600" />
                    )}
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <p className={`mt-1 text-[10px] sm:text-xs ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bot size={14} className="text-gray-600" />
                  </div>
                  <div className="bg-gray-100 text-gray-800 p-2 sm:p-3 rounded-lg">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Loader size={14} className="animate-spin" />
                      <span className="text-xs sm:text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about symptoms, treatments, or health advice..."
                className="flex-1 p-2 border border-gray-300 rounded-lg resize-none text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="1"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
              ⚠️ This AI provides general information only. For medical emergencies, consult a doctor immediately.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
