/**
 * Type definitions for Reminder system
 */

export interface Reminder {
  issueNumber: number;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  status: 'active' | 'completed';
  url: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface ReminderData {
  title: string;
  description: string;
  dueDate: Date;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
}

export interface ReminderFilters {
  status?: 'active' | 'completed' | 'all';
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  sortBy?: 'dueDate' | 'priority' | 'created';
  limit?: number;
}

export interface ReminderMetadata {
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  createdAt: string;
}

export interface CreateIssueResponse {
  number: number;
  html_url: string;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  created_at: string;
  labels: Array<{
    name: string;
  }>;
}
