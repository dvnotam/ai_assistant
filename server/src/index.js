import express from 'express';
import cors from 'cors';
import { mcpClient } from './mcp-client.js';
import { githubClient } from './github-client.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', connected: mcpClient.isConnected });
});

// List available MCP tools
app.get('/api/mcp/tools', async (req, res) => {
  try {
    const tools = await mcpClient.listTools();
    res.json({ success: true, tools });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create entities in knowledge graph
app.post('/api/mcp/entities', async (req, res) => {
  try {
    const { entities } = req.body;
    const result = await mcpClient.callTool('create_entities', { entities });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add observations to entities
app.post('/api/mcp/observations', async (req, res) => {
  try {
    const { observations } = req.body;
    const result = await mcpClient.callTool('add_observations', { observations });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create relations between entities
app.post('/api/mcp/relations', async (req, res) => {
  try {
    const { relations } = req.body;
    const result = await mcpClient.callTool('create_relations', { relations });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search nodes in knowledge graph
app.post('/api/mcp/search', async (req, res) => {
  try {
    const { query } = req.body;
    const result = await mcpClient.callTool('search_nodes', { query });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Read entire knowledge graph
app.get('/api/mcp/graph', async (req, res) => {
  try {
    const result = await mcpClient.callTool('read_graph', {});
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Open specific nodes
app.post('/api/mcp/nodes/open', async (req, res) => {
  try {
    const { names } = req.body;
    const result = await mcpClient.callTool('open_nodes', { names });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete entities
app.delete('/api/mcp/entities', async (req, res) => {
  try {
    const { entityNames } = req.body;
    const result = await mcpClient.callTool('delete_entities', { entityNames });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generic tool call endpoint
app.post('/api/mcp/call', async (req, res) => {
  try {
    const { toolName, arguments: args } = req.body;
    const result = await mcpClient.callTool(toolName, args);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// === GITHUB MCP ENDPOINTS ===

// Get open issues count
app.post('/api/github/open-issues', async (req, res) => {
  try {
    const { owner, repo } = req.body;
    const result = await githubClient.callTool('get_open_issues_count', { owner, repo });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List GitHub tools
app.get('/api/github/tools', async (req, res) => {
  try {
    const tools = await githubClient.listTools();
    res.json({ success: true, tools });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Initialize MCP connections and start server
async function startServer() {
  try {
    // Connect to Memory MCP server
    await mcpClient.connect();

    // Connect to GitHub MCP server
    await githubClient.connect();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🧠 Memory API: http://localhost:${PORT}/api/mcp/tools`);
      console.log(`🐙 GitHub API: http://localhost:${PORT}/api/github/tools`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await mcpClient.disconnect();
  await githubClient.disconnect();
  process.exit(0);
});

startServer();
