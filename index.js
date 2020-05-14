const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 60001 });
const requireDir = require('require-dir');
const commands = requireDir('./API-Calls');

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        let date = new Date();
        let formatted ="[" + date.getDate() + "." + date.getMonth() + ":" + date.getHours() + "." + date.getMinutes() + "." + date.getSeconds() + "] "
        console.log(formatted + message);

        let contentArgs = message.split(" "); //Split Message for simpler Access
        try {
            commands[contentArgs[0]][contentArgs[0]](ws,message);
        } catch (error) {
            console.log('Command was not Found: ');
            console.log(error);
        }
    });
});