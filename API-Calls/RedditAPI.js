const snoowrap = require('snoowrap');
const fs = require('fs');
const KEYFILE = '../Dependencies/RedditAPI.json';
let valid = false;
let reddit_api = undefined;

module.exports = {
    RedditAPI: function (ws, args) {

        if (!valid) {
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

function init() {
    if (!fs.existsSync(KEYFILE.slice(1))) return;

    let keyFile = require(KEYFILE);
    if (keyFile.clientId == "" || keyFile.clientId == undefined) return;
    if (keyFile.clientSecret == "" || keyFile.clientSecret == undefined) return;
    if (keyFile.username == "" || keyFile.username == undefined) return;
    if (keyFile.password == "" || keyFile.password == undefined) return;

    try {
        reddit_api = new snoowrap({
            userAgent: 'my user-agent',
            clientId: keyFile.clientId,
            clientSecret: keyFile.clientSecret,
            username: keyFile.username,
            password: keyFile.password
        });
        console.log("Reddit API is ready");
        valid = true;
    } catch (err) {
        console.log(err);
    }
}