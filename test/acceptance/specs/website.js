const packageJson = require('./../../../build/package.json');

module.exports = {
    'should be up' (browser) {
        browser
            .url('http://localhost:5000')
            .waitForElementVisible('body', 1000)
            .assert.title("Js-Republic")
            .end();
    },

    'should be able to send an email to founders' (browser){
        browser
            .url('http://localhost:5000')
            .waitForElementVisible('body', 1000)
            .setValue('input[name=fullName]', packageJson.name + ' v' + packageJson.version)
            .setValue('input[name=mail]', packageJson.name)
            .submitForm('#contact-us')
            .pause(2000)
            .assert.containsText('#contact-us button .content', 'Envoyé !');
    }
};