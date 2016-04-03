const fs = require('fs');
const filename = "./server/ascii.txt";

module.exports = (req, res) => {
    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) {
            console.error("Fail to read ascii file");
            console.error(err);
            return res.sendStatus(500);
        }
        else {
            res.send(data);
        }
    });
};