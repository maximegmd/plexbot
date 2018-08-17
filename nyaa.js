const {si} = require('nyaapi');

module.exports = function(qbt, meta) 
{   
    var module = {};

    function DownloadEpisodes(name, season, episode)
    {
        return si.searchByUser('HorribleSubs', name).then((data) =>
        {
            // Remove all entries that are not 1080p
            var entry = 0;
            while(entry < data.length)
            {
                const obj = data[entry];
                if(obj.name.includes("1080p") == false)
                {
                    data.splice(entry, 1);
                }
                else
                    entry++;
            }

            var tryNext = true;
            var nextEpisodeAttemps = 0;
            while(tryNext)
            {
                tryNext = false;

                const plexFriendlyName = name.split(' ').join('_') + '/Season ' + season;
                const expectedName = name + ' - ' + episode.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
                const expectedNameSeason = name + (season != 0 ? ' S' + season : '') + ' - ' + episode.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
                
                for(var entry in data)
                {
                    const obj = data[entry];

                    var extractedEnd = obj.name.split(' - ');
                    if(extractedEnd.length < 2)
                        continue;

                    extractedEnd = extractedEnd[extractedEnd.length - 1];
                    episodeNumber = extractedEnd.split(' ');
                    if(episodeNumber.length < 2)
                        continue;

                    episodeNumber = parseInt(episodeNumber[0]);
                    if(episodeNumber == episode)
                    {
                        if(obj.name.includes(expectedName) == false && season == 1)
                            continue;
                        else if(obj.name.includes(expectedNameSeason) == false && season != 1)
                            continue;
                        
                        // Remove this entry from the results
                        data.splice(entry, 1);

                        if(process.env.QBT_URL != undefined)
                            qbt.add(obj.links.magnet, '/downloads/anime/' + plexFriendlyName);
                        else
                            console.log(obj.name);
                        
                        tryNext = true;
                        episode++;
                        nextEpisodeAttemps = 0;
                        
                        // Save the next season/episode we want to download
                        meta[name] = {'season': season, 'episode': episode};

                        break;
                    }
                }

                if(tryNext == false && episode != 1)
                {
                    // Some series skip an episode or two, try the next two episodes then move onto next season
                    if(nextEpisodeAttemps < 2)
                    {
                        nextEpisodeAttemps++;
                        episode++;
                    }
                    else
                    {
                        season++;
                        episode = 1;  
                    }
                    
                    tryNext = true;
                }
            }

            return 0;
        },
        (data) => console.log(data));
    }

    module.DownloadSeries = function(names)
    {
        const name = names[0];

        if(meta[name] == undefined)
        {
            meta[name] = {'season': 1, 'episode': 1};
        }
    
        return DownloadEpisodes(name, meta[name].season, meta[name].episode).then((data) =>
        {
            names.splice(0,1);
    
            if(names.length == 0)
                return 0;
    
            return module.DownloadSeries(names);
        });
    }

    return module;
};