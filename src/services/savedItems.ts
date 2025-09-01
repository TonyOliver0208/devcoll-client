/**
 * Saved Items Service
 * 
 * Service layer for managing saved questions and answers.
 * Handles all API communication with the microservice backend.
 * 
 * @author DevColl Team
 * @version 1.0.0
 */

import { apiClient } from './client';

// TypeScript interfaces for API requests/responses
export interface SavedItem {
  id: string;
  userId: string;
  itemType: 'question' | 'answer';
  itemId: string;
  listId: string;
  title: string;
  content?: string;
  tags: string[];
  votes: number;
  views: string;
  answers: number;
  author: {
    id: string;
    name: string;
    reputation: string;
    avatar?: string;
  };
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedListRequest {
  name: string;
  description?: string;
}

export interface SaveItemRequest {
  itemType: 'question' | 'answer';
  itemId: string;
  listId: string;
  title: string;
  content?: string;
  tags: string[];
  votes: number;
  views: string;
  answers: number;
  author: {
    id: string;
    name: string;
    reputation: string;
    avatar?: string;
  };
  url: string;
}

/**
 * Saved Items API Service
 * 
 * Central service for all saved items operations.
 * Communicates with microservice backend following RESTful conventions.
 */
class SavedItemsService {
  private readonly basePath = '/api/v1';

  /**
   * Get all saved lists for the current user
   */
  async getSavedLists(): Promise<SavedList[]> {
    try {
      const response = await apiClient.get(`${this.basePath}/saved-lists`);
      return response.data.lists || response.data;
    } catch (error) {
      console.error('SavedItemsService: Failed to fetch saved lists:', error);
      throw error;
    }
  }

  /**
   * Get all items in a specific list
   */
  async getListItems(listId: string): Promise<SavedItem[]> {
    try {
      const response = await apiClient.get(`${this.basePath}/saved-lists/${listId}/items`);
      return response.data.items || response.data;
    } catch (error) {
      console.error(`SavedItemsService: Failed to fetch items for list ${listId}:`, error);
      throw error;
    }
  }

  /**
   * Save a new item to a list
   */
  async saveItem(item: SaveItemRequest): Promise<SavedItem> {
    try {
      const response = await apiClient.post(`${this.basePath}/saved-items`, item);
      return response.data.item || response.data;
    } catch (error) {
      console.error('SavedItemsService: Failed to save item:', error);
      throw error;
    }
  }

  /**
   * Remove a saved item
   */
  async removeItem(itemId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/saved-items/${itemId}`);
    } catch (error) {
      console.error(`SavedItemsService: Failed to remove item ${itemId}:`, error);
      throw error;
    }
  }

  /**
   * Move item between lists
   */
  async moveItem(itemId: string, toListId: string): Promise<void> {
    try {
      await apiClient.put(`${this.basePath}/saved-items/${itemId}/move`, { toListId });
    } catch (error) {
      console.error(`SavedItemsService: Failed to move item ${itemId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new saved list
   */
  async createList(data: CreateSavedListRequest): Promise<SavedList> {
    try {
      const response = await apiClient.post(`${this.basePath}/saved-lists`, data);
      return response.data.list || response.data;
    } catch (error) {
      console.error('SavedItemsService: Failed to create list:', error);
      throw error;
    }
  }

  /**
   * Delete a saved list
   */
  async deleteList(listId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/saved-lists/${listId}`);
    } catch (error) {
      console.error(`SavedItemsService: Failed to delete list ${listId}:`, error);
      throw error;
    }
  }

  /**
   * Update a saved list
   */
  async updateList(listId: string, data: Partial<CreateSavedListRequest>): Promise<SavedList> {
    try {
      const response = await apiClient.put(`${this.basePath}/saved-lists/${listId}`, data);
      return response.data.list || response.data;
    } catch (error) {
      console.error(`SavedItemsService: Failed to update list ${listId}:`, error);
      throw error;
    }
  }

  /**
   * Get all saved items for user (across all lists)
   */
  async getAllSavedItems(): Promise<SavedItem[]> {
    try {
      const response = await apiClient.get(`${this.basePath}/saved-items`);
      return response.data.items || response.data;
    } catch (error) {
      console.error('SavedItemsService: Failed to fetch all saved items:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const savedItemsService = new SavedItemsService();

// Legacy export for backward compatibility
export const savedItemsApi = savedItemsService;

// Mock data functions for development
function getMockSavedLists(): SavedList[] {
  return [
    {
      id: 'for-later',
      userId: 'current-user',
      name: 'For later',
      description: 'Items saved for later reading',
      isDefault: true,
      itemCount: 5,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'favorites',
      userId: 'current-user',
      name: 'Favorites',
      description: 'My favorite posts',
      isDefault: false,
      itemCount: 3,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    }
  ];
}

function getMockListItems(listId: string): SavedItem[] {
  return [
    {
      id: `item-1-${listId}`,
      userId: 'current-user',
      itemType: 'question',
      itemId: '1',
      listId,
      title: 'How to implement authentication in Next.js?',
      content: 'I need help implementing authentication...',
      tags: ['next.js', 'authentication', 'typescript'],
      votes: 15,
      views: '1.2k',
      answers: 3,
      author: {
        id: 'author-1',
        name: 'John Doe',
        reputation: '2.5k',
        avatar: '/avatars/john.jpg'
      },
      url: '/questions/1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];
}

function createMockSavedItem(item: SaveItemRequest): SavedItem {
  return {
    id: `saved-${Date.now()}`,
    userId: 'current-user',
    itemType: item.itemType,
    itemId: item.itemId,
    listId: item.listId,
    title: item.title,
    content: item.content,
    tags: item.tags,
    votes: item.votes,
    views: item.views,
    answers: item.answers,
    author: item.author,
    url: item.url,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function createMockSavedList(listData: CreateSavedListRequest): SavedList {
  return {
    id: `list-${Date.now()}`,
    userId: 'current-user',
    name: listData.name,
    description: listData.description,
    isDefault: false,
    itemCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
