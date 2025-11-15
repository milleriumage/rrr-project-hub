
import React from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
}

const Notification: React.FC<NotificationProps> = ({ message, type }) => {
  const baseClasses = 'fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl text-white font-medium flex items-center gap-3 animate-fade-in backdrop-blur-sm border max-w-md';
  const typeClasses = {
    success: 'bg-accent-green/90 border-accent-green',
    error: 'bg-accent-red/90 border-accent-red',
  };

  const Icon = () => {
    if (type === 'success') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <Icon />
      <span className="flex-1 text-sm leading-relaxed">{message}</span>
    </div>
  );
};

export default Notification;
