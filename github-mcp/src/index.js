#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_API = 'https://api.github.com';

class GitHubMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'github-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_open_issues_count',
            description: 'Returns the number of open GitHub issues for a repository',
            inputSchema: {
              type: 'object',
              properties: {
                owner: {
                  type: 'string',
                  description: 'Repository owner (username or organization)',
                },
                repo: {
                  type: 'string',
                  description: 'Repository name',
                },
              },
              required: ['owner', 'repo'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'get_open_issues_count') {
        return await this.getOpenIssuesCount(args);
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  async getOpenIssuesCount(args) {
    const { owner, repo } = args;

    if (!owner || !repo) {
      throw new Error('Both owner and repo are required');
    }

    try {
      // Fetch open issues from GitHub API
      const url = `${GITHUB_API}/repos/${owner}/${repo}/issues?state=open&per_page=100`;

      const headers = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'github-mcp-server',
      };

      if (GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const issues = await response.json();

      // Filter out pull requests (they have a 'pull_request' field)
      const actualIssues = issues.filter(issue => !issue.pull_request);

      const count = actualIssues.length;

      return {
        content: [
          {
            type: 'text',
            text: `Repository ${owner}/${repo} has ${count} open issues`,
          },
        ],
        structuredContent: {
          open_issues_count: count,
        },
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('GitHub MCP Server running on stdio');
  }
}

const server = new GitHubMCPServer();
server.run().catch(console.error);
