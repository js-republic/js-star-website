## JS-Republic website

# Getting started

Before all, You will need some environment variables to run correctly the server. So please ensure you have :
`RECAPTCHA_SECRET_KEY`
`USERMAIL_ID`
`USERMAIL_PASSWORD`

You can find the production values of these variables on this [Google doc](https://docs.google.com/a/galactic-republic.com/document/d/1rZ2H5BJzhRn0bXKewABT6CPLJeDBE4JcjVU8xs8tjCY/edit?usp=sharing).

Then, install dependencies :
`npm install`

Then, build all assets a first time :
`gulp build`

Finally, to run the server, with nodemon and browsersync :
`gulp`

 