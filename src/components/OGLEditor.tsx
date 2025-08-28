import { useEffect, useRef, useState } from "preact/hooks"
import { Editor } from "@monaco-editor/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Play, Square, RefreshCw, Download, Upload, BookOpen } from "lucide-react"
import { shaderExamples } from "@/shaders/examples"
import { defaultFragmentShader, defaultJavaScript, defaultVertexShader } from "@/lib/examples"

interface OGLEditorProps {
  initialVertexShader?: string
  initialFragmentShader?: string
  initialJavaScript?: string
}



export function OGLEditor({ 
  initialVertexShader = defaultVertexShader,
  initialFragmentShader = defaultFragmentShader,
  initialJavaScript = defaultJavaScript
}: OGLEditorProps) {
  const [vertexShader, setVertexShader] = useState(initialVertexShader)
  const [fragmentShader, setFragmentShader] = useState(initialFragmentShader)
  const [jsCode, setJsCode] = useState(initialJavaScript)
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState("vertex")
  const [showExamples, setShowExamples] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const examplesRef = useRef<HTMLDivElement>(null)

  // Monaco Editor configuration for GLSL
  useEffect(() => {
    import('monaco-editor').then((monaco) => {
      // Register GLSL language
      monaco.languages.register({ id: 'glsl' });
      
      // Define GLSL syntax highlighting
      monaco.languages.setMonarchTokensProvider('glsl', {
        tokenizer: {
          root: [
            [/\b(attribute|uniform|varying|precision|in|out|inout)\b/, 'keyword.declaration'],
            [/\b(void|float|int|bool|vec2|vec3|vec4|mat2|mat3|mat4|sampler2D|samplerCube)\b/, 'keyword.type'],
            [/\b(if|else|for|while|do|break|continue|return|discard)\b/, 'keyword.control'],
            [/\b(gl_Position|gl_FragColor|gl_FragCoord|gl_PointSize)\b/, 'keyword.builtin'],
            [/\b(sin|cos|tan|asin|acos|atan|pow|exp|log|exp2|log2|sqrt|inversesqrt|abs|sign|floor|ceil|fract|mod|min|max|clamp|mix|step|smoothstep|length|distance|dot|cross|normalize|reflect|refract)\b/, 'support.function'],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment'],
            [/"[^"]*"/, 'string'],
            [/\d*\.\d+([eE][\-+]?\d+)?[fFdD]?/, 'number.float'],
            [/\d+[eE][\-+]?\d+[fFdD]?/, 'number.float'],
            [/\d+[fFdD]/, 'number.float'],
            [/\d+/, 'number'],
            [/[;,.]/, 'delimiter'],
            [/[{}()\[\]]/, '@brackets'],
            [/[<>](?!@symbols)/, '@brackets'],
            [/[+\-*\/&|^~<>!?:=]/, 'operator'],
            [/@symbols/, 'operator'],
            [/[a-zA-Z_]\w*/, 'identifier'],
          ],
          comment: [
            [/[^\/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[\/*]/, 'comment']
          ]
        },
        symbols: /[=><!~?:&|+\-*\/\^%]+/
      });
       
      // Add hover information for GLSL
      monaco.languages.registerHoverProvider('glsl', {
        provideHover: (model, position) => {
          const word = model.getWordAtPosition(position);
          if (!word) return;
          
          const hoverInfo: { [key: string]: { value: string; isTrusted?: boolean } } = {
            'gl_Position': {
              value: '**gl_Position** (vec4)\n\nBuilt-in vertex shader output variable. Contains the transformed vertex position in clip coordinates.',
              isTrusted: true
            },
            'gl_FragColor': {
              value: '**gl_FragColor** (vec4)\n\nBuilt-in fragment shader output variable. Contains the final color of the fragment.',
              isTrusted: true
            },
            'gl_FragCoord': {
              value: '**gl_FragCoord** (vec4)\n\nBuilt-in fragment shader input variable. Contains the window-relative coordinates of the current fragment.',
              isTrusted: true
            },
            'sin': {
              value: '**sin**(x: float) -> float\n\nReturns the sine of x in radians.\n\n```glsl\nfloat result = sin(3.14159 / 2.0); // returns 1.0\n```',
              isTrusted: true
            },
            'cos': {
              value: '**cos**(x: float) -> float\n\nReturns the cosine of x in radians.\n\n```glsl\nfloat result = cos(0.0); // returns 1.0\n```',
              isTrusted: true
            },
            'normalize': {
              value: '**normalize**(v: vec) -> vec\n\nReturns a vector with the same direction as v but with length 1.0.\n\n```glsl\nvec3 normal = normalize(vec3(1.0, 2.0, 3.0));\n```',
              isTrusted: true
            },
            'mix': {
              value: '**mix**(x: T, y: T, a: float) -> T\n\nLinear interpolation: x * (1 - a) + y * a\n\n```glsl\nvec3 color = mix(red, blue, 0.5); // 50% red, 50% blue\n```',
              isTrusted: true
            }
          };
          
          const info = hoverInfo[word.word];
          if (info) {
            return {
              range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
              contents: [{ value: info.value, isTrusted: info.isTrusted }]
            };
          }
        }
      });
      
      // Add signature help for GLSL functions
      monaco.languages.registerSignatureHelpProvider('glsl', {
        signatureHelpTriggerCharacters: ['(', ','],
        provideSignatureHelp: (model, position) => {
          const line = model.getLineContent(position.lineNumber);
          const beforeCursor = line.substring(0, position.column - 1);
          
          // Simple function detection
          const functionMatch = beforeCursor.match(/(\w+)\s*\(\s*([^)]*)?$/);
          if (functionMatch) {
            const functionName = functionMatch[1];
            
            const signatures: { [key: string]: any } = {
              'mix': {
                label: 'mix(x: T, y: T, a: float) -> T',
                documentation: 'Linear interpolation between x and y based on a',
                parameters: [
                  { label: 'x', documentation: 'First value' },
                  { label: 'y', documentation: 'Second value' },
                  { label: 'a', documentation: 'Interpolation factor (0.0 to 1.0)' }
                ]
              },
              'smoothstep': {
                label: 'smoothstep(edge0: float, edge1: float, x: float) -> float',
                documentation: 'Smooth Hermite interpolation',
                parameters: [
                  { label: 'edge0', documentation: 'Lower edge' },
                  { label: 'edge1', documentation: 'Upper edge' },
                  { label: 'x', documentation: 'Value to interpolate' }
                ]
              },
              'vec3': {
                label: 'vec3(x: float, y: float, z: float) -> vec3',
                documentation: 'Create a 3-component vector',
                parameters: [
                  { label: 'x', documentation: 'X component' },
                  { label: 'y', documentation: 'Y component' },
                  { label: 'z', documentation: 'Z component' }
                ]
              },
              'vec4': {
                label: 'vec4(x: float, y: float, z: float, w: float) -> vec4',
                documentation: 'Create a 4-component vector',
                parameters: [
                  { label: 'x', documentation: 'X component' },
                  { label: 'y', documentation: 'Y component' },
                  { label: 'z', documentation: 'Z component' },
                  { label: 'w', documentation: 'W component' }
                ]
              }
            };
            
            const sig = signatures[functionName];
            if (sig) {
              return {
                value: {
                  signatures: [sig],
                  activeSignature: 0,
                  activeParameter: 0
                },
                dispose: () => {}
              };
            }
          }
        }
      });
      
      // Add basic GLSL validation
      monaco.languages.registerCodeActionProvider('glsl', {
        provideCodeActions: (model, _range, context) => {
          const actions: any[] = [];
          
          // Add quick fixes for common GLSL issues
          context.markers.forEach(marker => {
            if (marker.message.includes('undefined')) {
              actions.push({
                title: 'Add variable declaration',
                kind: 'quickfix',
                edit: {
                  edits: [{
                    resource: model.uri,
                    edit: {
                      range: new monaco.Range(marker.startLineNumber, 1, marker.startLineNumber, 1),
                      text: 'float variable_name;\n'
                    }
                  }]
                }
              });
            }
          });
          
          return {
            actions,
            dispose: () => {}
          };
        }
      });
      
      // Add hover information for GLSL
      monaco.languages.registerHoverProvider('glsl', {
        provideHover: (model, position) => {
          const word = model.getWordAtPosition(position);
          if (!word) return;
          
          const hoverInfo: { [key: string]: { value: string; isTrusted?: boolean } } = {
            'gl_Position': {
              value: '**gl_Position** (vec4)\n\nBuilt-in vertex shader output variable. Contains the transformed vertex position in clip coordinates.',
              isTrusted: true
            },
            'gl_FragColor': {
              value: '**gl_FragColor** (vec4)\n\nBuilt-in fragment shader output variable. Contains the final color of the fragment.',
              isTrusted: true
            },
            'gl_FragCoord': {
              value: '**gl_FragCoord** (vec4)\n\nBuilt-in fragment shader input variable. Contains the window-relative coordinates of the current fragment.',
              isTrusted: true
            },
            'sin': {
              value: '**sin**(x: float) -> float\n\nReturns the sine of x in radians.\n\n```glsl\nfloat result = sin(3.14159 / 2.0); // returns 1.0\n```',
              isTrusted: true
            },
            'cos': {
              value: '**cos**(x: float) -> float\n\nReturns the cosine of x in radians.\n\n```glsl\nfloat result = cos(0.0); // returns 1.0\n```',
              isTrusted: true
            },
            'normalize': {
              value: '**normalize**(v: vec) -> vec\n\nReturns a vector with the same direction as v but with length 1.0.\n\n```glsl\nvec3 normal = normalize(vec3(1.0, 2.0, 3.0));\n```',
              isTrusted: true
            },
            'mix': {
              value: '**mix**(x: T, y: T, a: float) -> T\n\nLinear interpolation: x * (1 - a) + y * a\n\n```glsl\nvec3 color = mix(red, blue, 0.5); // 50% red, 50% blue\n```',
              isTrusted: true
            }
          };
          
          const info = hoverInfo[word.word];
          if (info) {
            return {
              range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
              contents: [{ value: info.value, isTrusted: info.isTrusted }]
            };
          }
        }
      });
    });
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (typeof window !== 'undefined' && (window as any).cleanupShader) {
        try {
          (window as any).cleanupShader();
        } catch (e) {
          console.warn('Error during component unmount cleanup:', e);
        }
      }
    };
  }, []);

  // Click outside to close examples dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (examplesRef.current && !examplesRef.current.contains(event.target as Node)) {
        setShowExamples(false);
      }
    }

    if (showExamples) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showExamples]);

  const runShader = () => {
    if (!canvasRef.current) return;
    
    // First stop any existing shader
    if (isRunning) {
      stopShader();
    }
    
    setIsRunning(true);
    
    try {
      // Remove any existing shader script first
      const existingScript = document.getElementById('shader-script');
      if (existingScript && existingScript.parentNode) {
        try {
          existingScript.parentNode.removeChild(existingScript);
        } catch (e) {
          console.warn('Could not remove existing script:', e);
        }
      }
      
      // Clear any existing WebGL context
      const canvas = canvasRef.current;
      const gl = canvas.getContext('webgl') as WebGLRenderingContext || 
                canvas.getContext('experimental-webgl') as WebGLRenderingContext;
      if (gl) {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }
      
      // Create a new script element and execute the JavaScript code
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = 'shader-script';
      
      // Inject shaders into the JavaScript code
      const escapedVertexShader = vertexShader
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$');
        
      const escapedFragmentShader = fragmentShader
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$');
      
      const codeWithShaders = jsCode
        .replace(/\$\{vertexShader\}/g, escapedVertexShader)
        .replace(/\$\{fragmentShader\}/g, escapedFragmentShader);
      
      script.textContent = codeWithShaders;
      document.head.appendChild(script);
      
    } catch (error) {
      console.error('Error running shader:', error);
      setIsRunning(false);
    }
  };

  const stopShader = () => {
    setIsRunning(false);
    
    // Call cleanup function if it exists
    if (typeof window !== 'undefined' && (window as any).cleanupShader) {
      try {
        (window as any).cleanupShader();
      } catch (e) {
        console.warn('Error during shader cleanup:', e);
      }
    }
    
    // Cancel any animation frames
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    
    // Remove shader script
    const existingScript = document.getElementById('shader-script');
    if (existingScript && existingScript.parentNode) {
      try {
        existingScript.parentNode.removeChild(existingScript);
      } catch (e) {
        console.warn('Could not remove shader script:', e);
      }
    }
    
    // Clear canvas
    if (canvasRef.current) {
      try {
        const gl = canvasRef.current.getContext('webgl') as WebGLRenderingContext ||
                  canvasRef.current.getContext('experimental-webgl') as WebGLRenderingContext;
        if (gl) {
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      } catch (e) {
        console.warn('Could not clear WebGL context:', e);
      }
    }
  };

  const resetCode = () => {
    setVertexShader(defaultVertexShader);
    setFragmentShader(defaultFragmentShader);
    setJsCode(defaultJavaScript);
  };

  const exportCode = () => {
    const exportData = {
      vertexShader,
      fragmentShader,
      jsCode,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ogl-shader-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCode = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            setVertexShader(data.vertexShader || defaultVertexShader);
            setFragmentShader(data.fragmentShader || defaultFragmentShader);
            setJsCode(data.jsCode || defaultJavaScript);
          } catch (error) {
            console.error('Error importing file:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const loadExample = (exampleName: keyof typeof shaderExamples) => {
    try {
      const example = shaderExamples[exampleName];
      setVertexShader(example.vertex);
      setFragmentShader(example.fragment);
      setShowExamples(false); // Close dropdown after loading
    } catch (error) {
      console.error('Error loading example:', error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Editor Panel */}
      <div className="flex-1 flex flex-col border-r">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 border-b bg-card">
          <div className="flex items-center gap-2">
            <Button
              onClick={isRunning ? stopShader : runShader}
              variant={isRunning ? "destructive" : "default"}
              size="sm"
            >
              {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? "Stop" : "Run"}
            </Button>
            <Button onClick={resetCode} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
            
            <div className="relative" ref={examplesRef}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowExamples(!showExamples)}
              >
                <BookOpen className="w-4 h-4" />
                Examples
              </Button>
              
              {showExamples && (
                <div className="absolute top-full left-0 mt-1 bg-card border rounded-lg shadow-lg min-w-[200px] z-50">
                  <div className="p-2 border-b">
                    <h3 className="text-sm font-medium">Shader Examples</h3>
                  </div>
                  <div className="p-1">
                    <button 
                      onClick={() => loadExample('basic')} 
                      className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground"
                    >
                      Basic Animated Gradient
                    </button>
                    <button 
                      onClick={() => loadExample('raymarching')} 
                      className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground"
                    >
                      3D Raymarching Scene
                    </button>
                    <button 
                      onClick={() => loadExample('fractal')} 
                      className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground"
                    >
                      Julia Set Fractal
                    </button>
                    <button 
                      onClick={() => loadExample('noise')} 
                      className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground"
                    >
                      Fractal Noise Clouds
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={importCode} variant="outline" size="sm">
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button onClick={exportCode} variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Code Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="m-2">
            <TabsTrigger value="vertex">Vertex Shader</TabsTrigger>
            <TabsTrigger value="fragment">Fragment Shader</TabsTrigger>
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vertex" className="flex-1 m-0">
            <Editor
              height="100%"
              defaultLanguage="glsl"
              value={vertexShader}
              onChange={(value) => setVertexShader(value || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: "on",
                // IntelliSense enhancements
                suggestOnTriggerCharacters: true,
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: false
                },
                parameterHints: {
                  enabled: true,
                  cycle: true
                },
                hover: {
                  enabled: true,
                  delay: 300
                },
                acceptSuggestionOnCommitCharacter: true,
                acceptSuggestionOnEnter: "on",
                snippetSuggestions: "top",
                wordBasedSuggestions: "off",
                // Enhanced editing features
                bracketPairColorization: {
                  enabled: true
                },
                guides: {
                  bracketPairs: true,
                  indentation: true
                },
                matchBrackets: "always",
                autoIndent: "full",
                formatOnPaste: true,
                formatOnType: true
              }}
            />
          </TabsContent>
          
          <TabsContent value="fragment" className="flex-1 m-0">
            <Editor
              height="100%"
              defaultLanguage="glsl"
              value={fragmentShader}
              onChange={(value) => setFragmentShader(value || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: "on",
                // IntelliSense enhancements
                suggestOnTriggerCharacters: true,
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: false
                },
                parameterHints: {
                  enabled: true,
                  cycle: true
                },
                hover: {
                  enabled: true,
                  delay: 300
                },
                acceptSuggestionOnCommitCharacter: true,
                acceptSuggestionOnEnter: "on",
                snippetSuggestions: "top",
                wordBasedSuggestions: "off",
                // Enhanced editing features
                bracketPairColorization: {
                  enabled: true
                },
                guides: {
                  bracketPairs: true,
                  indentation: true
                },
                matchBrackets: "always",
                autoIndent: "full",
                formatOnPaste: true,
                formatOnType: true
              }}
            />
          </TabsContent>
          
          <TabsContent value="javascript" className="flex-1 m-0">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={jsCode}
              onChange={(value) => setJsCode(value || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: "on",
                // JavaScript-specific IntelliSense
                suggestOnTriggerCharacters: true,
                quickSuggestions: {
                  other: true,
                  comments: true,
                  strings: true
                },
                parameterHints: {
                  enabled: true,
                  cycle: true
                },
                hover: {
                  enabled: true,
                  delay: 300
                },
                acceptSuggestionOnCommitCharacter: true,
                acceptSuggestionOnEnter: "on",
                snippetSuggestions: "top",
                wordBasedSuggestions: "currentDocument",
                // Enhanced editing features
                bracketPairColorization: {
                  enabled: true
                },
                guides: {
                  bracketPairs: true,
                  indentation: true
                },
                matchBrackets: "always",
                autoIndent: "full",
                formatOnPaste: true,
                formatOnType: true,
                // JavaScript specific
                suggest: {
                  snippetsPreventQuickSuggestions: false
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 flex flex-col bg-black">
        <div className="p-2 border-b bg-card">
          <h3 className="text-sm font-medium">Preview</h3>
        </div>
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            id="glCanvas"
            className="w-full h-full"
            style={{ display: 'block' }}
          />
          {!isRunning && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Click "Run" to preview your shader</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}