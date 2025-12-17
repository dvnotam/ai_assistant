import { useState } from 'react';
import { ChatContainer } from './components/ChatContainer';
import { MCPToolsPanel } from './components/MCPToolsPanel';
import { GitHubDemo } from './components/GitHubDemo';
import './App.css';

type ViewType = 'chat' | 'mcp' | 'github';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('chat');

  return (
    <div className="app-container">
      {currentView === 'mcp' && (
        <MCPToolsPanel onBack={() => setCurrentView('chat')} />
      )}
      {currentView === 'github' && (
        <GitHubDemo onBack={() => setCurrentView('chat')} />
      )}
      {currentView === 'chat' && (
        <ChatContainer
          onShowMCPTools={() => setCurrentView('mcp')}
          onShowGitHubDemo={() => setCurrentView('github')}
        />
      )}
    </div>
  );
}

export default App;
