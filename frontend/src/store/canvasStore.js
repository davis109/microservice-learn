import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

const initialEdges = [];
const initialNodes = [];

export const useCanvasStore = create((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
  projectName: 'My Project',
  projectDescription: '',

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  addNode: (type, label, config = {}) => {
    const id = uuidv4();
    const newNode = {
      id,
      type: 'serviceNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        id,
        type,
        label,
        icon: getServiceIcon(type),
        config: {
          port: config.port || getDefaultPort(type),
          environment: config.environment || {},
          volumes: config.volumes || [],
          ...config,
        },
      },
    };

    set({ nodes: [...get().nodes, newNode] });
    return id;
  },

  removeNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
    });
  },

  updateNodeConfig: (nodeId, config) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config: { ...node.data.config, ...config } } }
          : node
      ),
    });
  },

  updateNodeLabel: (nodeId, label) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label } }
          : node
      ),
    });
  },

  addEdge: (source, target) => {
    const id = `edge-${source}-${target}`;
    const edgeExists = get().edges.some((e) => e.id === id);
    
    if (!edgeExists) {
      const newEdge = {
        id,
        source,
        target,
        type: 'smoothstep',
        animated: true,
      };
      set({ edges: [...get().edges, newEdge] });
    }
  },

  setSelectedNode: (node) => set({ selectedNode: node }),
  
  setProjectName: (name) => set({ projectName: name }),
  setProjectDescription: (description) => set({ projectDescription: description }),

  clearCanvas: () => set({
    nodes: [],
    edges: [],
    selectedNode: null,
  }),

  loadProject: (project) => {
    const nodes = project.services.map((service) => ({
      id: service.id,
      type: 'serviceNode',
      position: service.position || { x: Math.random() * 400, y: Math.random() * 300 },
      data: {
        id: service.id,
        type: service.type,
        label: service.label,
        icon: getServiceIcon(service.type),
        config: service.config || {},
      },
    }));

    const edges = (project.connections || []).map((conn) => ({
      id: conn.id,
      source: conn.source,
      target: conn.target,
      type: 'smoothstep',
      animated: true,
    }));

    set({
      nodes,
      edges,
      projectName: project.name,
      projectDescription: project.description || '',
    });
  },

  getProjectData: () => {
    const { nodes, edges, projectName, projectDescription } = get();
    
    return {
      name: projectName,
      description: projectDescription,
      services: nodes.map((node) => ({
        id: node.data.id,
        type: node.data.type,
        label: node.data.label,
        position: node.position,
        config: node.data.config,
      })),
      connections: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'default',
      })),
    };
  },
}));

function getServiceIcon(type) {
  const icons = {
    react: '⚛️',
    vue: '💚',
    angular: '🅰️',
    node: '🟢',
    'python-flask': '🐍',
    'python-fastapi': '⚡',
    mongodb: '🍃',
    postgresql: '🐘',
    mysql: '🐬',
    redis: '🔴',
    pyspark: '✨',
  };
  return icons[type] || '📦';
}

function getDefaultPort(type) {
  const ports = {
    react: 3000,
    vue: 8080,
    angular: 4200,
    node: 5000,
    'python-flask': 5000,
    'python-fastapi': 8000,
    mongodb: 27017,
    postgresql: 5432,
    mysql: 3306,
    redis: 6379,
    pyspark: 8080,
  };
  return ports[type] || 8080;
}
