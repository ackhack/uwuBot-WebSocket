const snoowrap = require('snoowrap');
const apiKey = require('../Dependencies/RedditAPI.json');
const redditAPI = new snoowrap({
    userAgent: 'my user-agent',
    clientId: apiKey.clientId,
    clientSecret: apiKey.clientSecret,
    username: apiKey.username,
    password: apiKey.password
});

module.exports = {
    RedditAPI: function(ws,args) {

        let contentArgs = args.split(' ');

        redditAPI.getSubreddit(contentArgs[1]).getRandomSubmission().then(submission => {
            ws.send(JSON.stringify(submission));
        }).catch(error => {
            
            console.log(error.error.reason + '\n');          
            ws.send('ERROR: ' + (error.error.reason ? error.error.reason : 'Unknown'));
        });
    }
}