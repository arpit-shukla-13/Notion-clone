import React from 'react';

// This is the same loading spinner from the prototype
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
      </div>
    </div>
  );
}

export default LoadingSpinner;