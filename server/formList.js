const formLists = require('./form-lists');

module.exports = (req, res)=> {
    res.json(formLists);
};