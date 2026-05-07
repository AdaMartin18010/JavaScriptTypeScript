const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

let todos = [{ id: 1, title: 'Learn TALL Stack', done: false }];

app.get('/', (req, res) => {
  res.send(renderPage(todos));
});

app.post('/todos', (req, res) => {
  const title = req.body.title;
  if (title) todos.push({ id: Date.now(), title, done: false });
  res.send(renderTodoList(todos));
});

app.post('/todos/:id/toggle', (req, res) => {
  const todo = todos.find(t => t.id == req.params.id);
  if (todo) todo.done = !todo.done;
  res.send(renderTodoList(todos));
});

app.listen(3000, () => console.log('TALL Stack at http://localhost:3000'));

function renderTodoList(todos) {
  return todos.map(t => `
    <li style="display:flex;gap:8px;padding:4px 0;">
      <form hx-post="/todos/${t.id}/toggle" hx-target="#todo-list" style="display:inline;">
        <button type="submit" style="text-decoration:${t.done?'line-through':'none'};">${t.title}</button>
      </form>
    </li>
  `).join('');
}

function renderPage(todos) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>TALL Stack Lab M3</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/htmx.org@2.0.0"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="p-8 max-w-md mx-auto">
  <h1 class="text-2xl font-bold mb-4">M3: TALL Stack</h1>
  <form hx-post="/todos" hx-target="#todo-list" class="flex gap-2 mb-4">
    <input name="title" placeholder="New todo" required class="border p-2 flex-1 rounded" />
    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
  </form>
  <ul id="todo-list" class="list-disc pl-5">${renderTodoList(todos)}</ul>
</body>
</html>`;
}
