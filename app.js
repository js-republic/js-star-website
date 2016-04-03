const express = require("express");
const bodyParser = require('body-parser');
const compress = require('compression');
const articlesRoute = require('./server/articles');
const formListRoute = require('./server/formList');
const contactUsRoute = require('./server/contactUs');
const asciiRoute = require('./server/ascii');

const port = process.env.PORT || 3000;

const app = express();
app.use(compress());
app.use(bodyParser.json());
app.use('/', express.static(`${__dirname}/public`));
app.disable('x-powered-by');


app.post('/contact-us', contactUsRoute);
app.get('/ascii-content', asciiRoute);
app.get('/form-lists', formListRoute);
app.get('/articles', articlesRoute);
app.get('*', (req, res)=> res.redirect('../'));


app.listen(port, ()=> {
    console.log(`Js-Republic website listening on port ${port}`);
    if (process.env.NODE_ENV === "production") {
        console.log('ENVIRONEMENT VARIABLES :');
        console.log(process.env);
    }
});