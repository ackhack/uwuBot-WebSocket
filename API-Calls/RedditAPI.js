const snoowrap = require('snoowrap');
const fs = require('fs');
const KEYFILE = '../Dependencies/RedditAPI.json';
let reddit_api = undefined;

module.exports = {
    RedditAPI: function (ws, args) {

        if (reddit_api === undefined) {
            ws.send('ERROR: Reddit API is not available.');
            return;
        }

        let contentArgs = args.split(' ');

        reddit_api.getSubreddit(contentArgs[1]).getRandomSubmission().then(submission => {
            ws.send(JSON.stringify(submission));
        }).catch(error => {

            console.log(error.error.reason + '\n');
            ws.send('ERROR: ' + (error.error.reason ? error.error.reason : 'Unknown'));
        });
    }
}

init();

function init() {
    if (fs.existsSync(KEYFILE)) {
        let apiKey = require(KEYFILE);
        reddit_api = new snoowrap({
            userAgent: 'my user-agent',
            clientId: apiKey.clientId,
            clientSecret: apiKey.clientSecret,
            username: apiKey.username,
            password: apiKey.password
        });
    }
}