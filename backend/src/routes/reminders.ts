/**
 * Reminder Routes - REST API endpoints
 */

import { Router, Request, Response } from 'express';
import { ReminderService } from '../services/reminderService.js';
import { GitHubService } from '../services/githubService.js';
import { logger } from '../utils/logger.js';
import type { ReminderData, ReminderFilters } from '../types/reminder.js';

const router = Router();
const githubService = new GitHubService();
const reminderService = new ReminderService(githubService);

/**
 * POST /api/reminders
 * Create a new reminder
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, dueDate, priority, category } = req.body;

    // Validate required fields
    if (!title || !description || !dueDate) {
      res.status(400).json({
        error: 'Missing required fields: title, description, dueDate',
      });
      return;
    }

    const data: ReminderData = {
      title,
      description,
      dueDate: new Date(dueDate),
      priority: priority || 'medium',
      category,
    };

    const reminder = await reminderService.createReminder(data);

    logger.info({ issueNumber: reminder.issueNumber }, 'Reminder created via API');

    res.status(201).json(reminder);
  } catch (error) {
    logger.error({ error }, 'Failed to create reminder via API');
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create reminder',
    });
  }
});

/**
 * GET /api/reminders
 * List reminders with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters: ReminderFilters = {
      status: (req.query.status as 'active' | 'completed' | 'all') || 'active',
      category: req.query.category as string,
      priority: req.query.priority as 'high' | 'medium' | 'low',
      sortBy: (req.query.sortBy as 'dueDate' | 'priority' | 'created') || 'dueDate',
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    };

    const reminders = await reminderService.listReminders(filters);

    logger.info({ count: reminders.length, filters }, 'Reminders listed via API');

    res.json(reminders);
  } catch (error) {
    logger.error({ error }, 'Failed to list reminders via API');
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to list reminders',
    });
  }
});

/**
 * GET /api/reminders/:id
 * Get a single reminder by issue number
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const issueNumber = parseInt(req.params.id, 10);

    if (isNaN(issueNumber)) {
      res.status(400).json({
        error: 'Invalid issue number',
      });
      return;
    }

    const reminder = await reminderService.getReminder(issueNumber);

    logger.info({ issueNumber }, 'Reminder retrieved via API');

    res.json(reminder);
  } catch (error) {
    logger.error({ error, issueNumber: req.params.id }, 'Failed to get reminder via API');
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get reminder',
    });
  }
});

/**
 * DELETE /api/reminders/:id
 * Complete (close) a reminder
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const issueNumber = parseInt(req.params.id, 10);
    const { comment } = req.body;

    if (isNaN(issueNumber)) {
      res.status(400).json({
        error: 'Invalid issue number',
      });
      return;
    }

    await reminderService.completeReminder(issueNumber, comment);

    logger.info({ issueNumber }, 'Reminder completed via API');

    res.json({
      message: `Reminder #${issueNumber} completed successfully`,
    });
  } catch (error) {
    logger.error({ error, issueNumber: req.params.id }, 'Failed to complete reminder via API');
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to complete reminder',
    });
  }
});

export default router;
