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
    .option('-r, --receiver <receiver>', 'address of the receiver of the email')
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
if (!program.mailHost) {
    console.log("Mail host argument (--mail-host) required");
    process.exit();
}
if (!program.receiver) {
    console.log("Receiver argument (-r, --receiver) required");
    process.exit();
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
console.log("Receiver:      " + program.receiver);


//
// Render dashboard.
//

console.log("\nRendering dashboard...\n")
var url = "https://" + program.deployment + "-www.sumologic.net";
var filename = "/tmp/out" + Date.now() + ".png";
var renderCommand = "npm run-script render " +
    program.user + " " + program.password + " " + url + " " + program.dashboardId + " " + filename;
execSync(renderCommand, {stdio: 'inherit'});


//
// Send email.
//

console.log("\nSending email...\n")
var transportSpec = "smtps://" + encodeURIComponent(program.mailUser) + ":" +
    program.mailPassword + "@" + program.mailHost;
var sendCommand = "npm run-script send " +
    transportSpec + " " + filename + " " + url + " " + program.dashboardId + " " + program.receiver;
execSync(sendCommand, {stdio: 'inherit'});


//
// The end.
//

// DELETE THE TEMP FILE!

console.log("Done!");