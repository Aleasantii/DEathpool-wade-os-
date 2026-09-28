import React from 'react';
import { DeadpoolAssistant } from './components/chat/DeadpoolAssistant';

export const App: React.FC = () => {
  return (
    <div className="w-screen h-screen overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <DeadpoolAssistant />
    </div>
  );
};

export default App;
