import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';

const ConfigPanel = () => {
  const { selectedNode, updateNodeConfig, updateNodeLabel, removeNode } = useCanvasStore();
  const [label, setLabel] = useState(selectedNode?.data.label || '');
  const [port, setPort] = useState(selectedNode?.data.config.port || '');
  const [envVars, setEnvVars] = useState(
    selectedNode?.data.config.environment 
      ? Object.entries(selectedNode.data.config.environment).map(([key, value]) => ({ key, value }))
      : []
  );

  React.useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label);
      setPort(selectedNode.data.config.port || '');
      setEnvVars(
        selectedNode.data.config.environment
          ? Object.entries(selectedNode.data.config.environment).map(([key, value]) => ({ key, value }))
          : []
      );
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="text-center text-gray-400 mt-20">
          <div className="text-4xl mb-2">⚙️</div>
          <p className="text-sm">Select a service to configure</p>
        </div>
      </div>
    );
  }

  const handleLabelChange = (newLabel) => {
    setLabel(newLabel);
    updateNodeLabel(selectedNode.id, newLabel);
  };

  const handlePortChange = (newPort) => {
    setPort(newPort);
    updateNodeConfig(selectedNode.id, { port: parseInt(newPort) || 0 });
  };

  const handleEnvChange = (index, field, value) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);
    
    const envObject = {};
    newEnvVars.forEach(({ key, value }) => {
      if (key) envObject[key] = value;
    });
    updateNodeConfig(selectedNode.id, { environment: envObject });
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const removeEnvVar = (index) => {
    const newEnvVars = envVars.filter((_, i) => i !== index);
    setEnvVars(newEnvVars);
    
    const envObject = {};
    newEnvVars.forEach(({ key, value }) => {
      if (key) envObject[key] = value;
    });
    updateNodeConfig(selectedNode.id, { environment: envObject });
  };

  const handleDelete = () => {
    if (window.confirm(`Delete ${selectedNode.data.label}?`)) {
      removeNode(selectedNode.id);
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Service Config</h2>
          <span className="text-3xl">{selectedNode.data.icon}</span>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Name
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="My Service"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600">
            {selectedNode.data.type}
          </div>
        </div>

        {!['mongodb', 'postgresql', 'mysql', 'redis'].includes(selectedNode.data.type) && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Port
            </label>
            <input
              type="number"
              value={port}
              onChange={(e) => handlePortChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3000"
            />
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Environment Variables
            </label>
            <button
              onClick={addEnvVar}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add
            </button>
          </div>
          
          <div className="space-y-2">
            {envVars.map((env, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={env.key}
                  onChange={(e) => handleEnvChange(index, 'key', e.target.value)}
                  placeholder="KEY"
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={env.value}
                  onChange={(e) => handleEnvChange(index, 'value', e.target.value)}
                  placeholder="value"
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeEnvVar(index)}
                  className="text-red-500 hover:text-red-700 px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          {envVars.length === 0 && (
            <p className="text-xs text-gray-400 mt-2">No environment variables</p>
          )}
        </div>

        <button
          onClick={handleDelete}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition mt-6"
        >
          Delete Service
        </button>
      </div>
    </div>
  );
};

export default ConfigPanel;
