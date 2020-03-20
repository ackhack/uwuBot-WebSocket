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
    constructor(name,champion,rank,playerlevel) {
        this.name = name;
        this.champion = champion;
        this.rank = rank;
        this.playerlevel = playerlevel;
    }
}

module.exports = {
    LeagueAPI: async function (ws, args) {

        let user = await api.Summoner.getByName(args.substring(args.indexOf(' ')), 'EUW1');

        let currentMatch = await api.Spectator.activeGame(user.response.id, 'EUW1');

        if (SavedGames[currentMatch.response.gameId] != undefined) {
            ws.send(SavedGames[currentMatch.response.gameId]);
            return;
        }
        
        let Players = [];

        for (let par of currentMatch.response.participants) {        

            let champ = twisted.Constants.Champions[par.championId];
            let pl = await api.Summoner.getByName(par.summonerName,'EUW1');
            let px = await api.League.bySummoner(par.summonerId,'EUW1');  
            let rank = px.response[0].tier + ' ' + px.response[0].rank;
                     
            Players.push(new Player(par.summonerName,champ,rank,pl.response.summonerLevel))
        }
        
        SavedGames[currentMatch.response.gameId] = Players;

        ws.send([currentMatch.response.gameId,Players]);
    }
}