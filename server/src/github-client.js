import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GitHubClientService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      console.log('GitHub MCP client already connected');
      return;
    }

    try {
      console.log('🔄 Connecting to GitHub MCP Server...');

      const githubServerPath = join(__dirname, '../../github-mcp/src/index.js');

      const transport = new StdioClientTransport({
        command: 'node',
        args: [githubServerPath],
        env: {
          ...process.env,
          GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
        }
      });

      this.client = new Client(
        {
          name: 'github-backend-client',
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
      console.log('✅ Connected to GitHub MCP Server');
    } catch (error) {
      console.error('❌ Failed to connect to GitHub MCP server:', error.message);
      this.isConnected = false;
    }
  }

  async listTools() {
    if (!this.isConnected) {
      await this.connect();
    }

    if (!this.isConnected) {
      return [];
    }

    try {
      const response = await this.client.request(
        { method: 'tools/list' },
        { type: 'object' }
      );
      return response.tools;
    } catch (error) {
      console.error('Error listing GitHub tools:', error);
      return [];
    }
  }

  async callTool(name, args) {
    if (!this.isConnected) {
      await this.connect();
    }

    if (!this.isConnected) {
      throw new Error('GitHub MCP server не подключен');
    }

    try {
      const result = await this.client.callTool({
        name,
        arguments: args
      });
      return result;
    } catch (error) {
      console.error(`Error calling GitHub tool ${name}:`, error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('✅ Disconnected from GitHub MCP server');
    }
  }
}

export const githubClient = new GitHubClientService();
