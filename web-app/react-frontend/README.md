# ExoPlanet AI Website

A professional space science website built with React.js for the Exoplanet Reasoning LLM project. This website showcases advanced AI capabilities for astronomical discovery and analysis.

## 🌟 Features

- **Modern React.js Frontend**: Built with React 18, Framer Motion, and modern web technologies
- **ExpoAI**: Real-time chat interface with ExoPlanet AI
- **Community Hub**: Forums, discussions, and research collaboration
- **Mathematical Formulas**: Comprehensive database of astronomical equations
- **Technical Documentation**: Detailed solution architecture and methodology
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **API Integration**: Seamless connection to the FastAPI backend

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+ (for backend API)
- The ExoPlanet AI backend running on port 8000

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd web-react
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Start the backend API** (in a separate terminal):
   ```bash
   cd ../deployment
   python api_server.py --model ../outputs/cpu_model
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## 📁 Project Structure

```
web-react/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.js      # Navigation component
│   │   └── Footer.js      # Footer component
│   ├── pages/             # Main page components
│   │   ├── Home.js        # Homepage
│   │   ├── Playground.js  # LLM chat interface
│   │   ├── Community.js   # Community hub
│   │   ├── Solution.js    # Technical documentation
│   │   └── Formulas.js    # Mathematical formulas
│   ├── services/          # API integration
│   │   └── api.js         # API service layer
│   ├── hooks/             # Custom React hooks
│   │   └── useAPI.js      # API hooks
│   ├── App.js             # Main app component
│   └── index.js           # Entry point
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🎨 Design Features

### Space Science Theme
- **Dark cosmic background** with animated starfield
- **Gradient text effects** and glass morphism
- **Professional typography** with Inter and JetBrains Mono fonts
- **Smooth animations** powered by Framer Motion

### Interactive Elements
- **Real-time chat** with markdown support
- **Formula database** with search and filtering
- **Community discussions** with upvoting and replies
- **Responsive navigation** with mobile optimization

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

### API Integration

The website connects to the Exoplanet LLM API server. Make sure the backend is running on the configured port (default: 8000).

## 📱 Pages Overview

### 🏠 Homepage
- Hero section with animated starfield
- Feature showcase and statistics
- Testimonials from researchers
- Call-to-action sections

### 🎮 ExpoAI
- Interactive chat with the Exoplanet LLM
- Real-time message streaming
- Conversation history and export
- Settings for temperature and token limits

### 👥 Community
- Discussion forums and research papers
- Q&A section with voting
- User showcase and contributions
- Search and filtering capabilities

### 🔬 Solution
- Technical architecture overview
- Training pipeline documentation
- Performance metrics and benchmarks
- Technology stack details

### 📐 Formulas
- Comprehensive database of astronomical equations
- Interactive formula display
- Variable explanations and applications
- Search and category filtering

## 🛠️ Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Code Style

- **ESLint** configuration for code quality
- **Prettier** for code formatting
- **Component-based architecture** with hooks
- **Custom CSS** with modern features

## 🚀 Deployment

### Production Build

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Serve the build folder**:
   ```bash
   npx serve -s build
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "-s", "build"]
```

## 🔗 API Endpoints

The website integrates with the following API endpoints:

- `GET /health` - Health check
- `POST /chat` - Send message to LLM
- `GET /model/info` - Get model information
- `GET /docs` - API documentation

## 🎯 Features in Detail

### Real-time Chat
- **Streaming responses** from the LLM
- **Markdown rendering** with syntax highlighting
- **Message history** and conversation management
- **Error handling** and retry functionality

### Community Features
- **Discussion threads** with categories
- **Research paper** sharing and citations
- **Q&A system** with voting
- **User profiles** and contributions

### Mathematical Formulas
- **Interactive formula** display
- **Variable explanations** and units
- **Search functionality** across formulas
- **Category filtering** and organization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **NASA Exoplanet Archive** for data sources
- **Hugging Face** for transformer models
- **React community** for excellent documentation
- **Framer Motion** for smooth animations

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Join our community discussions
- Contact the development team

---

**Built with ❤️ for space exploration and AI research**
