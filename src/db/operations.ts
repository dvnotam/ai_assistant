import { db } from './database';
import type { Conversation, Message, IntermediateResult, Setting } from './types';

// ==================== Conversations ====================

export async function createConversation(title: string, metadata?: any): Promise<number> {
  try {
    const now = new Date();
    const id = await db.conversations.add({
      title,
      createdAt: now,
      updatedAt: now,
      metadata
    });
    return id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

export async function getConversation(id: number): Promise<Conversation | undefined> {
  try {
    return await db.conversations.get(id);
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
}

export async function getAllConversations(): Promise<Conversation[]> {
  try {
    return await db.conversations.orderBy('updatedAt').reverse().toArray();
  } catch (error) {
    console.error('Error getting all conversations:', error);
    throw error;
  }
}

export async function updateConversation(id: number, updates: Partial<Conversation>): Promise<number> {
  try {
    return await db.conversations.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
}

export async function deleteConversation(id: number): Promise<void> {
  try {
    // Удаляем диалог и все связанные сообщения и результаты
    await db.transaction('rw', [db.conversations, db.messages, db.intermediateResults], async () => {
      await db.conversations.delete(id);
      await db.messages.where('conversationId').equals(id).delete();
      await db.intermediateResults.where('conversationId').equals(id).delete();
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}

// ==================== Messages ====================

export async function addMessage(
  conversationId: number,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: any
): Promise<number> {
  try {
    const id = await db.messages.add({
      conversationId,
      role,
      content,
      timestamp: new Date(),
      metadata
    });

    // Обновляем время последнего обновления диалога
    await updateConversation(conversationId, {});

    return id;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
}

export async function getMessagesByConversation(conversationId: number): Promise<Message[]> {
  try {
    return await db.messages
      .where('conversationId')
      .equals(conversationId)
      .sortBy('timestamp');
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

export async function deleteMessagesByConversation(conversationId: number): Promise<number> {
  try {
    return await db.messages.where('conversationId').equals(conversationId).delete();
  } catch (error) {
    console.error('Error deleting messages:', error);
    throw error;
  }
}

// ==================== Intermediate Results ====================

export async function saveIntermediateResult(
  conversationId: number,
  taskId: string,
  step: number,
  stepName: string,
  result: any,
  status: 'pending' | 'completed' | 'error'
): Promise<number> {
  try {
    const id = await db.intermediateResults.add({
      conversationId,
      taskId,
      step,
      stepName,
      result,
      timestamp: new Date(),
      status
    });
    return id;
  } catch (error) {
    console.error('Error saving intermediate result:', error);
    throw error;
  }
}

export async function getIntermediateResults(taskId: string): Promise<IntermediateResult[]> {
  try {
    return await db.intermediateResults
      .where('taskId')
      .equals(taskId)
      .sortBy('step');
  } catch (error) {
    console.error('Error getting intermediate results:', error);
    throw error;
  }
}

export async function getIntermediateResultsByConversation(conversationId: number): Promise<IntermediateResult[]> {
  try {
    return await db.intermediateResults
      .where('conversationId')
      .equals(conversationId)
      .sortBy('timestamp');
  } catch (error) {
    console.error('Error getting intermediate results by conversation:', error);
    throw error;
  }
}

export async function updateIntermediateResultStatus(
  id: number,
  status: 'pending' | 'completed' | 'error'
): Promise<number> {
  try {
    return await db.intermediateResults.update(id, { status });
  } catch (error) {
    console.error('Error updating intermediate result status:', error);
    throw error;
  }
}

// ==================== Settings ====================

export async function saveSetting(key: string, value: any): Promise<string> {
  try {
    await db.settings.put({
      key,
      value,
      updatedAt: new Date()
    });
    return key;
  } catch (error) {
    console.error('Error saving setting:', error);
    throw error;
  }
}

export async function getSetting(key: string): Promise<any> {
  try {
    const setting = await db.settings.get(key);
    return setting?.value;
  } catch (error) {
    console.error('Error getting setting:', error);
    throw error;
  }
}

export async function getAllSettings(): Promise<Setting[]> {
  try {
    return await db.settings.toArray();
  } catch (error) {
    console.error('Error getting all settings:', error);
    throw error;
  }
}
