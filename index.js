const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 60001 });
const requireDir = require('require-dir');
const commands = requireDir('./API-Calls');

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log(message);

        let contentArgs = message.split(" "); //Split Message for simpler Access
        let command = contentArgs[0] + '.' + contentArgs[0];
        try {
            executeFunctionByName(command,commands,ws,message);
        } catch (error) {
            console.log('Command was not Found:');
            console.log(error);
        }

    });
});

function executeFunctionByName(functionName, context /*, args */) {    //Executes functionName at context with args
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
}