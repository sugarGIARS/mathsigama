/* 临时 CONNECT 代理：把 github.com:443 转到能连通的 GitHub 节点 */
const net = require('net');
const http = require('http');

const TARGET = process.argv[2] || '140.82.112.3';
const PORT = parseInt(process.argv[3] || '7899', 10);

const server = http.createServer((req, res) => { res.writeHead(405); res.end(); });

server.on('connect', (req, socket) => {
  const host = (req.url || '').split(':')[0];
  socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
  const up = net.connect(443, TARGET, () => {
    socket.pipe(up);
    up.pipe(socket);
  });
  up.on('error', () => socket.destroy());
  socket.on('error', () => up.destroy());
});

server.listen(PORT, '127.0.0.1', () => console.log('proxy 127.0.0.1:' + PORT + ' -> ' + TARGET + ':443'));
