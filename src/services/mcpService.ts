const API_BASE_URL = 'http://localhost:3001/api/mcp';

export interface MCPTool {
  name: string;
  title: string;
  description: string;
  inputSchema: any;
}

export interface Entity {
  name: string;
  entityType: string;
  observations: string[];
}

export interface Relation {
  from: string;
  to: string;
  relationType: string;
}

export interface KnowledgeGraph {
  entities: Entity[];
  relations: Relation[];
}

class MCPService {
  async getTools(): Promise<MCPTool[]> {
    const response = await fetch(`${API_BASE_URL}/tools`);
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch tools');
    }
    return data.tools;
  }

  async createEntities(entities: Entity[]): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/entities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entities })
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to create entities');
    }
    return data.result;
  }

  async addObservations(observations: { entityName: string; contents: string[] }[]): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/observations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ observations })
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to add observations');
    }
    return data.result;
  }

  async createRelations(relations: Relation[]): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/relations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relations })
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to create relations');
    }
    return data.result;
  }

  async searchNodes(query: string): Promise<KnowledgeGraph> {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to search nodes');
    }
    return data.result.structuredContent;
  }

  async readGraph(): Promise<KnowledgeGraph> {
    const response = await fetch(`${API_BASE_URL}/graph`);
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to read graph');
    }
    return data.result.structuredContent;
  }

  async openNodes(names: string[]): Promise<KnowledgeGraph> {
    const response = await fetch(`${API_BASE_URL}/nodes/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ names })
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to open nodes');
    }
    return data.result.structuredContent;
  }

  async deleteEntities(entityNames: string[]): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/entities`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityNames })
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete entities');
    }
    return data.result;
  }

  async callTool(toolName: string, args: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolName, arguments: args })
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to call tool');
    }
    return data.result;
  }
}

export const mcpService = new MCPService();
