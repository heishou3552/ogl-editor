# 🎨 OGL Editor Online

A powerful, browser-based WebGL/GLSL shader editor with intelligent IntelliSense, real-time preview, and advanced development features. Built with modern web technologies for an exceptional developer experience. 

##### Project created with AI assistance.

![OGL Editor Screenshot](https://img.shields.io/badge/WebGL-Editor-blue?style=for-the-badge&logo=webgl)
![Monaco Editor](https://img.shields.io/badge/Monaco-Editor-green?style=for-the-badge&logo=visualstudiocode)
![Preact](https://img.shields.io/badge/Preact-673AB8?style=for-the-badge&logo=preact&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

### 🔧 Advanced Shader Development
- **Dual Pane Interface**: Code editor on the left, live preview on the right
- **Multi-Tab Editing**: Separate tabs for Vertex Shader, Fragment Shader, and JavaScript
- **Real-time Preview**: Instant shader compilation and rendering
- **Error Handling**: Comprehensive error detection and reporting

### 🧠 Intelligent IntelliSense
- **Smart Autocompletion**: 80+ built-in GLSL functions and variables
- **Parameter Hints**: Real-time function signature help
- **Code Snippets**: Quick templates for common shader patterns

### 📚 Example Library
- **Pre-built Shaders**: Collection of ready-to-use examples
- **Raymarching Scenes**: Advanced 3D rendering techniques
- **Fractal Patterns**: Mathematical art and Julia sets
- **Noise Functions**: Procedural textures and effects
- **Animated Gradients**: Dynamic color transitions

### 💾 Project Management
- **Import/Export**: Save and load shader projects as JSON
- **Reset Function**: Quickly return to default templates
- **Code Persistence**: Automatic state management

### 🎨 Modern UI/UX
- **Dark Theme**: Easy on the eyes for long coding sessions
- **Responsive Design**: Works on desktop and mobile devices
- **Tailwind CSS**: Beautiful, consistent styling
- **Radix UI**: Accessible, high-quality components

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Modern browser with WebGL support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vmaspad/ogl-editor-online.git
   cd ogl-editor-online
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production
```bash
npm run build
npm run preview
```

## 🏗️ Architecture

### Tech Stack
- **Frontend Framework**: Preact (React alternative)
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Editor**: Monaco Editor (VS Code engine)
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

### Project Structure
```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── tabs.tsx
│   └── OGLEditor.tsx       # Main editor component
├── lib/
│   ├── utils.ts           # Utility functions
│   └── examples.ts        # Default shader templates
├── shaders/
│   └── examples.ts        # Shader example library
├── assets/               # Static assets
└── main.tsx             # Application entry point
```

### Key Components

#### OGLEditor.tsx
The heart of the application, featuring:
- Monaco Editor integration with GLSL language support
- WebGL context management and shader compilation
- Real-time code injection and execution
- IntelliSense providers for autocompletion and hover info

## 📖 Usage Guide

### Basic Workflow

1. **Choose Shader Type**: Select Vertex, Fragment, or JavaScript tab
2. **Write Code**: Use the Monaco editor with full IntelliSense support
3. **Run Shader**: Click the "Run" button to compile and preview
4. **Iterate**: Make changes and see results in real-time

### Example Loading

1. Click the "Examples" button in the toolbar
2. Choose from pre-built shaders:
   - Basic Animated Gradient
   - 3D Raymarching Scene
   - Julia Set Fractal
   - Fractal Noise Clouds

### Import/Export

- **Export**: Save your current project as a JSON file
- **Import**: Load a previously saved project
- **Reset**: Return to default shader templates

## 🎯 Shader Development Tips

### GLSL Best Practices
```glsl
// Use precision qualifiers
precision mediump float;

// Normalize vectors for lighting calculations
vec3 normal = normalize(vNormal);

// Use built-in functions for performance
float distance = length(position - center);

// Clamp values to prevent overflow
vec3 color = clamp(finalColor, 0.0, 1.0);
```

### Performance Optimization
- Avoid complex calculations in fragment shaders when possible
- Use `const` for compile-time constants
- Minimize texture lookups
- Use `discard` sparingly

### Common Shader Patterns
- **Vertex transformation**: `gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);`
- **Fragment output**: `gl_FragColor = vec4(color, 1.0);`
- **UV coordinates**: `vec2 uv = gl_FragCoord.xy / resolution.xy;`

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- TypeScript for type safety
- ESLint configuration
- Prettier formatting
- Component-based architecture

### Adding New Features

1. **New Shader Examples**: Add to `src/shaders/examples.ts`
2. **UI Components**: Create in `src/components/ui/`
3. **GLSL Functions**: Extend IntelliSense in `OGLEditor.tsx`
4. **Utilities**: Add to `src/lib/utils.ts`


### WebGL Context Management
The editor handles WebGL context creation, shader compilation, and cleanup automatically:
- Automatic context switching
- Memory leak prevention
- Error boundary handling
- Graceful fallbacks


## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with proper TypeScript types
4. Add tests if applicable
5. Submit a pull request

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npx tsc --noEmit

# Build for production
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Monaco Editor**: Microsoft's excellent code editor
- **OGL Library**: Minimal WebGL library
- **Tailwind CSS**: Utility-first CSS framework
- **Preact**: Lightweight React alternative
- **Radix UI**: Accessible component primitives
- **Vite**: Fast build tool and dev server
