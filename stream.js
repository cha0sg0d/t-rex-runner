require('dotenv').config();

var ethers = require("ethers");

var url = `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_KEY}`;
var httpUrl = `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`;

var time = 0;
var init = function () {
  var customWsProvider = new ethers.providers.WebSocketProvider(url);
  var httpProvider = new ethers.providers.JsonRpcProvider(httpUrl);

  httpProvider.getBlockNumber().then((number) => {
    console.log("first block", number);
    customWsProvider.getBlock(number).then(function (block) {
        console.log(JSON.stringify(block));
      });
  });

// Log time every second
  setInterval(() => console.log(time++), 1000);

  customWsProvider.on("block", (number) => {
    console.log("block", number);

    customWsProvider.getBlock(number).then(function (block) {
        console.log(JSON.stringify(block));
    });
  });

  customWsProvider._websocket.on("error", async () => {
    console.log(`Unable to connect to ${ep.subdomain} retrying in 3s...`);
    setTimeout(init, 3000);
  });
  customWsProvider._websocket.on("close", async (code) => {
    console.log(
      `Connection lost with code ${code}! Attempting reconnect in 3s...`
    );
    customWsProvider._websocket.terminate();
    setTimeout(init, 3000);
  });
};

init();