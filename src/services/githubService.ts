const BACKEND_URL = 'http://localhost:3001';

export interface GitHubIssuesResponse {
  success: boolean;
  result?: {
    content: Array<{
      type: string;
      text: string;
    }>;
    structuredContent: {
      open_issues_count: number;
    };
  };
  error?: string;
}

export interface GitHubTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface GitHubToolsResponse {
  success: boolean;
  tools?: GitHubTool[];
  error?: string;
}

class GitHubService {
  /**
   * Получить количество открытых issues для репозитория
   * @param owner - Владелец репозитория (username или organization)
   * @param repo - Название репозитория
   * @returns Количество открытых issues
   */
  async getOpenIssuesCount(owner: string, repo: string): Promise<number> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/github/open-issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ owner, repo }),
      });

      const data: GitHubIssuesResponse = await response.json();

      if (!data.success || !data.result) {
        throw new Error(data.error || 'Failed to get issues count');
      }

      return data.result.structuredContent.open_issues_count;
    } catch (error) {
      console.error('Error getting open issues count:', error);
      throw error;
    }
  }

  /**
   * Получить полную информацию об открытых issues
   * @param owner - Владелец репозитория
   * @param repo - Название репозитория
   * @returns Полный ответ с текстом и структурированными данными
   */
  async getOpenIssuesInfo(owner: string, repo: string): Promise<GitHubIssuesResponse> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/github/open-issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ owner, repo }),
      });

      const data: GitHubIssuesResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting open issues info:', error);
      throw error;
    }
  }

  /**
   * Получить список доступных GitHub MCP инструментов
   * @returns Список доступных инструментов
   */
  async getAvailableTools(): Promise<GitHubTool[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/github/tools`);
      const data: GitHubToolsResponse = await response.json();

      if (!data.success || !data.tools) {
        throw new Error(data.error || 'Failed to get tools');
      }

      return data.tools;
    } catch (error) {
      console.error('Error getting GitHub tools:', error);
      throw error;
    }
  }
}

export const githubService = new GitHubService();
