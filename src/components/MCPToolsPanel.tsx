import { useState, useEffect } from 'react';
import { mcpService } from '../services/mcpService';
import type { MCPTool, KnowledgeGraph } from '../services/mcpService';
import './MCPToolsPanel.css';

interface MCPToolsPanelProps {
  onBack?: () => void;
}

export const MCPToolsPanel = ({ onBack }: MCPToolsPanelProps) => {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tools' | 'graph'>('tools');

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      setLoading(true);
      const toolsList = await mcpService.getTools();
      setTools(toolsList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const loadGraph = async () => {
    try {
      setLoading(true);
      const graphData = await mcpService.readGraph();
      setGraph(graphData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load graph');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'tools' | 'graph') => {
    setActiveTab(tab);
    if (tab === 'graph' && !graph) {
      loadGraph();
    }
  };

  return (
    <div className="mcp-tools-panel">
      <div className="mcp-header">
        <div className="mcp-header-top">
          <h2>MCP Memory Tools</h2>
          {onBack && (
            <button onClick={onBack} className="mcp-back-button" title="Вернуться к чату">
              ← Назад к чату
            </button>
          )}
        </div>
        <div className="mcp-tabs">
          <button
            className={activeTab === 'tools' ? 'active' : ''}
            onClick={() => handleTabChange('tools')}
          >
            Tools ({tools.length})
          </button>
          <button
            className={activeTab === 'graph' ? 'active' : ''}
            onClick={() => handleTabChange('graph')}
          >
            Knowledge Graph
          </button>
        </div>
      </div>

      {error && (
        <div className="mcp-error">
          ❌ {error}
        </div>
      )}

      {loading && (
        <div className="mcp-loading">Loading...</div>
      )}

      {!loading && activeTab === 'tools' && (
        <div className="mcp-tools-list">
          {tools.map((tool) => (
            <div key={tool.name} className="mcp-tool-item">
              <div className="tool-header">
                <h3>{tool.title}</h3>
                <code>{tool.name}</code>
              </div>
              <p>{tool.description}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && activeTab === 'graph' && graph && (
        <div className="mcp-graph-view">
          <div className="graph-section">
            <h3>Entities ({graph.entities.length})</h3>
            <div className="entities-list">
              {graph.entities.length === 0 ? (
                <p className="empty-message">No entities yet</p>
              ) : (
                graph.entities.map((entity, idx) => (
                  <div key={idx} className="entity-item">
                    <div className="entity-header">
                      <strong>{entity.name}</strong>
                      <span className="entity-type">{entity.entityType}</span>
                    </div>
                    <ul className="observations">
                      {entity.observations.map((obs, i) => (
                        <li key={i}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="graph-section">
            <h3>Relations ({graph.relations.length})</h3>
            <div className="relations-list">
              {graph.relations.length === 0 ? (
                <p className="empty-message">No relations yet</p>
              ) : (
                graph.relations.map((relation, idx) => (
                  <div key={idx} className="relation-item">
                    <span className="from">{relation.from}</span>
                    <span className="arrow">→</span>
                    <span className="type">{relation.relationType}</span>
                    <span className="arrow">→</span>
                    <span className="to">{relation.to}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button className="refresh-btn" onClick={loadGraph}>
            🔄 Refresh Graph
          </button>
        </div>
      )}
    </div>
  );
};
