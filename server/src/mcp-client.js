import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class MCPClientService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      console.log('MCP client already connected');
      return;
    }

    try {
      console.log('🔄 Connecting to Memory MCP Server...');

      const transport = new StdioClientTransport({
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory']
      });

      this.client = new Client(
        {
          name: 'mcp-backend-client',
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {},
          },
        }
      );

      await this.client.connect(transport);
      this.isConnected = true;
      console.log('✅ Connected to Memory MCP Server');
    } catch (error) {
      console.error('❌ Failed to connect to MCP server:', error);
      throw error;
    }
  }

  async listTools() {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const response = await this.client.request(
        { method: 'tools/list' },
        { type: 'object' }
      );
      return response.tools;
    } catch (error) {
      console.error('Error listing tools:', error);
      throw error;
    }
  }

  async callTool(name, args) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const result = await this.client.callTool({
        name,
        arguments: args
      });
      return result;
    } catch (error) {
      console.error(`Error calling tool ${name}:`, error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('✅ Disconnected from MCP server');
    }
  }
}

export const mcpClient = new MCPClientService();
