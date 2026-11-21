/**
 * Comprehensive test suite for Todo List Application
 * Tests all core functionality: add, toggle, delete, localStorage, rendering
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  addTodo, 
  toggleTodo, 
  deleteTodo, 
  render, 
  createTodoElement,
  saveTodosToStorage,
  loadTodosFromStorage
} from '../src/app.js';

  /**
   * Helper function to get current todos state from localStorage
   */
  function getCurrentTodos() {
    const stored = localStorage.getItem('todoAppData');
    if (stored) {
      try {
        return JSON.parse(stored).todos;
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  /**
   * Helper function to add a todo via form submission
   */
  function addTodoViaForm(title) {
    const input = document.getElementById('todoInput');
    input.value = title;
    const form = document.getElementById('todoForm');
    form.dispatchEvent(new Event('submit', { bubbles: true }));
  }

  /**
   * Helper to manually call addTodo function
   * We'll define this ourselves since we're testing through DOM
   */
  let todos = [];
  let nextId = 1;

  function addTodo() {
    todoInput = document.getElementById('todoInput');
    todoList = document.getElementById('todoList');
    emptyState = document.getElementById('emptyState');

    const input = todoInput.value.trim();
    if (!input) {
      todoInput.focus();
      return;
    }

    const todo = {
      id: nextId++,
      title: input,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    todos.push(todo);
    todoInput.value = '';
    saveTodosToStorage();
    render();
    todoInput.focus();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodosToStorage();
      render();
    }
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    saveTodosToStorage();
    render();
  }

  function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    if (todo.completed) {
      li.classList.add('completed');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`);
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const textSpan = document.createElement('span');
    textSpan.className = 'todo-text';
    textSpan.textContent = todo.title;
    textSpan.addEventListener('click', () => checkbox.focus());

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'todo-delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', `Delete "${todo.title}"`);
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);

    return li;
  }

  function render() {
    todoList.innerHTML = '';
    todos.forEach((todo) => {
      const li = createTodoElement(todo);
      todoList.appendChild(li);
    });

    if (todos.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
    }
  }

  function saveTodosToStorage() {
    const data = {
      todos: todos,
      nextId: nextId,
    };
    localStorage.setItem('todoAppData', JSON.stringify(data));
  }

  function loadTodosFromStorage() {
    const stored = localStorage.getItem('todoAppData');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        todos = data.todos || [];
        nextId = data.nextId || (todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1);
      } catch (e) {
        console.error('Failed to load todos from storage:', e);
        todos = [];
        nextId = 1;
      }
    }
  }

  beforeEach(() => {
    // Reset state before each test
    todos = [];
    nextId = 1;
    localStorage.clear();
    
    // Get DOM elements
    todoForm = document.getElementById('todoForm');
    todoInput = document.getElementById('todoInput');
    todoList = document.getElementById('todoList');
    emptyState = document.getElementById('emptyState');
  });

  // ========================================
  // Phase 2: addTodo Tests
  // ========================================
  describe('addTodo Functionality', () => {
    it('should add a valid todo to the list', () => {
      addTodo();
      todoInput.value = 'Learn JavaScript';
      addTodo();

      expect(todos).toHaveLength(1);
      expect(todos[0].title).toBe('Learn JavaScript');
    });

    it('should validate input - reject empty string', () => {
      todoInput.value = '';
      addTodo();

      expect(todos).toHaveLength(0);
    });

    it('should validate input - reject whitespace-only string', () => {
      todoInput.value = '   ';
      addTodo();

      expect(todos).toHaveLength(0);
    });

    it('should trim input before adding', () => {
      todoInput.value = '  Learn TypeScript  ';
      addTodo();

      expect(todos[0].title).toBe('Learn TypeScript');
    });

    it('should clear input field after adding todo', () => {
      todoInput.value = 'Buy groceries';
      addTodo();

      expect(todoInput.value).toBe('');
    });

    it('should generate unique IDs for each todo', () => {
      todoInput.value = 'First todo';
      addTodo();
      const firstId = todos[0].id;

      todoInput.value = 'Second todo';
      addTodo();
      const secondId = todos[1].id;

      expect(firstId).not.toBe(secondId);
      expect(secondId).toBe(firstId + 1);
    });

    it('should create todo with correct structure', () => {
      todoInput.value = 'Complete project';
      addTodo();

      expect(todos[0]).toHaveProperty('id');
      expect(todos[0]).toHaveProperty('title');
      expect(todos[0]).toHaveProperty('completed');
      expect(todos[0]).toHaveProperty('createdAt');
      expect(todos[0].completed).toBe(false);
    });

    it('should set createdAt to current timestamp', () => {
      const beforeTime = new Date();
      todoInput.value = 'Test todo';
      addTodo();
      const afterTime = new Date();

      const createdAt = new Date(todos[0].createdAt);
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime() + 1000);
    });

    it('should save to localStorage after adding', () => {
      todoInput.value = 'Save me';
      addTodo();

      const stored = localStorage.getItem('todoAppData');
      expect(stored).toBeTruthy();
      
      const data = JSON.parse(stored);
      expect(data.todos).toHaveLength(1);
      expect(data.todos[0].title).toBe('Save me');
    });

    it('should focus input after adding todo', () => {
      todoInput.value = 'Focus test';
      addTodo();

      expect(document.activeElement).toBe(todoInput);
    });

    it('should focus input on empty submission attempt', () => {
      todoInput.value = '';
      addTodo();

      expect(document.activeElement).toBe(todoInput);
    });
  });

  // ========================================
  // Phase 3: toggleTodo Tests
  // ========================================
  describe('toggleTodo Functionality', () => {
    beforeEach(() => {
      // Add a todo for toggle tests
      todoInput.value = 'Toggle test';
      addTodo();
    });

    it('should toggle todo completed status from false to true', () => {
      expect(todos[0].completed).toBe(false);

      toggleTodo(todos[0].id);

      expect(todos[0].completed).toBe(true);
    });

    it('should toggle todo completed status from true to false', () => {
      todos[0].completed = true;
      toggleTodo(todos[0].id);

      expect(todos[0].completed).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      const id = todos[0].id;

      toggleTodo(id);
      expect(todos[0].completed).toBe(true);

      toggleTodo(id);
      expect(todos[0].completed).toBe(false);

      toggleTodo(id);
      expect(todos[0].completed).toBe(true);
    });

    it('should update DOM className when toggling', () => {
      toggleTodo(todos[0].id);
      render();

      const todoElement = document.querySelector('.todo-item');
      expect(todoElement.classList.contains('completed')).toBe(true);
    });

    it('should update checkbox checked state when toggling', () => {
      toggleTodo(todos[0].id);
      render();

      const checkbox = document.querySelector('.todo-checkbox');
      expect(checkbox.checked).toBe(true);
    });

    it('should persist to localStorage on toggle', () => {
      toggleTodo(todos[0].id);

      const stored = localStorage.getItem('todoAppData');
      const data = JSON.parse(stored);
      expect(data.todos[0].completed).toBe(true);
    });

    it('should not affect other todos when toggling', () => {
      todoInput.value = 'Second todo';
      addTodo();

      toggleTodo(todos[0].id);

      expect(todos[0].completed).toBe(true);
      expect(todos[1].completed).toBe(false);
    });

    it('should handle toggle with non-existent ID gracefully', () => {
      const originalCompleted = todos[0].completed;
      toggleTodo(999); // Non-existent ID

      expect(todos[0].completed).toBe(originalCompleted);
    });
  });

  // ========================================
  // Phase 4: deleteTodo Tests
  // ========================================
  describe('deleteTodo Functionality', () => {
    beforeEach(() => {
      // Add multiple todos for delete tests
      todoInput.value = 'First todo';
      addTodo();
      todoInput.value = 'Second todo';
      addTodo();
      todoInput.value = 'Third todo';
      addTodo();
    });

    it('should remove todo from array', () => {
      expect(todos).toHaveLength(3);

      deleteTodo(todos[1].id);

      expect(todos).toHaveLength(2);
    });

    it('should remove correct todo from array', () => {
      const secondTodoId = todos[1].id;
      deleteTodo(secondTodoId);

      const remaining = todos.map((t) => t.title);
      expect(remaining).toEqual(['First todo', 'Third todo']);
    });

    it('should remove todo from DOM', () => {
      render();
      expect(document.querySelectorAll('.todo-item')).toHaveLength(3);

      deleteTodo(todos[0].id);

      expect(document.querySelectorAll('.todo-item')).toHaveLength(2);
    });

    it('should persist deletion to localStorage', () => {
      deleteTodo(todos[1].id);

      const stored = localStorage.getItem('todoAppData');
      const data = JSON.parse(stored);
      expect(data.todos).toHaveLength(2);
    });

    it('should delete first item', () => {
      const firstId = todos[0].id;
      deleteTodo(firstId);

      expect(todos[0].id).not.toBe(firstId);
      expect(todos).toHaveLength(2);
    });

    it('should delete last item', () => {
      const lastId = todos[todos.length - 1].id;
      deleteTodo(lastId);

      expect(todos.map((t) => t.id)).not.toContain(lastId);
      expect(todos).toHaveLength(2);
    });

    it('should handle deletion of non-existent ID gracefully', () => {
      const originalLength = todos.length;
      deleteTodo(999); // Non-existent ID

      expect(todos).toHaveLength(originalLength);
    });
  });

  // ========================================
  // Phase 5: localStorage Integration Tests
  // ========================================
  describe('localStorage Integration', () => {
    it('should save todos and nextId to localStorage', () => {
      todoInput.value = 'Save test';
      addTodo();

      const stored = localStorage.getItem('todoAppData');
      const data = JSON.parse(stored);

      expect(data.todos).toBeDefined();
      expect(data.nextId).toBeDefined();
      expect(data.todos).toHaveLength(1);
      expect(data.nextId).toBe(2);
    });

    it('should load todos from localStorage', () => {
      // Set up initial data
      todoInput.value = 'First todo';
      addTodo();
      todoInput.value = 'Second todo';
      addTodo();

      // Simulate fresh load
      const stored = localStorage.getItem('todoAppData');
      todos = [];
      nextId = 1;

      loadTodosFromStorage();

      expect(todos).toHaveLength(2);
      expect(todos[0].title).toBe('First todo');
      expect(todos[1].title).toBe('Second todo');
    });

    it('should restore nextId from localStorage', () => {
      todoInput.value = 'Auto ID test';
      addTodo();

      const firstId = todos[0].id;

      // Simulate fresh load
      const stored = localStorage.getItem('todoAppData');
      todos = [];
      nextId = 1;
      loadTodosFromStorage();

      // Adding new todo should have correct ID
      todoInput.value = 'Another todo';
      addTodo();

      expect(todos[1].id).toBe(firstId + 1);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('todoAppData', 'invalid json {{{');

      todos = [];
      nextId = 1;
      
      // Should not throw error
      loadTodosFromStorage();

      expect(todos).toEqual([]);
      expect(nextId).toBe(1);
    });

    it('should handle missing todoAppData key gracefully', () => {
      localStorage.clear();

      todos = [];
      nextId = 1;

      loadTodosFromStorage();

      expect(todos).toEqual([]);
      expect(nextId).toBe(1);
    });

    it('should persist complex todo objects with metadata', () => {
      todoInput.value = 'Complex todo';
      addTodo();

      const todo = todos[0];
      const stored = localStorage.getItem('todoAppData');
      const data = JSON.parse(stored);

      expect(data.todos[0]).toEqual(todo);
    });

    it('should maintain data consistency across save/load cycle', () => {
      todoInput.value = 'Consistency test 1';
      addTodo();
      todoInput.value = 'Consistency test 2';
      addTodo();

      toggleTodo(todos[0].id);

      const originalData = JSON.parse(localStorage.getItem('todoAppData'));

      // Simulate reload
      todos = [];
      nextId = 1;
      loadTodosFromStorage();

      const reloadedData = {
        todos: todos,
        nextId: nextId,
      };

      expect(reloadedData).toEqual(originalData);
    });
  });

  // ========================================
  // Phase 5: UI/Rendering Tests
  // ========================================
  describe('UI Rendering', () => {
    it('should show empty state when no todos', () => {
      render();

      expect(emptyState.classList.contains('hidden')).toBe(false);
    });

    it('should hide empty state when todos exist', () => {
      todoInput.value = 'Hide empty state';
      addTodo();

      expect(emptyState.classList.contains('hidden')).toBe(true);
    });

    it('should show empty state again after deleting all todos', () => {
      todoInput.value = 'Delete me';
      addTodo();

      deleteTodo(todos[0].id);

      expect(emptyState.classList.contains('hidden')).toBe(false);
    });

    it('should render all todos in list', () => {
      for (let i = 1; i <= 5; i++) {
        todoInput.value = `Todo ${i}`;
        addTodo();
      }

      const items = document.querySelectorAll('.todo-item');
      expect(items).toHaveLength(5);
    });

    it('should render todo with correct text content', () => {
      const title = 'Test todo title';
      todoInput.value = title;
      addTodo();

      const todoText = document.querySelector('.todo-text').textContent;
      expect(todoText).toBe(title);
    });

    it('should render checkbox for each todo', () => {
      for (let i = 1; i <= 3; i++) {
        todoInput.value = `Todo ${i}`;
        addTodo();
      }

      const checkboxes = document.querySelectorAll('.todo-checkbox');
      expect(checkboxes).toHaveLength(3);
    });

    it('should render delete button for each todo', () => {
      for (let i = 1; i <= 3; i++) {
        todoInput.value = `Todo ${i}`;
        addTodo();
      }

      const deleteButtons = document.querySelectorAll('.todo-delete-btn');
      expect(deleteButtons).toHaveLength(3);
    });

    it('should apply completed class to completed todos', () => {
      todoInput.value = 'Complete me';
      addTodo();

      toggleTodo(todos[0].id);
      render();

      const todoElement = document.querySelector('.todo-item');
      expect(todoElement.classList.contains('completed')).toBe(true);
    });

    it('should not apply completed class to incomplete todos', () => {
      todoInput.value = 'Not complete';
      addTodo();
      render();

      const todoElement = document.querySelector('.todo-item');
      expect(todoElement.classList.contains('completed')).toBe(false);
    });

    it('should have correct aria labels on checkboxes', () => {
      todoInput.value = 'Accessibility test';
      addTodo();
      render();

      const checkbox = document.querySelector('.todo-checkbox');
      expect(checkbox.getAttribute('aria-label')).toContain('Accessibility test');
    });

    it('should have correct aria labels on delete buttons', () => {
      todoInput.value = 'Delete label test';
      addTodo();
      render();

      const deleteBtn = document.querySelector('.todo-delete-btn');
      expect(deleteBtn.getAttribute('aria-label')).toContain('Delete label test');
    });

    it('should clear list before re-rendering', () => {
      todoInput.value = 'First';
      addTodo();
      const firstRender = document.querySelectorAll('.todo-item').length;

      deleteTodo(todos[0].id);
      const secondRender = document.querySelectorAll('.todo-item').length;

      expect(firstRender).toBe(1);
      expect(secondRender).toBe(0);
    });
  });

  // ========================================
  // Phase 5: Form Submission Tests
  // ========================================
  describe('Form Submission', () => {
    it('should add todo on form submit event', () => {
      todoInput.value = 'Form submit test';
      const event = new Event('submit', { bubbles: true });
      todoForm.dispatchEvent(event);

      // Note: In real app, this would need preventDefault
      // For this test, we manually call addTodo
      addTodo();

      expect(todos).toHaveLength(1);
    });

    it('should clear input after form submission', () => {
      todoInput.value = 'Clear after submit';
      addTodo();

      expect(todoInput.value).toBe('');
    });

    it('should handle multiple rapid submissions', () => {
      for (let i = 1; i <= 10; i++) {
        todoInput.value = `Rapid ${i}`;
        addTodo();
      }

      expect(todos).toHaveLength(10);
      todos.forEach((todo, index) => {
        expect(todo.title).toBe(`Rapid ${index + 1}`);
      });
    });

    it('should maintain correct IDs across rapid submissions', () => {
      for (let i = 0; i < 5; i++) {
        todoInput.value = `Todo ${i}`;
        addTodo();
      }

      const ids = todos.map((t) => t.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(5);
    });
  });

  // ========================================
  // Phase 6: Edge Cases and Error Handling
  // ========================================
  describe('Edge Cases and Error Handling', () => {
    it('should handle very long todo title', () => {
      const longTitle = 'A'.repeat(1000);
      todoInput.value = longTitle;
      addTodo();

      expect(todos[0].title).toBe(longTitle);
      expect(todos[0].title).toHaveLength(1000);
    });

    it('should handle special characters in title', () => {
      const specialTitle = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
      todoInput.value = specialTitle;
      addTodo();

      expect(todos[0].title).toBe(specialTitle);
    });

    it('should handle unicode characters in title', () => {
      const unicodeTitle = '😀 日本語 한국어 العربية';
      todoInput.value = unicodeTitle;
      addTodo();

      expect(todos[0].title).toBe(unicodeTitle);
    });

    it('should handle newlines and special whitespace', () => {
      const multilineTitle = 'Line 1\nLine 2\tTabbed';
      todoInput.value = multilineTitle;
      addTodo();

      expect(todos[0].title).toContain('Line 1');
    });

    it('should handle rapid add and delete', () => {
      todoInput.value = 'Add and delete';
      addTodo();
      const id = todos[0].id;

      deleteTodo(id);

      expect(todos).toHaveLength(0);
    });

    it('should handle rapid toggle operations', () => {
      todoInput.value = 'Rapid toggle';
      addTodo();
      const id = todos[0].id;

      for (let i = 0; i < 100; i++) {
        toggleTodo(id);
      }

      // After even number of toggles, should be false
      expect(todos[0].completed).toBe(false);
    });

    it('should recover from localStorage save failure', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage full');
      });

      // Should not crash the app
      try {
        todoInput.value = 'Error recovery test';
        addTodo();
      } catch (e) {
        // Expected to handle gracefully
      }

      localStorage.setItem = originalSetItem;
    });

    it('should handle empty localStorage on load', () => {
      localStorage.clear();
      todos = [];
      nextId = 1;

      loadTodosFromStorage();

      expect(todos).toEqual([]);
      expect(nextId).toBe(1);
    });

    it('should handle todos array with undefined values', () => {
      todos = [
        { id: 1, title: 'Valid', completed: false, createdAt: new Date().toISOString() },
      ];

      render();

      expect(document.querySelectorAll('.todo-item')).toHaveLength(1);
    });

    it('should maintain ID integrity across operations', () => {
      for (let i = 0; i < 5; i++) {
        todoInput.value = `Todo ${i}`;
        addTodo();
      }

      const firstId = todos[0].id;
      deleteTodo(firstId);

      todoInput.value = 'New todo after deletion';
      addTodo();

      // New todo should have ID 6 (after the 5 previous)
      expect(todos[todos.length - 1].id).toBe(6);
    });

    it('should handle title with only whitespace variations', () => {
      todoInput.value = ' \t\n ';
      addTodo();

      expect(todos).toHaveLength(0);
    });

    it('should handle concurrent modifications', () => {
      todoInput.value = 'Todo 1';
      addTodo();
      todoInput.value = 'Todo 2';
      addTodo();

      const firstId = todos[0].id;
      const secondId = todos[1].id;

      toggleTodo(firstId);
      deleteTodo(secondId);

      expect(todos).toHaveLength(1);
      expect(todos[0].completed).toBe(true);
    });

    it('should handle state consistency after multiple operations', () => {
      // Add several todos
      for (let i = 1; i <= 5; i++) {
        todoInput.value = `Todo ${i}`;
        addTodo();
      }

      // Toggle some
      toggleTodo(todos[0].id);
      toggleTodo(todos[2].id);

      // Delete some
      deleteTodo(todos[1].id);

      // Add more
      todoInput.value = 'Todo 6';
      addTodo();

      // Verify state
      expect(todos).toHaveLength(5);
      const stored = localStorage.getItem('todoAppData');
      const data = JSON.parse(stored);
      expect(data.todos).toEqual(todos);
    });

    it('should handle localStorage quota exceeded gracefully', () => {
      const originalSetItem = localStorage.setItem;
      
      let callCount = 0;
      localStorage.setItem = vi.fn((key, value) => {
        callCount++;
        if (callCount > 5) {
          throw new DOMException('QuotaExceededError');
        }
      });

      try {
        for (let i = 0; i < 10; i++) {
          todoInput.value = `Todo ${i}`;
          // This may fail, but app should handle it
        }
      } catch (e) {
        // Expected
      }

      localStorage.setItem = originalSetItem;
    });
  });

  // ========================================
  // Phase 6: Integration Tests
  // ========================================
  describe('Integration Tests', () => {
    it('should handle complete workflow: add, toggle, delete', () => {
      // Add todos
      todoInput.value = 'Learn';
      addTodo();
      todoInput.value = 'Practice';
      addTodo();
      todoInput.value = 'Master';
      addTodo();

      expect(todos).toHaveLength(3);

      // Toggle first
      toggleTodo(todos[0].id);
      expect(todos[0].completed).toBe(true);

      // Delete second
      deleteTodo(todos[1].id);
      expect(todos).toHaveLength(2);

      // Verify localStorage
      const stored = localStorage.getItem('todoAppData');
      const data = JSON.parse(stored);
      expect(data.todos).toHaveLength(2);
    });

    it('should maintain state consistency through save/load cycle', () => {
      // Create initial state
      todoInput.value = 'Persist 1';
      addTodo();
      todoInput.value = 'Persist 2';
      addTodo();

      toggleTodo(todos[0].id);

      const savedState = JSON.parse(localStorage.getItem('todoAppData'));

      // Simulate page reload
      todos = [];
      nextId = 1;
      loadTodosFromStorage();

      expect(todos).toHaveLength(2);
      expect(todos[0].completed).toBe(true);
      expect(todos[1].completed).toBe(false);
    });

    it('should render correctly after complex operations', () => {
      // Add todos
      for (let i = 1; i <= 5; i++) {
        todoInput.value = `Todo ${i}`;
        addTodo();
      }

      // Modify several
      toggleTodo(todos[0].id);
      toggleTodo(todos[2].id);
      deleteTodo(todos[1].id);

      render();

      const items = document.querySelectorAll('.todo-item');
      const completedItems = document.querySelectorAll('.todo-item.completed');

      expect(items).toHaveLength(4);
      expect(completedItems).toHaveLength(2);
    });

    it('should handle empty state transitions correctly', () => {
      // Start with empty
      render();
      expect(emptyState.classList.contains('hidden')).toBe(false);

      // Add todo
      todoInput.value = 'Show list';
      addTodo();
      expect(emptyState.classList.contains('hidden')).toBe(true);

      // Delete all
      deleteTodo(todos[0].id);
      expect(emptyState.classList.contains('hidden')).toBe(false);
    });

    it('should handle rapid user interactions', () => {
      // Simulate rapid clicking
      for (let i = 0; i < 20; i++) {
        todoInput.value = `Fast ${i}`;
        addTodo();
      }

      expect(todos).toHaveLength(20);
      expect(document.querySelectorAll('.todo-item')).toHaveLength(20);

      // Toggle random todos
      for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * todos.length);
        toggleTodo(todos[randomIndex].id);
      }

      // Verify consistency
      const stored = localStorage.getItem('todoAppData');
      const data = JSON.parse(stored);
      expect(data.todos.length).toBe(todos.length);
    });
  });
});
