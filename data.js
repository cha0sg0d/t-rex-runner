const WS_URL = `wss://mainnet.infura.io/ws/v3/KEY_HERE`; 


function onDocumentLoad() {
    console.log("data.js loaded...");

    let socket = new WebSocket(WS_URL);

    socket.onopen = function(e) {
        socket.send('{"jsonrpc":"2.0", "id": 1, "method": "eth_subscribe", "params": ["newHeads"]}');
      };
      
      socket.onmessage = function(event) {
        console.log(`[message] Data received from server: ${event.data}`);
        const result = JSON.parse(event.data);
        console.log("result", result);
        if(result.params.result.number) {
            const blockNumber = parseInt(result.params.result.number, 16);
            console.log("block number", blockNumber);
            let elt = document.getElementById("eth");
            elt.innerHTML = blockNumber;
        }
        
       //  
      };
      
      socket.onclose = function(event) {
        if (event.wasClean) {
          alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
          // e.g. server process killed or network down
          // event.code is usually 1006 in this case
          alert('[close] Connection died');
        }
      };
      
      socket.onerror = function(error) {
        alert(`[error]`);
      };
    }

document.addEventListener('DOMContentLoaded', onDocumentLoad);


