import React from 'react';
import { Handle, Position } from 'reactflow';

const ServiceNode = ({ data, selected }) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 shadow-lg min-w-[160px]
        transition-all duration-200
        ${selected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'}
        ${getNodeColor(data.type)}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500"
      />
      
      <div className="flex flex-col items-center">
        <div className="text-3xl mb-2">{data.icon}</div>
        <div className="text-sm font-semibold text-gray-800 text-center">
          {data.label}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {data.type}
        </div>
        {data.config?.port && (
          <div className="text-xs text-blue-600 font-medium mt-1">
            :{data.config.port}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-green-500"
      />
    </div>
  );
};

function getNodeColor(type) {
  const colors = {
    react: 'bg-blue-50',
    vue: 'bg-green-50',
    angular: 'bg-red-50',
    node: 'bg-green-50',
    'python-flask': 'bg-gray-50',
    'python-fastapi': 'bg-teal-50',
    mongodb: 'bg-green-50',
    postgresql: 'bg-blue-50',
    mysql: 'bg-blue-50',
    redis: 'bg-red-50',
    pyspark: 'bg-yellow-50',
  };
  return colors[type] || 'bg-white';
}

export default ServiceNode;
