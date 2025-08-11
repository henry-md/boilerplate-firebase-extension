import React, { useState } from 'react';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [toggleState, setToggleState] = useState(false);

  return (
    <div className="p-4 w-80">
      <button onClick={onBack} className="mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold">Settings</h2>

        {/* Example Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm">
          <span className="text-gray-800 font-medium">Example Feature</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={toggleState} 
              onChange={() => setToggleState(!toggleState)} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;