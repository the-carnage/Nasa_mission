// API service for Exoplanet LLM backend integration
import geminiApi from './geminiApi';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const USE_GEMINI = process.env.REACT_APP_GEMINI_API_KEY ? true : false;

class ExoplanetAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.useGemini = USE_GEMINI;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    if (this.useGemini) {
      return { status: 'ok', model_loaded: geminiApi.isAvailable() };
    }
    return this.request('/health');
  }

  // Chat with the LLM
  async chat(message, options = {}) {
    // Use Gemini API if available
    if (this.useGemini) {
      return await geminiApi.chat(message, options);
    }

    // Fallback to custom backend
    const {
      conversationId = null,
      temperature = 0.7,
      maxTokens = 512
    } = options;

    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        temperature,
        max_tokens: maxTokens
      })
    });
  }

  // Analyze exoplanet data
  async analyzeExoplanet(data) {
    if (this.useGemini) {
      // Use Gemini for analysis
      const prompt = `Analyze the following exoplanet data and provide insights:\n${JSON.stringify(data, null, 2)}`;
      return await geminiApi.chat(prompt);
    }
    return this.request('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Get conversation history
  async getConversation(conversationId) {
    if (this.useGemini) {
      return { conversation_id: conversationId, messages: [] };
    }
    return this.request(`/api/conversations/${conversationId}`);
  }

  // Get model information
  async getModelInfo() {
    if (this.useGemini) {
      return await geminiApi.getModelInfo();
    }
    return this.request('/model/info');
  }

  // Get API documentation
  async getDocs() {
    return this.request('/docs');
  }

  // Check if API is available
  async isAvailable() {
    if (this.useGemini) {
      return geminiApi.isAvailable();
    }
    try {
      const health = await this.checkHealth();
      return health.model_loaded;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const api = new ExoplanetAPI();

export default api;
