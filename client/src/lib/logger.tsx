import React from 'react';

interface LoggerProps {
  message: string;
  level?: 'info' | 'warn' | 'error';
}

export const Logger: React.FC<LoggerProps> = ({ message, level = 'info' }) => {
  const getColor = () => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className={`p-2 rounded ${getColor()}`}>
      <span className="font-medium">[{level.toUpperCase()}]:</span> {message}
    </div>
  );
};

export default Logger;
