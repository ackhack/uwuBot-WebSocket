const RiotAPIKey = require('../Dependencies/RiotAPIKey.json'); //Has RiotAPIKey under RiotAPIKey.key
const twisted = require('twisted');
const api = new twisted.LolApi({
    rateLimitRetry: true,
    rateLimitRetryAttempts: 1,
    concurrency: undefined,
    key: RiotAPIKey.key,
});
var SavedGames = {};

class Player {
    constructor(name, champion, rank, playerlevel) {
        this.name = name;
        this.champion = champion;
        this.rank = rank;
        this.playerlevel = playerlevel;
    }
}

module.exports = {
    LeagueAPI: async function (ws, args) {

        let name = args.substring(args.indexOf(' ')+1);

        let user = await api.Summoner.getByName(name, 'EUW1').catch(error => {
            ws.send('ERROR: Summoner not found');
            return;
        });

        if (!user.response) {
            ws.send('ERROR: Summoner not found');
            return;
        }

        let currentMatch = await api.Spectator.activeGame(user.response.id, 'EUW1').catch(error => {
            ws.send('ERROR: No active Game');
            return;
        });

        if (!currentMatch.response) {
            ws.send('ERROR: No active Game');
            return;
        }

        let Players = [];

        for (let par of currentMatch.response.participants) {

            let champ = twisted.Constants.Champions[par.championId];
            champ = champ.charAt(0) + champ.substring(1,champ.length).toLowerCase(); //First Letter UpperCase
            champ = champ.replace(/_(.)/g,function (m) {return ' ' + m.charAt(1).toUpperCase()}); //Replace '_l' with ' L'

            let pl = await api.Summoner.getByName(par.summonerName, 'EUW1').catch(error => {
                ws.send('ERROR');
                return;
            });;
            let px = await api.League.bySummoner(par.summonerId, 'EUW1').catch(error => {
                ws.send('ERROR');
                return;
            });;

            var rank = 'Unranked';
            if (px.response[0] != undefined) {
                rank = px.response[0].tier.charAt(0) + px.response[0].tier.substring(1,px.response[0].tier.length).toLowerCase() + ' ' + px.response[0].rank;
            }

            Players.push(new Player(par.summonerName, champ, rank, 'lvl ' + pl.response.summonerLevel))
        }

        SavedGames[currentMatch.response.gameId] = Players;

        ws.send(JSON.stringify([currentMatch.response.gameId,Players,name]));
    }
}