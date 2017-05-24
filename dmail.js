/*
 * dmail
 *
 * Christian Beedgen (christian@sumologic)
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE', which is part of this source code package.
 */

var execSync = require('child_process').execSync;
var program = require('commander');

//
// Process commandline arguments.
//

program
    .version('0.0.1')
    .option('-u, --user <user>', 'user to log in as to Sumo Logic')
    .option('-p, --password <password>', 'password for logging in')
    .option('-d, --deployment <deployment>', 'name of the Sumo Logic deployment for logging in')
    .option('--dashboard-id <dashboardId>', 'ID of the dashboard to email')
    .option('--mail-user <mailUser>', 'mail user to log in as')
    .option('--mail-password <mailPassword>', 'password of the mail user')
    .option('--mail-host <mailHost>', 'mail host to send email')
    .option('--mail-subject <mailSubject>', 'the subject of the email')
    .option('-s, --sender <sender>', 'address of the sender of the email')
    .option('-r, --receiver <receiver>', 'address of the receiver of the email')
    .option('-t, --timeout <milliseconds>', 'timeout after this many milliseconds')
    .option('--ses', 'send an email with AWS SES')
    .option('--region <region>', 'AWS SES region (default us-east-1')
    .parse(process.argv);

if (!program.user) {
    console.log("User argument (-u, --user) required");
    process.exit();
}
if (!program.password) {
    console.log("Password argument (-p, --password) required");
    process.exit();
}
if (!program.deployment) {
    console.log("Deployment argument (-d, --deployment) required");
    process.exit();
}
if (!program.dashboardId) {
    console.log("Dashboard ID argument (--dashboard-id) required");
    process.exit();
}
if (!program.mailUser) {
    console.log("Mail user argument (--mail-user) required");
    process.exit();
}
if (!program.mailPassword) {
    console.log("Mail password argument (--mail-password) required");
    process.exit();
}
if (!program.ses) {
    program.ses = false;
}else{
    program.ses = true;
}
if (!program.mailHost && !program.ses) {
    console.log("Mail host argument (--mail-host) required");
    process.exit();
}
if (!program.receiver) {
    console.log("Receiver argument (-r, --receiver) required");
    process.exit();
}
if (!program.sender) {
    console.log("Sender argument (-s, --sender) required");
    process.exit();
}
if (!program.mailSubject) {
    console.log("Subject argument (--mail-subject) required");
    process.exit();
}

if (!program.timeout) {
    program.timeout = 900000;
}
if (!program.ext) {
    program.ext = ".png";
}
if (!program.region) {
    program.region = "us-east-1";
}



//
// Echo the arguments.
//

console.log("User:          " + program.user);
console.log("Password:      ********");
console.log("Deployment:    " + program.deployment);
console.log("Dashboard ID:  " + program.dashboardId);
console.log("Mail user:     " + program.mailUser);
console.log("Mail password: ********");
console.log("Mail host:     " + program.mailHost);
console.log("Mail subject:  " + program.mailSubject);
console.log("Receiver:      " + program.receiver);
console.log("Sender:        " + program.sender);
console.log("Timeout:       " + program.timeout);
console.log("SES:           " + program.ses);


//
// Render dashboard.
//

console.log("\nRendering dashboard...\n")
var url = "https://" + program.deployment + "-www.sumologic.net";
if (program.deployment == "us1" || program.deployment == "us1") {
    url = "https://service.sumologic.com"
}
if (program.deployment == "us2") {
    url = "https://service.us2.sumologic.com"
}
if (program.deployment == "dub" || program.deployment == "eu") {
    url = "https://service.eu.sumologic.com"
}
if (program.deployment == "syd" || program.deployment == "au") {
    url = "https://service.au.sumologic.com"
}
var filename = "/tmp/out" + Date.now() + ".png";
var renderCommand = "bin/render_dashboard " +
    program.user + " " + program.password + " " + url + " " + program.dashboardId + " " + filename + " " + program.timeout;
execSync(renderCommand, {stdio: 'inherit'});


//
// Send email.
//

console.log("\nSending email...\n")
if(program.ses){
  var sendCommand = "bin/send_email_ses " +
      program.mailUser + " " + program.mailPassword + " " + filename + " " + url + " " + program.dashboardId + " " +
      program.receiver + " \"" + program.mailSubject + "\" " + program.region + " " + program.sender;
}else{
  var transportSpec = "smtps://" + encodeURIComponent(program.mailUser) + ":" +
      program.mailPassword + "@" + program.mailHost;
  var sendCommand = "bin/send_email " +
      transportSpec + " " + filename + " " + url + " " + program.dashboardId + " " +
      program.receiver + " \"" + program.mailSubject + "\" " + program.sender;
}

execSync(sendCommand, {stdio: 'inherit'});


//
// The end.
//

// DELETE THE TEMP FILE!

console.log("Done!");
