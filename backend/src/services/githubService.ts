/**
 * GitHub Service - wrapper around Octokit for GitHub Issues API
 */

import { Octokit } from '@octokit/rest';
import { env } from '../utils/env.js';
import { logger } from '../utils/logger.js';
import type { CreateIssueResponse } from '../types/reminder.js';

export class GitHubService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor() {
    this.octokit = new Octokit({
      auth: env.GITHUB_TOKEN,
    });
    this.owner = env.GITHUB_OWNER;
    this.repo = env.GITHUB_REPO;

    logger.info(`GitHubService initialized for ${this.owner}/${this.repo}`);
  }

  /**
   * Create a new GitHub Issue
   */
  async createIssue(data: {
    title: string;
    body: string;
    labels: string[];
  }): Promise<CreateIssueResponse> {
    try {
      logger.debug({ title: data.title }, 'Creating GitHub Issue');

      const response = await this.octokit.issues.create({
        owner: this.owner,
        repo: this.repo,
        title: data.title,
        body: data.body,
        labels: data.labels,
      });

      logger.info({ issueNumber: response.data.number }, 'GitHub Issue created');

      return response.data as CreateIssueResponse;
    } catch (error) {
      logger.error({ error, title: data.title }, 'Failed to create GitHub Issue');
      throw new Error(`Failed to create GitHub Issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List GitHub Issues with filters
   */
  async listIssues(filters: {
    state?: 'open' | 'closed' | 'all';
    labels?: string[];
    sort?: 'created' | 'updated' | 'comments';
    per_page?: number;
  } = {}): Promise<CreateIssueResponse[]> {
    try {
      logger.debug({ filters }, 'Listing GitHub Issues');

      const response = await this.octokit.issues.listForRepo({
        owner: this.owner,
        repo: this.repo,
        state: filters.state || 'all',
        labels: filters.labels?.join(','),
        sort: filters.sort || 'created',
        per_page: filters.per_page || 100,
      });

      logger.info({ count: response.data.length }, 'GitHub Issues retrieved');

      return response.data as CreateIssueResponse[];
    } catch (error) {
      logger.error({ error }, 'Failed to list GitHub Issues');
      throw new Error(`Failed to list GitHub Issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a single GitHub Issue
   */
  async getIssue(issueNumber: number): Promise<CreateIssueResponse> {
    try {
      logger.debug({ issueNumber }, 'Getting GitHub Issue');

      const response = await this.octokit.issues.get({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
      });

      return response.data as CreateIssueResponse;
    } catch (error) {
      logger.error({ error, issueNumber }, 'Failed to get GitHub Issue');
      throw new Error(`Failed to get GitHub Issue #${issueNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Close a GitHub Issue
   */
  async closeIssue(issueNumber: number, comment?: string): Promise<void> {
    try {
      logger.debug({ issueNumber, hasComment: !!comment }, 'Closing GitHub Issue');

      // Add completion comment if provided
      if (comment) {
        await this.octokit.issues.createComment({
          owner: this.owner,
          repo: this.repo,
          issue_number: issueNumber,
          body: comment,
        });
      }

      // Close the issue
      await this.octokit.issues.update({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        state: 'closed',
      });

      logger.info({ issueNumber }, 'GitHub Issue closed');
    } catch (error) {
      logger.error({ error, issueNumber }, 'Failed to close GitHub Issue');
      throw new Error(`Failed to close GitHub Issue #${issueNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a GitHub Issue
   */
  async updateIssue(issueNumber: number, data: {
    title?: string;
    body?: string;
    labels?: string[];
  }): Promise<CreateIssueResponse> {
    try {
      logger.debug({ issueNumber }, 'Updating GitHub Issue');

      const response = await this.octokit.issues.update({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        ...data,
      });

      logger.info({ issueNumber }, 'GitHub Issue updated');

      return response.data as CreateIssueResponse;
    } catch (error) {
      logger.error({ error, issueNumber }, 'Failed to update GitHub Issue');
      throw new Error(`Failed to update GitHub Issue #${issueNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check rate limit status
   */
  async checkRateLimit(): Promise<{
    limit: number;
    remaining: number;
    reset: Date;
  }> {
    try {
      const response = await this.octokit.rateLimit.get();
      const core = response.data.rate;

      return {
        limit: core.limit,
        remaining: core.remaining,
        reset: new Date(core.reset * 1000),
      };
    } catch (error) {
      logger.error({ error }, 'Failed to check rate limit');
      throw new Error('Failed to check GitHub API rate limit');
    }
  }
}
