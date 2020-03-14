const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 60001 });
const snoowrap = require('snoowrap');
const apiKey = require('./Dependencies/RedditAPI.json');
const redditAPI = new snoowrap({
    userAgent: 'my user-agent',
    clientId: apiKey.clientId,
    clientSecret: apiKey.clientSecret,
    username: apiKey.username,
    password: apiKey.password
});

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    let contentArgs = message.split(" "); //Split Message for simpler Access
    switch (contentArgs[0]) {
        case 'Reddit':
            redditAPI.getSubreddit(contentArgs[1]).getRandomSubmission().then(submission => {

                ws.send(JSON.stringify(submission));

            }).catch(error => {
                ws.send('ERROR');
                console.log(error);
            });
            break;
    }
  });
});