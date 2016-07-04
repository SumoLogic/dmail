//
// Send the dmail.
//

if (process.argv.length != 7) {
    console.log("Arguments: [transport-spec] [filename] [url] [dashboard ID] [receiver]");
    process.exit(-1);
}

var transportSpec = process.argv[2];
var filename = process.argv[3];
var url = process.argv[4];
var dashboardId = process.argv[5];
var receiver = process.argv[6];

var dashboardUrl = url + "/ui/dashboard.html?f=" + + dashboardId + "&t=r";

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport(transportSpec);
var uniqueID = "schnitzel" + Date.now();
var mailOptions = {
    from: '"Christian Beedgen" <christian@sumologic.com>',
    to: receiver,
    subject: '[DMAIL] Dashboard ' + dashboardUrl,
    text: dashboardUrl + "\n\n" + 'Please enable HTML in your email client.\n',
    html: 'Dashboard <a href="' + dashboardUrl + '">' + dashboardUrl + '</a>' +
    '<br><br>' +
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

