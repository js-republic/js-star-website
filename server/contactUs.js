const unirest = require("unirest");
const nodemailer = require("nodemailer");
const formLists = require("./form-lists");
const requestIp = require('request-ip');

module.exports = (req, res)=> {
    if (!isContainsAllProperties(req)) {
        console.info('The request does not contain all properties');
        return res.sendStatus(400);
    }
    if (!process.env.USERMAIL_FROM || !process.env.USERMAIL_PASSWORD) {
        console.error(`User mail's credentials are not set properly | id:${process.env.USERMAIL_FROM} pass:${process.env.USERMAIL_PASSWORD}`);
        return res.sendStatus(500);
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.USERMAIL_FROM || '',
            pass: process.env.USERMAIL_PASSWORD || ''
        }
    });

    transporter.sendMail(mailOptions(req), (error) => {
        if (error) {
            console.error("Gmail SMTP responds:");
            console.error(error);
            return res.sendStatus(500);
        }
        res.sendStatus(200);
    });
};

function isContainsAllProperties(req) {
    return req.body.about
        && req.body.fullName
        && req.body.intention
        && req.body.mail
        && req.body.salutation;
}

function mailOptions(req) {
    return {
        from: process.env.USERMAIL_FROM,
        to: process.env.USERMAIL_TO || 'founders+contact-us@js-republic.com',
        subject: `[JS-Republic website] ${req.body.fullName} nous contact !`,
        html: mailContent(req)
    };
}

function mailContent(req) {
    return `Hello JS-Republic !
    <br/>
    Je voulais juste vous dire que ${formLists.intentions[req.body.intention]}. Je suis
    ${req.body.fullName} et vous pouvez me joindre par mail sur
    <a href="mailto:${req.body.mail}">${req.body.mail}</a>.
    <br/>
    Je souhaite parler avec vous ${formLists.abouts[req.body.about]}.
    ${formLists.salutations[req.body.salutation]}.
    <br/>
    From IP address : ${requestIp.getClientIp(req)}`;
}