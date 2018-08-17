var fs = require('fs');

(function()
{
    var data = {};
    data.meta = {};
    data.anime = {names:[]};
    data.series = {entries:[]};
    data.Save = function(){
        fs.writeFileSync('data/nyaabot/meta.json', JSON.stringify(data.meta, null, '\t'), 'utf8');
    };

    if (!fs.existsSync('data')) fs.mkdirSync('data'); 
    if (!fs.existsSync('data/nyaabot')) fs.mkdirSync('data/nyaabot'); 

    try
    {
        var content = fs.readFileSync('data/nyaabot/meta.json', 'utf8');
        data.meta = JSON.parse(content);
    }
    catch(error){}

    try
    {
        var content = fs.readFileSync('anime.json', 'utf8');
        data.anime = JSON.parse(content);
    }
    catch(error)
    {
        fs.writeFileSync('anime.json', JSON.stringify(data.anime, null, '\t'), 'utf8');
    }

    try
    {
        var content = fs.readFileSync('series.json', 'utf8');
        data.series = JSON.parse(content);
    }
    catch(error)
    {
        fs.writeFileSync('series.json', JSON.stringify(data.series, null, '\t'), 'utf8');
    }

    module.exports = data;
}());
