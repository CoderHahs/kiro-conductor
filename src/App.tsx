import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [backendUrl, setBackendUrl] = useState<string>('Loading...');

  useEffect(() => {
    async function fetchUrl() {
      if (window.electron && window.electron.getBackendUrl) {
        try {
          const url = await window.electron.getBackendUrl();
          setBackendUrl(url);
        } catch (error) {
          console.error('Failed to get backend URL', error);
          setBackendUrl('Error');
        }
      } else {
        setBackendUrl('Not in Electron');
      }
    }

    fetchUrl();
  }, []);

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-blue-500 mb-4">Hello World</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        Backend URL: {backendUrl}
      </p>
    </div>
  );
};

export default App;
