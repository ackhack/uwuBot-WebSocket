const api = require('twitch-api-v5');
const TwitchID = require('../Dependencies/TwitchID.json');

api.clientID = TwitchID.key;

module.exports = {
    TwitchAPI: function (ws, args) {

        let contentArgs = args.split(' ');

        api.users.usersByName({ users: contentArgs[1] }, (err, res) => {
            if (err) {
                console.log(err);
                ws.send('Offline ' + contentArgs[1]);
            } else {

                api.streams.live({ channel: res.users[0]._id }, (err1, res) => {

                    if (err1) {
                        console.log(err1);
                        ws.send('Offline ' + contentArgs[1]);
                    } else {
                        
                        if (res.streams.length > 0) {
                            ws.send('Online ' + contentArgs[1]);
                        } else {
                            ws.send('Offline ' + contentArgs[1]);
                        }
                    }
                })
            }
        })
    }
}