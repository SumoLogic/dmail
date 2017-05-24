 /*
 * dmail
 *
 * Walid Shaita (walid.shaita@gmail.com)
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE', which is part of this source code package.
 */

//
// Send the dmail.
//

var mailUser = process.argv[2];
var mailPassword = process.argv[3];
var filename = process.argv[4];
var url = process.argv[5];
var dashboardId = process.argv[6];
var sender = process.argv[7];
var receiver = process.argv[8];
var subject = process.argv[9];
var region = process.argv[10];


var dashboardUrl = url + "/ui/dashboard.html?f=" + + dashboardId + "&t=r";

var nodemailer = require('nodemailer');
var aws = require('aws-sdk');

var config = new aws.Config({
  accessKeyId: mailUser, secretAccessKey: mailPassword, region: region
});

aws.config = config

var transporter = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: '2010-12-01'
    }),
    tls: { rejectUnauthorized: false }
});

console.log("The email will be sent by " + sender + " and received by "+receiver);

//var transporter = nodemailer.createTransport(transportSpec);
var uniqueID = "schnitzel" + Date.now();
var mailOptions = {
    from: sender,
    to: receiver,
    subject: subject,
    text: dashboardUrl + "\n\n" + 'Please enable HTML in your email client.\n',
    html: '<a href="' + dashboardUrl + '">' + dashboardUrl + '</a>' +
    '<br>iuewgfuiegrufiergeirugefiugeirugfeirufgiuegriu<br>' +
    '<img src="cid:' + uniqueID + '"/>',
    attachments: [{
        filename: filename,
        path: filename,
        cid: uniqueID
    }]
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
