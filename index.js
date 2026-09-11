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
  console.log('[EaglerProxy] Client attempting connection from:', req.socket.remoteAddress);

  const tcpClient = new net.Socket();
  
  tcpClient.connect(TARGET_SERVER.port, TARGET_SERVER.host, () => {
    console.log('[EaglerProxy] Connected successfully to Shockbyte backend target.');
  });

  // Handle incoming data from the Eaglercraft Browser Client
  ws.on('message', (message, isBinary) => {
    if (tcpClient.writable) {
      // Pass the frame directly to the backend server
      tcpClient.write(message);
    }
  });

  // Handle incoming data from the Shockbyte Backend Server
  tcpClient.on('data', (data) => {
    if (ws.readyState === ws.OPEN) {
      // Send the packets back to the browser client as binary data
      ws.send(data, { binary: true });
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`[EaglerProxy] Browser client disconnected. Code: ${code}`);
    tcpClient.end();
  });

  tcpClient.on('close', () => {
    console.log('[EaglerProxy] Shockbyte backend closed the TCP socket.');
    if (ws.readyState === ws.OPEN) {
      ws.close();
    }
  });

  tcpClient.on('error', (err) => {
    console.error('[EaglerProxy] Shockbyte TCP error:', err.message);
    ws.close();
  });

  ws.on('error', (err) => {
    console.error('[EaglerProxy] Browser WebSocket error:', err.message);
    tcpClient.destroy();
  });
});

console.log(`[EaglerProxy] Secure WebSocket proxy active, listening on port ${PORT}`);
