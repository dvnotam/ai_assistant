/**
 * Reminder Service - business logic for reminders using GitHub Issues
 */

import { GitHubService } from './githubService.js';
import { logger } from '../utils/logger.js';
import type {
  Reminder,
  ReminderData,
  ReminderFilters,
  ReminderMetadata,
} from '../types/reminder.js';

export class ReminderService {
  constructor(private githubService: GitHubService) {
    logger.info('ReminderService initialized');
  }

  /**
   * Create a new reminder
   */
  async createReminder(data: ReminderData): Promise<Reminder> {
    logger.debug({ title: data.title }, 'Creating reminder');

    const priority = data.priority || 'medium';
    const labels = [
      'reminder',
      `priority-${priority}`,
    ];

    if (data.category) {
      labels.push(`category-${data.category}`);
    }

    const body = this.formatIssueBody(data, priority);

    const issue = await this.githubService.createIssue({
      title: `[REMINDER] ${data.title}`,
      body,
      labels,
    });

    const reminder = this.issueToReminder(issue);
    logger.info({ issueNumber: reminder.issueNumber }, 'Reminder created');

    return reminder;
  }

  /**
   * List reminders with filters
   */
  async listReminders(filters: ReminderFilters = {}): Promise<Reminder[]> {
    logger.debug({ filters }, 'Listing reminders');

    const state = filters.status === 'active' ? 'open'
                : filters.status === 'completed' ? 'closed'
                : 'all';

    const labels: string[] = ['reminder'];

    if (filters.priority) {
      labels.push(`priority-${filters.priority}`);
    }

    if (filters.category) {
      labels.push(`category-${filters.category}`);
    }

    const issues = await this.githubService.listIssues({
      state,
      labels,
      per_page: filters.limit || 100,
    });

    // Convert issues to reminders and parse metadata
    let reminders = issues.map(issue => this.issueToReminder(issue));

    // Apply sorting
    if (filters.sortBy) {
      reminders = this.sortReminders(reminders, filters.sortBy);
    }

    logger.info({ count: reminders.length }, 'Reminders retrieved');

    return reminders;
  }

  /**
   * Get a single reminder
   */
  async getReminder(issueNumber: number): Promise<Reminder> {
    logger.debug({ issueNumber }, 'Getting reminder');

    const issue = await this.githubService.getIssue(issueNumber);
    const reminder = this.issueToReminder(issue);

    return reminder;
  }

  /**
   * Complete a reminder (close the Issue)
   */
  async completeReminder(issueNumber: number, comment?: string): Promise<void> {
    logger.debug({ issueNumber }, 'Completing reminder');

    const completedComment = comment
      ? `✓ Completed: ${comment}\n\n*Completed at: ${new Date().toISOString()}*`
      : `✓ Reminder completed\n\n*Completed at: ${new Date().toISOString()}*`;

    await this.githubService.closeIssue(issueNumber, completedComment);

    logger.info({ issueNumber }, 'Reminder completed');
  }

  /**
   * Format Issue body from reminder data
   */
  private formatIssueBody(data: ReminderData, priority: string): string {
    const metadata: ReminderMetadata = {
      dueDate: data.dueDate.toISOString(),
      priority: priority as 'high' | 'medium' | 'low',
      category: data.category,
      createdAt: new Date().toISOString(),
    };

    const metadataComment = `<!-- REMINDER_METADATA
${Object.entries(metadata)
  .filter(([_, value]) => value !== undefined)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}
-->`;

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    };

    return `${metadataComment}

**📅 Due Date:** ${formatDate(data.dueDate)}
**⚡️ Priority:** ${priority.charAt(0).toUpperCase() + priority.slice(1)}
${data.category ? `**🏷 Category:** ${data.category}` : ''}

---

${data.description}

---

**Status:** Active
**Created:** ${formatDate(new Date())}`;
  }

  /**
   * Parse metadata from Issue body
   */
  private parseIssueMetadata(body: string | null): ReminderMetadata | null {
    if (!body) return null;

    const metadataMatch = body.match(/<!-- REMINDER_METADATA\n([\s\S]*?)\n-->/);
    if (!metadataMatch) return null;

    const metadataText = metadataMatch[1];
    const metadata: Partial<ReminderMetadata> = {};

    metadataText.split('\n').forEach(line => {
      const [key, value] = line.split(': ').map(s => s.trim());
      if (key && value) {
        metadata[key as keyof ReminderMetadata] = value as any;
      }
    });

    if (!metadata.dueDate || !metadata.priority || !metadata.createdAt) {
      return null;
    }

    return metadata as ReminderMetadata;
  }

  /**
   * Convert GitHub Issue to Reminder
   */
  private issueToReminder(issue: any): Reminder {
    const metadata = this.parseIssueMetadata(issue.body);

    // Extract title without [REMINDER] prefix
    const title = issue.title.replace(/^\[REMINDER\]\s*/, '');

    // Extract description from body (between second --- and third ---)
    let description = '';
    if (issue.body) {
      const parts = issue.body.split('---');
      if (parts.length >= 3) {
        description = parts[1].trim();
      }
    }

    // Determine priority from labels
    const priorityLabel = issue.labels.find((l: any) =>
      l.name.startsWith('priority-')
    );
    const priority = priorityLabel
      ? priorityLabel.name.replace('priority-', '') as 'high' | 'medium' | 'low'
      : 'medium';

    // Determine category from labels
    const categoryLabel = issue.labels.find((l: any) =>
      l.name.startsWith('category-')
    );
    const category = categoryLabel
      ? categoryLabel.name.replace('category-', '')
      : undefined;

    return {
      issueNumber: issue.number,
      title,
      description,
      dueDate: metadata?.dueDate ? new Date(metadata.dueDate) : new Date(),
      priority,
      category,
      status: issue.state === 'open' ? 'active' : 'completed',
      url: issue.html_url,
      createdAt: new Date(issue.created_at),
      completedAt: issue.state === 'closed' && issue.closed_at
        ? new Date(issue.closed_at)
        : undefined,
    };
  }

  /**
   * Sort reminders by specified field
   */
  private sortReminders(
    reminders: Reminder[],
    sortBy: 'dueDate' | 'priority' | 'created'
  ): Reminder[] {
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    return [...reminders].sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'priority':
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });
  }
}
