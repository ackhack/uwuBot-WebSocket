const RiotAPIKey = require('./Dependencies/RiotAPIKey.json'); //Has RiotAPIKey under RiotAPIKey.key
let LeagueAPI = require('leagueapiwrapper');
LeagueAPI = new LeagueAPI(RiotAPIKey.key, Region.EUW);

module.exports = {
    LeagueAPI: function (ws, args) {
        
        name = args.substring(10);

        LeagueAPI.getSummonerByName(name)
            .then(async function (accountObject) {
                return await LeagueAPI.getActiveGames(accountObject);

            }).catch()
            .then(function (activeGames) {
                ws.send(JSON.stringify(activeGames));
            })
            .catch(error => {
                ws.send('ERROR');
                console.log(error);
            });
    }
}