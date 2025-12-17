#!/usr/bin/env node

/**
 * MCP Server for Reminders
 * Provides tools for Claude to manage reminders via GitHub Issues
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { GitHubService } from '../services/githubService.js';
import { ReminderService } from '../services/reminderService.js';
import type { ReminderData, ReminderFilters } from '../types/reminder.js';

// Note: Logging disabled for MCP server (logs interfere with JSON-RPC over stdio)

class ReminderMCPServer {
  private server: Server;
  private reminderService: ReminderService;

  constructor() {
    this.server = new Server(
      {
        name: 'reminder-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    const githubService = new GitHubService();
    this.reminderService = new ReminderService(githubService);

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'reminder_create',
            description: 'Создаёт новое напоминание как GitHub Issue',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Заголовок напоминания',
                },
                description: {
                  type: 'string',
                  description: 'Подробное описание напоминания',
                },
                dueDate: {
                  type: 'string',
                  description: 'Дата и время напоминания в формате ISO 8601 (например: 2025-12-20T10:00:00Z)',
                },
                priority: {
                  type: 'string',
                  enum: ['high', 'medium', 'low'],
                  description: 'Приоритет напоминания',
                },
                category: {
                  type: 'string',
                  description: 'Категория напоминания (например: work, personal, project)',
                },
              },
              required: ['title', 'description', 'dueDate'],
            },
          },
          {
            name: 'reminder_list',
            description: 'Получает список напоминаний с фильтрацией',
            inputSchema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['active', 'completed', 'all'],
                  description: 'Статус напоминаний',
                },
                category: {
                  type: 'string',
                  description: 'Фильтр по категории',
                },
                priority: {
                  type: 'string',
                  enum: ['high', 'medium', 'low'],
                  description: 'Фильтр по приоритету',
                },
                sortBy: {
                  type: 'string',
                  enum: ['dueDate', 'priority', 'created'],
                  description: 'Поле для сортировки',
                },
              },
            },
          },
          {
            name: 'reminder_complete',
            description: 'Отмечает напоминание как выполненное',
            inputSchema: {
              type: 'object',
              properties: {
                issueNumber: {
                  type: 'number',
                  description: 'Номер Issue напоминания',
                },
                comment: {
                  type: 'string',
                  description: 'Комментарий при завершении (опционально)',
                },
              },
              required: ['issueNumber'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'reminder_create':
            return await this.handleCreateReminder(args);
          case 'reminder_list':
            return await this.handleListReminders(args);
          case 'reminder_complete':
            return await this.handleCompleteReminder(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleCreateReminder(args: any) {
    const data: ReminderData = {
      title: args.title,
      description: args.description,
      dueDate: new Date(args.dueDate),
      priority: args.priority,
      category: args.category,
    };

    const reminder = await this.reminderService.createReminder(data);

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    };

    return {
      content: [
        {
          type: 'text',
          text: `✓ Напоминание создано

**#${reminder.issueNumber}: ${reminder.title}**

📅 Дата: ${formatDate(reminder.dueDate)}
⚡️ Приоритет: ${reminder.priority}
${reminder.category ? `🏷 Категория: ${reminder.category}` : ''}

🔗 GitHub Issue: ${reminder.url}`,
        },
      ],
    };
  }

  private async handleListReminders(args: any) {
    const filters: ReminderFilters = {
      status: args.status || 'active',
      category: args.category,
      priority: args.priority,
      sortBy: args.sortBy || 'dueDate',
    };

    const reminders = await this.reminderService.listReminders(filters);

    if (reminders.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `Напоминания не найдены (статус: ${filters.status})`,
          },
        ],
      };
    }

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('ru-RU', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    };

    const priorityEmoji = {
      high: '🔴',
      medium: '🟡',
      low: '🟢',
    };

    const list = reminders.map((r) => {
      const emoji = priorityEmoji[r.priority];
      const category = r.category ? ` [${r.category}]` : '';
      return `${emoji} #${r.issueNumber}: **${r.title}**${category}\n   📅 ${formatDate(r.dueDate)}`;
    }).join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `📋 Найдено напоминаний: ${reminders.length}\n\n${list}`,
        },
      ],
    };
  }

  private async handleCompleteReminder(args: any) {
    const { issueNumber, comment } = args;

    await this.reminderService.completeReminder(issueNumber, comment);

    return {
      content: [
        {
          type: 'text',
          text: `✓ Напоминание #${issueNumber} отмечено как выполненное`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server
const server = new ReminderMCPServer();
server.run().catch(() => {
  process.exit(1);
});
