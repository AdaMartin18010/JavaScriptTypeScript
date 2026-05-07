const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
  } else if (req.url === '/api/hello' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<p>Hello from server! Time: ' + new Date().toISOString() + '</p>');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
