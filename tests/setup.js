/**
 * Test setup file
 * Initializes DOM environment and provides test utilities
 */

// Set up DOM with the necessary HTML structure
function setupDOM() {
  document.documentElement.innerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Todo List App</title>
    </head>
    <body>
      <div class="container">
        <header class="app-header">
          <h1>My Todo List</h1>
        </header>

        <main class="app-main">
          <div class="input-section">
            <form id="todoForm" class="todo-form">
              <input 
                type="text" 
                id="todoInput" 
                class="todo-input" 
                placeholder="Add a new todo..." 
                autocomplete="off"
              >
              <button type="submit" class="todo-btn">Add</button>
            </form>
          </div>

          <div class="list-section">
            <ul id="todoList" class="todo-list"></ul>
            <div id="emptyState" class="empty-state">
              <p>No todos yet. Add one to get started!</p>
            </div>
          </div>
        </main>
      </div>
    </body>
    </html>
  `;
}

// Initialize DOM before each test
beforeEach(() => {
  setupDOM();
  // Clear localStorage before each test
  localStorage.clear();
  // Reset global state
  delete window.todos;
  delete window.nextId;
});

// Clean up after each test
afterEach(() => {
  localStorage.clear();
});
