const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 60001 });
const requireDir = require('require-dir');
const commands = requireDir('./API-Calls');

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log(message);

        let contentArgs = message.split(" "); //Split Message for simpler Access
        try {
            commands[contentArgs[0]][contentArgs[0]](ws,message);
        } catch (error) {
            console.log('Command was not Found: ');
            console.log(error);
        }
    });
});