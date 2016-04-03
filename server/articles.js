const unirest = require("unirest");
const xml2js = require("xml2js");
const utils = require('./utils');

const rssFeedUrl = 'http://blog.js-republic.com/feed/';
const NB_ARTICLES = 3;

module.exports = (req, res) => {
    unirest
        .get(rssFeedUrl)
        .headers({'Accept': 'application/xml'})
        .end(response=> {
            if (response.code !== 200) {
                console.error(`Rss feed respond with the code ${response.code}`);
                console.error(response);
                return res.sendStatus(500);
            }
            xml2js.parseString(response.body, (err, result) => {
                if (err) {
                    console.error(`Rss feed is unparsable ${err}`);
                    return res.send(500);
                }
                const channel = utils._getSafe(result, "rss.channel")[0];
                const itemsFormatted = channel && channel.item
                        .slice(0, NB_ARTICLES)
                        .map((item)=> ({
                            title: item.title[0],
                            link: item.link[0]
                        })
                    );
                res.json(itemsFormatted);
            });
        });
};