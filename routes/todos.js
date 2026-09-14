const express = require('express');
const router = express.Router();

// In-memory todo storage
let todos = [
  { id: 1, title: 'Learn Node.js', completed: true, createdAt: new Date() },
  { id: 2, title: 'Build an API', completed: false, createdAt: new Date() },
  { id: 3, title: 'Deploy to production', completed: false, createdAt: new Date() }
];

let nextId = 4;

// Get all todos
router.get('/', (req, res) => {
  const { completed } = req.query;
  
  let filtered = todos;
  if (completed !== undefined) {
    filtered = todos.filter(todo => todo.completed === (completed === 'true'));
  }

  res.json({
    total: filtered.length,
    todos: filtered
  });
});

// Get specific todo
router.get('/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.json(todo);
});

// Create todo
router.post('/', (req, res) => {
  const { title, completed } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }

  const newTodo = {
    id: nextId++,
    title: title.trim(),
    completed: completed || false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// Update todo
router.put('/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const { title, completed } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }
    todo.title = title.trim();
  }

  if (completed !== undefined) {
    todo.completed = Boolean(completed);
  }

  todo.updatedAt = new Date();

  res.json(todo);
});

// Delete todo
router.delete('/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const deleted = todos.splice(index, 1);
  res.json({ message: 'Todo deleted', deleted: deleted[0] });
});

// Delete all completed todos
router.delete('/completed/all', (req, res) => {
  const initialLength = todos.length;
  todos = todos.filter(t => !t.completed);
  const deleted = initialLength - todos.length;

  res.json({ message: `Deleted ${deleted} completed todos`, count: deleted });
});

module.exports = router;
