//
// Send the dmail.
//

if (process.argv.length < 4) {
    console.log("Arguments: [transport-spec] [filename]");
    process.exit(-1);
}

var transportSpec = process.argv[2];
var filename = process.argv[3];

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport(transportSpec);
var mailOptions = {
    from: '"Christian Beedgen" <christian@sumologic.com>',
    to: 'raychaser@gmail.com',
    subject: 'Dashboard',
    text: 'Please enable HTML in your email client',
    html: 'Dashboard ID: ' +
    '<br><img src="cid:unique@kreata.ee"/>',
    attachments: [{
        filename: filename,
        path: filename,
        cid: 'unique@kreata.ee'
    }]
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});

