import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  applyEdgeChanges, 
  applyNodeChanges,
  addEdge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import mermaid from 'mermaid';

// Code Editor
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme

import { StartEndNode, ProcessNode, IONode, DecisionNode } from '../CustomNodes';
import { parseCodeToFlow } from '../FlowParser';

const nodeTypes = {
  startEnd: StartEndNode,
  process: ProcessNode,
  io: IONode,
  decision: DecisionNode,
};

const defaultCode = `// Tu algoritmo aquí
let edad = 18;

if (edad >= 18) {
  console.log("Es mayor");
} else {
  console.log("Es menor");
}

console.log("Fin");`;

const DiagramGenerator = () => {
  const [code, setCode] = useState(defaultCode);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [showMermaid, setShowMermaid] = useState(true);
  const [mermaidSvg, setMermaidSvg] = useState('');
  const mermaidContainerRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      flowchart: { 
        curve: 'basis',
        padding: 20,
        nodeSpacing: 50,
        rankSpacing: 50,
        htmlLabels: true,
        useMaxWidth: false,
      },
      themeVariables: {
        primaryColor: '#ffffff',
        primaryTextColor: '#0f172a',
        primaryBorderColor: '#3b82f6',
        lineColor: '#64748b',
        secondaryColor: '#f8fafc',
        tertiaryColor: '#f1f5f9',
        fontFamily: '"Inter", system-ui, sans-serif',
        fontSize: '14px',
      },
    });
  }, []);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const generateMermaidFromParse = (result) => {
    const { nodes: nds, edges: eds } = result;
    const idMap = {};
    nds.forEach((n, i) => {
      idMap[n.id] = `N${i}`;
    });

    const sanitize = (s = '') => {
      return String(s)
        .replace(/["'()]/g, '')
        .trim();
    };

    const nodeLines = nds.map((n, i) => {
      const id = idMap[n.id];
      const label = sanitize(n.data?.label || n.label || n.data?.text || n.id);
      
      let shapeStart = '[';
      let shapeEnd = ']';
      
      if (n.type === 'startEnd') {
        if (n.data?.isMerge) {
           return `${id}(( ))`; // Circle for merge
        }
        shapeStart = '(['; shapeEnd = '])'; // Stadium
      } else if (n.type === 'io') {
        shapeStart = '[/'; shapeEnd = '/]'; // Parallelogram
      } else if (n.type === 'decision') {
        shapeStart = '{'; shapeEnd = '}'; // Rhombus
      }

      // Add styling classes
      let styleClass = '';
      if (n.type === 'startEnd' && !n.data?.isMerge) styleClass = ':::startEnd';
      if (n.type === 'process') styleClass = ':::process';
      if (n.type === 'io') styleClass = ':::io';
      if (n.type === 'decision') styleClass = ':::decision';
      if (n.data?.isMerge) styleClass = ':::merge';

      return `${id}${shapeStart}"${label}"${shapeEnd}${styleClass}`;
    });

    const edgeLines = eds.map((e) => {
      const from = idMap[e.source];
      const to = idMap[e.target];
      let label = e.label || '';
      
      // Infer Yes/No from handles if available
      if (!label && (e.sourceHandle || e.targetHandle)) {
        const handle = e.sourceHandle || e.targetHandle;
        if (handle && handle.toLowerCase().includes('true')) label = 'Sí';
        if (handle && handle.toLowerCase().includes('false')) label = 'No';
      }
      
      return label ? `${from} -->|"${label}"| ${to}` : `${from} --> ${to}`;
    });

    return `
      flowchart TD
      %% Styles
      classDef startEnd fill:#10b981,stroke:#059669,stroke-width:2px,color:white,rx:10,ry:10;
      classDef process fill:white,stroke:#3b82f6,stroke-width:2px,color:#1e293b,rx:5,ry:5;
      classDef io fill:#fffbeb,stroke:#f59e0b,stroke-width:2px,color:#78350f,rx:0,ry:0;
      classDef decision fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#312e81,rx:5,ry:5;
      classDef merge fill:#64748b,stroke:none,width:10px,height:10px;

      %% Nodes
      ${nodeLines.join('\n      ')}
      
      %% Edges
      ${edgeLines.join('\n      ')}
    `;
  };

  const handleGenerate = async () => {
    console.log("handleGenerate called with code:", code);
    try {
      const result = parseCodeToFlow(code);
      setNodes([...result.nodes]);
      setEdges([...result.edges]);

      if (showMermaid) {
        const mermaidSrc = generateMermaidFromParse(result);
        console.log("Mermaid Source:", mermaidSrc);
        // Unique ID for each render to prevent caching issues
        const id = `mermaid-${Date.now()}`;
        try {
            const { svg } = await mermaid.render(id, mermaidSrc);
            setMermaidSvg(svg);
        } catch (err) {
            console.error("Mermaid render error:", err);
            // Fallback or error message could be set here
        }
      }
    } catch (error) {
      console.error("Error parsing code:", error);
    }
  };

  // Generate on mount and when mode changes
  useEffect(() => {
    handleGenerate();
  }, [showMermaid]);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row h-[calc(100vh-2rem)]">
      {/* Editor Panel */}
      <div className="w-full lg:w-1/3 h-1/2 lg:h-full flex flex-col border-r border-slate-700 bg-[#1e1e1e] shadow-2xl z-20">
        {/* Header */}
        <div className="h-12 flex items-center px-4 bg-[#252526] border-b border-slate-700">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
            <span className="text-yellow-400">JS</span>
            <span>script.js</span>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <Editor
            value={code}
            onValueChange={code => setCode(code)}
            highlight={code => highlight(code, languages.javascript)}
            padding={20}
            className="font-mono text-sm min-h-full"
            style={{
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: 14,
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
            }}
            textareaClassName="focus:outline-none"
          />
        </div>
        
        {/* Footer / Actions */}
        <div className="p-4 bg-[#252526] border-t border-slate-700">
          <button
            onClick={handleGenerate}
            className="w-full py-3 px-4 bg-primary hover:bg-primary/80 text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2 shadow-lg mb-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Generar Diagrama
          </button>
          
          <button
            onClick={() => setShowMermaid(!showMermaid)}
            className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-md transition-colors text-sm border border-slate-600"
          >
            {showMermaid ? 'Cambiar a Vista Interactiva' : 'Cambiar a Vista Estética (Mermaid)'}
          </button>

          <p className="text-xs text-slate-500 mt-3 text-center">
            Soporta: variables, if/else, while, console.log
          </p>
        </div>
      </div>

      {/* Diagram Panel */}
      <div className="w-full lg:w-2/3 h-1/2 lg:h-full relative bg-slate-50" style={{ minHeight: '500px' }}>
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
          {showMermaid ? (
             <div className="w-full h-full overflow-auto bg-slate-50 flex items-center justify-center p-8">
                {mermaidSvg ? (
                  <div 
                    className="mermaid-container shadow-2xl bg-white p-8 rounded-xl border border-slate-100"
                    dangerouslySetInnerHTML={{ __html: mermaidSvg }} 
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span>Generando visualización...</span>
                  </div>
                )}
             </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{
                type: 'smoothstep',
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#94a3b8',
                  width: 20,
                  height: 20,
                },
                style: { 
                  stroke: '#94a3b8', 
                  strokeWidth: 2,
                },
                animated: true,
              }}
              fitView
              attributionPosition="bottom-right"
              className="bg-slate-50"
            >
              <Background color="#e2e8f0" gap={20} size={2} variant="dots" />
              <Controls className="bg-white border-slate-200 shadow-xl text-slate-600 rounded-lg overflow-hidden" />
            </ReactFlow>
          )}
        </div>
        
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs font-medium text-slate-500 pointer-events-none select-none z-10">
          {showMermaid ? 'Vista Estética (Mermaid)' : 'Vista Interactiva (React Flow)'}
        </div>
      </div>
    </div>
  );
};

export default DiagramGenerator;
