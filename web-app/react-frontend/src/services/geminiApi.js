// Google Gemini API service for Exoplanet chatbot
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

class GeminiAPI {
  constructor() {
    if (!API_KEY) {
      console.error('REACT_APP_GEMINI_API_KEY is not set in environment variables');
      this.genAI = null;
      this.model = null;
      return;
    }

    this.genAI = new GoogleGenerativeAI(API_KEY);
    // Use gemini-2.5-flash which is available and fast
    this.modelName = 'gemini-2.5-flash';
    this.model = this.genAI.getGenerativeModel({ 
      model: this.modelName,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });
    
    // Store conversation history
    this.conversations = new Map();
  }

  // System prompt for exoplanet expertise
  getSystemPrompt() {
    return `You are an expert AI assistant specializing in exoplanet science and astronomy. Your knowledge includes:

- Exoplanet detection methods (transit, radial velocity, direct imaging, gravitational microlensing)
- Habitable zone calculations and planetary habitability
- Planetary characterization (mass, radius, composition, atmosphere)
- Stellar properties and their effects on planetary systems
- Astrobiology and the search for life beyond Earth
- Space telescopes and observation techniques (JWST, Kepler, TESS, etc.)
- Orbital mechanics and planetary dynamics

Provide accurate, scientific, and educational responses. When discussing complex topics, break them down clearly. Always cite scientific principles and, when relevant, mention key missions or discoveries. Be enthusiastic about space exploration while maintaining scientific rigor.`;
  }

  // Check if API is available
  isAvailable() {
    return this.genAI !== null && this.model !== null;
  }

  // Get or create conversation history
  getConversation(conversationId) {
    if (!conversationId) {
      conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, []);
    }
    
    return { conversationId, history: this.conversations.get(conversationId) };
  }

  // Chat with Gemini
  async chat(message, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Gemini API is not properly configured. Please check your API key.');
    }

    const {
      conversationId = null,
      // temperature and maxTokens are extracted but not used in current implementation
      // They're kept for future configuration support
      // temperature = 0.7,
      // maxTokens = 2048
    } = options;

    try {
      // Get conversation history
      const { conversationId: convId, history } = this.getConversation(conversationId);

      // Build the full prompt with system context and history
      let fullPrompt = this.getSystemPrompt() + '\n\n';
      
      // Add conversation history
      if (history.length > 0) {
        fullPrompt += 'Previous conversation:\n';
        history.forEach(msg => {
          fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
        });
        fullPrompt += '\n';
      }
      
      // Add current message
      fullPrompt += `User: ${message}\nAssistant:`;

      // Generate response
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      // Update conversation history
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: text });

      // Keep only last 10 exchanges (20 messages) to manage context length
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      return {
        response: text,
        conversation_id: convId,
        timestamp: new Date().toISOString(),
        model: this.modelName
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to get response from Gemini: ${error.message}`);
    }
  }

  // Clear conversation history
  clearConversation(conversationId) {
    if (conversationId) {
      this.conversations.delete(conversationId);
    }
  }

  // Clear all conversations
  clearAllConversations() {
    this.conversations.clear();
  }

  // Get model information
  async getModelInfo() {
    return {
      model: this.modelName || 'gemini-1.5-pro-latest',
      provider: 'Google',
      capabilities: [
        'Exoplanet detection methods',
        'Habitable zone analysis',
        'Planetary characterization',
        'Astronomical calculations',
        'Scientific reasoning'
      ],
      available: this.isAvailable()
    };
  }
}

// Create singleton instance
const geminiApi = new GeminiAPI();

export default geminiApi;
