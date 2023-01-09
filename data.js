require('dotenv').config();

const WebSocket = require('ws')
const { ethers } = require("ethers");
const WS_URL = `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_KEY}`; 

const ws = new WebSocket(WS_URL);

// Vanilla
ws.on('open', function open() {
ws.send('{"jsonrpc":"2.0", "id": 1, "method": "eth_subscribe", "params": ["newHeads"]}');
// ws.send('{"jsonrpc":"2.0", "id": 1, "method": "eth_subscribe", "params": ["logs", {"topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]}]}');
});
ws.on('message', function message(data) {
console.log('received: %s', data);
});

