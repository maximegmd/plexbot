const https = require('https');

module.exports = function(qbt, meta)
{
    var module = {};

    function DownloadCallback(serie, name, result, page, callback)
    {
        if(page * 100 < serie.torrents_count)
        {
            return DownloadHttps(serie.imdb_id, name, page + 1, result, callback);
        }
        else
        {
/*            var entry = 0;
            while(entry < result.length)
            {
                const obj = result[entry];
                if(obj.filename.includes("720p") == false)
                {
                    result.splice(entry, 1);
                }
                else
                    entry++;
            }
*/
            episode = meta[serie.imdb_id]["episode"];
            season = meta[serie.imdb_id]["season"];

            var tryNext = true;
            while(tryNext)
            {
                tryNext = false;

                // Look for an entry that matches the episode we want
                var found = null;

                const seStr = "S" + season.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + "E" + episode.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});

                for(var entry in result)
                {
                    const obj = result[entry];

                    if((obj.episode == episode && obj.season == season) ||
                        obj.title.includes(seStr))
                    {
                        found = obj;

                        // if the entry is 720p exit out and don't look for another quality
                        if(found.filename.includes("720p") == true)
                        {
                            break;
                        }
                        // Remove this entry from the results
                        result.splice(entry, 1);

                        break;
                    }
                }

                if(found != null)
                {
                    if(process.env.QBT_URL != undefined)
                            qbt.add(obj.magnet_url, '/downloads/series/' + name + "/Season " + season);
                    else
                        console.log(obj.magnet_url + "\n" + '/downloads/series/' + name + "/Season " + season);

                    tryNext = true;
                    episode++;
                    
                    // Save the next season/episode we want to download
                    meta[serie.imdb_id] = {'season': season, 'episode': episode};
                }

                if(tryNext == false && episode != 1)
                {
                    season++;
                    episode = 1;  

                    tryNext = true;
                }
            }

            callback();
        }  
    }

    function DownloadHttps(id, name, page, result, callback)
    {
        return https.get("https://eztv.ag/api/get-torrents?limit=100&imdb_id=" + id + "&page=" + page, (resp) =>
        {
            let data = '';
            
            resp.on('data', (chunk) => {
                data += chunk;
            });
            
            return resp.on('end', () => {
                var serie = JSON.parse(data);
                for(const torrent in serie.torrents)
                    result.push(serie.torrents[torrent]);      

                DownloadCallback(serie, name, result, page, callback);
            });
            
        });
    }

    function DownloadEpisodes(id, name)
    {
        return new Promise(function(resolve, reject) 
        {
            return DownloadHttps(id, name, 1, [], resolve);
        });
    }

    module.DownloadSeries = function(imdbIds)
    {
        return new Promise(function(resolve, reject) 
        {
            const entry = imdbIds[0];

            if(meta[entry.id] == undefined)
            {
                meta[entry.id] = {'season': 1, 'episode': 1};
            }

            DownloadEpisodes(entry.id, entry.name).then(() =>
            {
                imdbIds.splice(0,1);

                if(imdbIds.length == 0)
                {
                    resolve();

                    return 0;
                }

                module.DownloadSeries(imdbIds).then(() => { resolve(); });
            });
        });
    }

    return module;
};
