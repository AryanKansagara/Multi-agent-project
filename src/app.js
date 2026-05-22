/**
 * Todo List App - JavaScript Implementation
 * Handles all core functionality: adding, displaying, toggling, and deleting todos
 */

// ========================================
// State Management
// ========================================
let todos = [];
let nextId = 1;

// ========================================
// DOM Elements (cached for performance)
// ========================================
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');

// ========================================
// Initialize App
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Load todos from localStorage if available
    loadTodosFromStorage();
    // Render initial state
    render();
    // Set focus on input field
    todoInput.focus();
});

// ========================================
// Event Listeners
// ========================================

/**
 * Form submission handler for adding new todos
 */
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo();
});

// ========================================
// Core Functions
// ========================================

/**
 * Add a new todo to the list
 * - Validates input (rejects empty/whitespace strings)
 * - Creates todo object with unique ID
 * - Adds to state and clears input
 */
function addTodo() {
    const input = todoInput.value.trim();

    // Validation: reject empty or whitespace-only input
    if (!input) {
        todoInput.focus();
        return;
    }

    // Create todo object with unique ID and title
    const todo = {
        id: nextId++,
        title: input,
        completed: false,
        createdAt: new Date().toISOString(),
    };

    // Add to todos state
    todos.push(todo);

    // Clear input field after submission
    todoInput.value = '';

    // Save to localStorage
    saveTodosToStorage();

    // Re-render the UI
    render();

    // Focus back on input for convenience
    todoInput.focus();
}

/**
 * Toggle completion status of a todo
 * Updates the completed state and re-renders UI
 */
function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodosToStorage();
        render();
    }
}

/**
 * Delete a todo from the list
 */
function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    saveTodosToStorage();
    render();
}

// ========================================
// Rendering
// ========================================

/**
 * Main render function
 * - Clears the todo list
 * - Renders each todo as a list item
 * - Shows/hides empty state based on list length
 * - Updates UI on state changes
 */
function render() {
    // Clear the list
    todoList.innerHTML = '';

    // Render each todo as a list item
    todos.forEach((todo) => {
        const li = createTodoElement(todo);
        todoList.appendChild(li);
    });

    // Show/hide empty state
    if (todos.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }
}

/**
 * Create a single todo list item element
 * Includes checkbox, text, and delete button
 */
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    if (todo.completed) {
        li.classList.add('completed');
    }

    // Checkbox for toggling completion
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`);
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    // Text content
    const textSpan = document.createElement('span');
    textSpan.className = 'todo-text';
    textSpan.textContent = todo.title;
    // Prevent text selection on double-click
    textSpan.addEventListener('click', () => checkbox.focus());

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'todo-delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', `Delete "${todo.title}"`);
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    // Assemble the element
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);

    return li;
}

// ========================================
// Storage Persistence
// ========================================

/**
 * Save todos array to localStorage
 * Stores todos as JSON string with metadata
 */
function saveTodosToStorage() {
    const data = {
        todos: todos,
        nextId: nextId,
    };
    localStorage.setItem('todoAppData', JSON.stringify(data));
}

/**
 * Load todos from localStorage
 * Restores state and nextId for proper ID generation
 */
function loadTodosFromStorage() {
    const stored = localStorage.getItem('todoAppData');
    if (stored) {
        try {
            const data = JSON.parse(stored);
            todos = data.todos || [];
            nextId = data.nextId || (todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1);
        } catch (e) {
            console.error('Failed to load todos from storage:', e);
            // Fall back to empty state
            todos = [];
            nextId = 1;
        }
    }
}
