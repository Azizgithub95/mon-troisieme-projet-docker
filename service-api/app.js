import http from 'http';

const server = http.createServer((req, res) => {
  res.end('Hello from the API!');
});

server.listen(4000, () => console.log('API listening on :4000'));
