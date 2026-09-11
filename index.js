const { WebSocketServer } = require('ws');
const net = require('net');

const PORT = process.env.PORT || 10000;
const wss = new WebSocketServer({ port: PORT });

// Your Shockbyte Server details
const TARGET_SERVER = {
  host: '157.85.94.60',
  port: 20929
};

wss.on('connection', (ws, req) => {
  console.log('Player connected via proxy from:', req.socket.remoteAddress);

  const tcpClient = new net.Socket();
  tcpClient.connect(TARGET_SERVER.port, TARGET_SERVER.host, () => {
    console.log('Successfully connected to Shockbyte backend.');
  });

  ws.on('message', (message) => {
    if (tcpClient.writable) {
      tcpClient.write(message);
    }
  });

  tcpClient.on('data', (data) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  });

  ws.on('close', () => {
    console.log('Player disconnected.');
    tcpClient.end();
  });

  tcpClient.on('close', () => {
    ws.close();
  });

  tcpClient.on('error', (err) => {
    console.error('Shockbyte TCP error:', err.message);
    ws.close();
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
    tcpClient.destroy();
  });
});

console.log(`Proxy running on port ${PORT}`);
