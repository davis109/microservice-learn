import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ServicePalette from '../components/ServicePalette';
import ConfigPanel from '../components/ConfigPanel';
import ServiceNode from '../components/ServiceNode';
import { useCanvasStore } from '../store/canvasStore';
import { projectsAPI, generateAPI } from '../api/api';

const nodeTypes = {
  serviceNode: ServiceNode,
};

const Canvas = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);
  
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    addNode,
    setSelectedNode,
    getProjectData,
    loadProject,
    clearCanvas,
    projectName,
    projectDescription,
    setProjectName,
    setProjectDescription,
  } = useCanvasStore();

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(nodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(id || null);

  // Sync store with ReactFlow state
  useEffect(() => {
    setRfNodes(nodes);
  }, [nodes, setRfNodes]);

  useEffect(() => {
    setRfEdges(edges);
  }, [edges, setRfEdges]);

  // Load project if ID provided
  useEffect(() => {
    if (id) {
      loadProjectData(id);
    } else {
      clearCanvas();
    }
  }, [id]);

  const loadProjectData = async (projectId) => {
    try {
      const response = await projectsAPI.getById(projectId);
      loadProject(response.data.project);
      setCurrentProjectId(projectId);
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project');
    }
  };

  const onConnect = useCallback(
    (params) => {
      setRfEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds));
      setEdges(rfEdges);
    },
    [setRfEdges, setEdges, rfEdges]
  );

  const onNodeClick = useCallback(
    (event, node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const serviceData = JSON.parse(event.dataTransfer.getData('application/reactflow'));

      if (!serviceData) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `${serviceData.type}-${Date.now()}`,
        type: 'serviceNode',
        position,
        data: {
          id: `${serviceData.type}-${Date.now()}`,
          type: serviceData.type,
          label: serviceData.name,
          icon: serviceData.icon,
          config: {
            port: getDefaultPort(serviceData.type),
            environment: {},
            volumes: [],
          },
        },
      };

      setRfNodes((nds) => nds.concat(newNode));
      setNodes(rfNodes.concat(newNode));
    },
    [reactFlowInstance, setRfNodes, setNodes, rfNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleAddService = (type, name) => {
    addNode(type, name);
  };

  const handleSave = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      setShowProjectSettings(true);
      return;
    }

    setSaving(true);

    try {
      const projectData = getProjectData();

      if (currentProjectId) {
        await projectsAPI.update(currentProjectId, projectData);
        alert('Project saved successfully!');
      } else {
        const response = await projectsAPI.create(projectData);
        setCurrentProjectId(response.data.project._id);
        navigate(`/canvas/${response.data.project._id}`);
        alert('Project created successfully!');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      setShowProjectSettings(true);
      return;
    }

    if (rfNodes.length === 0) {
      alert('Please add at least one service to generate the project');
      return;
    }

    setGenerating(true);

    try {
      const projectData = getProjectData();
      
      const response = await generateAPI.generate({
        projectName: projectData.name,
        services: projectData.services,
        connections: projectData.connections,
        metadata: projectData.metadata || {},
        projectId: currentProjectId,
      });

      // Download the zip file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${projectData.name}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('🎉 Project generated successfully! Check your downloads folder.');
    } catch (error) {
      console.error('Generate error:', error);
      alert('Failed to generate project. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear the entire canvas? This cannot be undone.')) {
      clearCanvas();
      setRfNodes([]);
      setRfEdges([]);
      setCurrentProjectId(null);
      navigate('/canvas');
    }
  };

  // Sync ReactFlow changes back to store
  useEffect(() => {
    const timer = setTimeout(() => {
      setNodes(rfNodes);
    }, 100);
    return () => clearTimeout(timer);
  }, [rfNodes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEdges(rfEdges);
    }, 100);
    return () => clearTimeout(timer);
  }, [rfEdges]);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Service Palette */}
      <ServicePalette onAddService={handleAddService} />

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowProjectSettings(!showProjectSettings)}
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              📋 {projectName || 'Untitled Project'}
            </button>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-600">
              {rfNodes.length} services, {rfEdges.length} connections
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 hover:bg-gray-50 rounded-md transition"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : '💾 Save'}
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating || rfNodes.length === 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition disabled:opacity-50"
            >
              {generating ? '⚙️ Generating...' : '🚀 Generate Project'}
            </button>
          </div>
        </div>

        {/* Project Settings Modal */}
        {showProjectSettings && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
            <div className="max-w-2xl">
              <h3 className="font-semibold text-gray-800 mb-3">Project Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="My Awesome Project"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Brief description of your project..."
                  />
                </div>
                <button
                  onClick={() => setShowProjectSettings(false)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* React Flow Canvas */}
        <div ref={reactFlowWrapper} className="flex-1">
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Background color="#ddd" gap={16} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                return '#3b82f6';
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
            />
          </ReactFlow>
        </div>
      </div>

      {/* Config Panel */}
      <ConfigPanel />
    </div>
  );
};

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

export default Canvas;
