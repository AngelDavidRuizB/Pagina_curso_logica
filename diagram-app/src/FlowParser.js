import dagre from 'dagre';

const nodeWidth = 180;
const nodeHeight = 100;

export const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  try {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      let width = nodeWidth;
      let height = nodeHeight;
      if (node.type === 'decision') {
          width = 200; 
      }
      if (node.data && node.data.isMerge) {
          width = 20;
          height = 20;
      }
      dagreGraph.setNode(node.id, { width, height });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = 'top';
      node.sourcePosition = 'bottom';

      // Shift slightly to center
      node.position = {
        x: nodeWithPosition.x - (node.width || nodeWidth) / 2,
        y: nodeWithPosition.y - (node.height || nodeHeight) / 2,
      };
    });
  } catch (error) {
    console.error('Dagre layout error:', error);
    nodes.forEach((node, index) => {
      node.position = { x: 0, y: index * 150 };
    });
  }

  return { nodes, edges };
};

function tokenize(code) {
  const tokens = [];
  let current = '';
  let i = 0;
  
  const cleanCode = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  while (i < cleanCode.length) {
    const char = cleanCode[i];
    
    if (/\s/.test(char)) {
      if (current) tokens.push(current);
      current = '';
      i++;
      continue;
    }
    
    if ('{}();'.includes(char)) {
      if (current) tokens.push(current);
      tokens.push(char);
      current = '';
      i++;
      continue;
    }
    
    if (char === '"' || char === "'") {
        if (current) tokens.push(current);
        current = '';
        const quote = char;
        current += char;
        i++;
        while (i < cleanCode.length && cleanCode[i] !== quote) {
            if (cleanCode[i] === '\\') {
                current += cleanCode[i];
                i++;
            }
            current += cleanCode[i];
            i++;
        }
        if (i < cleanCode.length) {
            current += cleanCode[i];
            i++;
        }
        tokens.push(current);
        current = '';
        continue;
    }

    current += char;
    i++;
  }
  if (current) tokens.push(current);
  return tokens;
}

function parseAST(tokens) {
  const body = [];
  let i = 0;

  function walk() {
    if (i >= tokens.length) return null;
    const token = tokens[i];
    
    if (token === 'if') {
      i++; 
      let condition = '';
      if (tokens[i] === '(') {
        i++;
        let balance = 1;
        while (balance > 0 && i < tokens.length) {
          if (tokens[i] === '(') balance++;
          if (tokens[i] === ')') balance--;
          if (balance > 0) condition += tokens[i] + ' ';
          i++;
        }
      }
      
      const trueBlock = [];
      if (tokens[i] === '{') {
        i++;
        while (tokens[i] !== '}' && i < tokens.length) {
          const node = walk();
          if (node) trueBlock.push(node);
        }
        i++;
      }
      
      const falseBlock = [];
      if (tokens[i] === 'else') {
        i++;
        if (tokens[i] === '{') {
          i++;
          while (tokens[i] !== '}' && i < tokens.length) {
            const node = walk();
            if (node) falseBlock.push(node);
          }
          i++;
        } else if (tokens[i] === 'if') {
             const node = walk();
             if (node) falseBlock.push(node);
        }
      }
      
      return { type: 'if', condition: condition.trim(), trueBlock, falseBlock };
    }
    
    if (token === 'for') {
      i++; 
      if (tokens[i] === '(') {
        i++;
        
        let part1 = '';
        while (i < tokens.length && tokens[i] !== ';' && tokens[i] !== ')') {
            part1 += tokens[i] + ' ';
            i++;
        }

        if (tokens[i] === ')') {
            // for (let x of y) or for (let x in y)
            i++; // skip )
            const body = [];
            if (tokens[i] === '{') {
                i++;
                while (tokens[i] !== '}' && i < tokens.length) {
                    const node = walk();
                    if (node) body.push(node);
                }
                i++;
            }
            return { type: 'for-each', condition: part1.trim(), body };
        }
        
        // Standard for loop
        let init = part1;
        if (tokens[i] === ';') i++;

        let condition = '';
        while (i < tokens.length && tokens[i] !== ';') {
            condition += tokens[i] + ' ';
            i++;
        }
        if (tokens[i] === ';') i++;

        let update = '';
        while (i < tokens.length && tokens[i] !== ')') {
            update += tokens[i] + ' ';
            i++;
        }
        if (tokens[i] === ')') i++;

        const body = [];
        if (tokens[i] === '{') {
            i++;
            while (tokens[i] !== '}' && i < tokens.length) {
                const node = walk();
                if (node) body.push(node);
            }
            i++;
        }
        return { type: 'for', init: init.trim(), condition: condition.trim(), update: update.trim(), body };
      }
    }

    if (token === 'while') {
      i++;
      let condition = '';
      if (tokens[i] === '(') {
        i++;
        let balance = 1;
        while (balance > 0 && i < tokens.length) {
          if (tokens[i] === '(') balance++;
          if (tokens[i] === ')') balance--;
          if (balance > 0) condition += tokens[i] + ' ';
          i++;
        }
      }
      
      const body = [];
      if (tokens[i] === '{') {
        i++;
        while (tokens[i] !== '}' && i < tokens.length) {
          const node = walk();
          if (node) body.push(node);
        }
        i++;
      }
      return { type: 'while', condition: condition.trim(), body };
    }
    
    if (token === '}' || token === '{') {
        i++;
        return null;
    }

    let statement = '';
    while (i < tokens.length && tokens[i] !== ';' && tokens[i] !== '{' && tokens[i] !== '}') {
       if (tokens[i] === 'if' || tokens[i] === 'while' || tokens[i] === 'else') {
           break;
       }
       statement += tokens[i] + ' ';
       i++;
    }
    if (tokens[i] === ';') {
        i++;
    }
    
    if (!statement.trim()) {
        return null;
    }

    return { type: 'statement', content: statement.trim() };
  }

  while (i < tokens.length) {
    const node = walk();
    if (node) body.push(node);
  }
  
  return body;
}

class FlowBuilder {
  constructor() {
    this.nodes = [];
    this.edges = [];
    this.idCounter = 0;
  }

  getId() {
    return 'node_' + this.idCounter++;
  }

  addNode(type, label, isMerge = false) {
    const id = this.getId();
    const node = {
      id,
      type,
      data: { label, isMerge },
      position: { x: 0, y: 0 }
    };
    if (isMerge) {
        node.style = { width: 20, height: 20, borderRadius: '50%', backgroundColor: '#333', opacity: 0.5 };
        node.data.label = '';
    }
    this.nodes.push(node);
    return id;
  }

  addEdge(source, target, label = null, sourceHandle = null) {
    const id = `e_${source}_${target}_${this.idCounter++}`;
    const edge = {
      id,
      source,
      target,
      type: 'smoothstep',
      animated: true,
    };
    if (label) edge.label = label;
    if (sourceHandle) edge.sourceHandle = sourceHandle;
    this.edges.push(edge);
  }

  processAST(ast, parentId, initialLabel = null, initialSourceHandle = null) {
    let currentId = parentId;
    let nextLabel = initialLabel;
    let nextSourceHandle = initialSourceHandle;

    for (const node of ast) {
      if (node.type === 'statement') {
        let type = 'process';
        let label = node.content;
        
        if (label.match(/^(console\.log|alert|prompt)\s*\(/)) {
            type = 'io';
            const match = label.match(/\((.*)\)/);
            if (match) label = match[1];
        } else if (label.match(/^(let|const|var)\s/)) {
            type = 'process';
        }

        const id = this.addNode(type, label);
        this.addEdge(currentId, id, nextLabel, nextSourceHandle);
        
        currentId = id;
        nextLabel = null;
        nextSourceHandle = null;
      } else if (node.type === 'if') {
        const decisionId = this.addNode('decision', node.condition);
        this.addEdge(currentId, decisionId, nextLabel, nextSourceHandle);
        nextLabel = null;
        nextSourceHandle = null;

        const mergeId = this.addNode('startEnd', '', true); 

        const trueResult = this.processAST(node.trueBlock, decisionId, 'Sí', 'true');
        this.addEdge(trueResult.id, mergeId, trueResult.nextLabel, trueResult.nextSourceHandle);

        if (node.falseBlock && node.falseBlock.length > 0) {
            const falseResult = this.processAST(node.falseBlock, decisionId, 'No', 'false');
            this.addEdge(falseResult.id, mergeId, falseResult.nextLabel, falseResult.nextSourceHandle);
        } else {
            this.addEdge(decisionId, mergeId, 'No', 'false');
        }

        currentId = mergeId;
      } else if (node.type === 'while') {
        const decisionId = this.addNode('decision', node.condition);
        this.addEdge(currentId, decisionId, nextLabel, nextSourceHandle);
        nextLabel = null;
        nextSourceHandle = null;

        const bodyResult = this.processAST(node.body, decisionId, 'Sí', 'true');
        this.addEdge(bodyResult.id, decisionId, bodyResult.nextLabel, bodyResult.nextSourceHandle);

        currentId = decisionId;
        nextLabel = 'No';
        nextSourceHandle = 'false';
      } else if (node.type === 'for') {
        // 1. Init
        const initId = this.addNode('process', node.init);
        this.addEdge(currentId, initId, nextLabel, nextSourceHandle);
        
        // 2. Condition
        const decisionId = this.addNode('decision', node.condition);
        this.addEdge(initId, decisionId);

        // 3. Body (True path)
        const bodyResult = this.processAST(node.body, decisionId, 'Sí', 'true');
        
        // 4. Update
        const updateId = this.addNode('process', node.update);
        this.addEdge(bodyResult.id, updateId, bodyResult.nextLabel, bodyResult.nextSourceHandle);
        
        // 5. Loop back to Condition
        this.addEdge(updateId, decisionId);

        // 6. Continue (False path)
        currentId = decisionId;
        nextLabel = 'No';
        nextSourceHandle = 'false';
      } else if (node.type === 'for-each') {
         const decisionId = this.addNode('decision', node.condition);
         this.addEdge(currentId, decisionId, nextLabel, nextSourceHandle);
         
         const bodyResult = this.processAST(node.body, decisionId, 'Sí', 'true');
         this.addEdge(bodyResult.id, decisionId, bodyResult.nextLabel, bodyResult.nextSourceHandle);
         
         currentId = decisionId;
         nextLabel = 'No';
         nextSourceHandle = 'false';
      }
    }
    return { id: currentId, nextLabel, nextSourceHandle };
  }
}

export const parseCodeToFlow = (code) => {
  console.log("parseCodeToFlow started");
  const builder = new FlowBuilder();
  
  const startId = builder.addNode('startEnd', 'INICIO');
  
  if (!code) {
    return { nodes: builder.nodes, edges: builder.edges };
  }

  try {
      const tokens = tokenize(code);
      const ast = parseAST(tokens);
      console.log("AST:", ast);
      
      const result = builder.processAST(ast, startId);
      
      const endId = builder.addNode('startEnd', 'FIN');
      builder.addEdge(result.id, endId, result.nextLabel, result.nextSourceHandle);
      
  } catch (e) {
      console.error("Parsing error:", e);
  }

  return getLayoutedElements(builder.nodes, builder.edges);
};
