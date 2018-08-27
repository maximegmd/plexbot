var qb = require('qbittorrent-api');
var db = require('./db');

var qbtUrl = "http://localhost:8080";
if(process.env.QBT_URL != undefined)
    qbtUrl = process.env.QBT_URL;

var qbt = qb.connect(qbtUrl, "admin", "adminadmin");

const eztv = require('./eztv')(qbt, db.meta);
const nyaa = require('./nyaa')(qbt, db.meta);

function Scan()
{
	if(db.anime.names != undefined && db.series.entries != undefined)
	{
        var names = db.anime.names.slice();
        var imdbIds = db.series.entries.slice();

        nyaa.DownloadSeries(names).then(() => 
        {
            eztv.DownloadSeries(imdbIds).then(() => 
            {
                console.log("save");

                db.Save();
                    
                // Scan every 30 minutes
                setTimeout(Scan, 30*60*1000);
            });
        });
	}
	else
		console.log("No anime names and/or imdb entries found !");
}

Scan();
