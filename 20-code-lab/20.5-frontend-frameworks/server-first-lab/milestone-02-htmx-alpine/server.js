const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
  } else if (req.url === '/api/toggle' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<div id="content"><p>Content loaded from server at ' + new Date().toISOString() + '</p></div>');
  } else if (req.url === '/api/form' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const email = params.get('email') || 'unknown';
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<div class="success">Submitted: ${email}</div>`);
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
