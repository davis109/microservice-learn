import React from 'react';

const SERVICES = [
  {
    category: 'Frontend',
    items: [
      { type: 'react', name: 'React', icon: '⚛️', color: 'bg-blue-100 border-blue-300' },
      { type: 'vue', name: 'Vue.js', icon: '💚', color: 'bg-green-100 border-green-300' },
      { type: 'angular', name: 'Angular', icon: '🅰️', color: 'bg-red-100 border-red-300' },
    ],
  },
  {
    category: 'Backend',
    items: [
      { type: 'node', name: 'Node.js', icon: '🟢', color: 'bg-green-100 border-green-400' },
      { type: 'python-flask', name: 'Flask', icon: '🐍', color: 'bg-gray-100 border-gray-400' },
      { type: 'python-fastapi', name: 'FastAPI', icon: '⚡', color: 'bg-teal-100 border-teal-400' },
    ],
  },
  {
    category: 'Database',
    items: [
      { type: 'mongodb', name: 'MongoDB', icon: '🍃', color: 'bg-green-100 border-green-500' },
      { type: 'postgresql', name: 'PostgreSQL', icon: '🐘', color: 'bg-blue-100 border-blue-400' },
      { type: 'mysql', name: 'MySQL', icon: '🐬', color: 'bg-blue-100 border-blue-500' },
    ],
  },
  {
    category: 'Cache & Others',
    items: [
      { type: 'redis', name: 'Redis', icon: '🔴', color: 'bg-red-100 border-red-400' },
      { type: 'pyspark', name: 'PySpark', icon: '✨', color: 'bg-yellow-100 border-yellow-400' },
    ],
  },
];

const ServicePalette = ({ onAddService }) => {
  const handleDragStart = (event, service) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(service));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = (service) => {
    onAddService(service.type, service.name);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Service Palette</h2>
      <p className="text-xs text-gray-500 mb-4">
        Drag & drop or click to add services
      </p>

      {SERVICES.map((category) => (
        <div key={category.category} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            {category.category}
          </h3>
          <div className="space-y-2">
            {category.items.map((service) => (
              <div
                key={service.type}
                draggable
                onDragStart={(e) => handleDragStart(e, service)}
                onClick={() => handleClick(service)}
                className={`
                  ${service.color}
                  border-2 rounded-lg p-3 cursor-move
                  hover:shadow-md transition-all duration-200
                  active:scale-95
                `}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{service.icon}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {service.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServicePalette;
