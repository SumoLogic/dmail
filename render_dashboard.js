/*
 * dmail
 *
 * Christian Beedgen (christian@sumologic)
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE', which is part of this source code package.
 */

//
// Some constants.
//

var DOCUMENT_WIDTH = 1024;
var DOCUMENT_HEIGHT = 3000;


//
// Create the Casper environment.
//

var casper = require('casper').create({
    verbose: true,
    logLevel: 'debug',
    viewportSize: {
        width: DOCUMENT_WIDTH,
        height: DOCUMENT_HEIGHT
    }
});


//
// Get the commandline arguments.
//

var system = require('system');
var args = system.args;
if (args.length != 9) {
    casper.log("Arguments: [username] [password] [url] [dashboard-id] [output-filename]", "error");
    casper.exit();
}

var username = args[4];
var password = args[5];
var url = args[6];
var dashboardId = args[7];
var filename = args[8];
casper.log("Username    : " + username);
casper.log("Password    : ********");
casper.log("URL: " + url);
casper.log("Dashboard ID: " + dashboardId);
casper.log("Filename    : " + filename);


//
// Setup Casper options.
//

casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)');
casper.options.waitTimeout = 5 * 60000;


//
// Hook up request & response monitoring.
//

var removedSIDs = {};
var addedSIDs = {};

casper.options.onResourceRequested = function (C, requestData, networkRequest) {

    function parseSIDs(s) {
        var re = /sid=(.*?)(&|$)/g;
        var match;
        var sids = [];
        while (match = re.exec(s)) {
            sids.push(match[1]);
        }
        return sids;
    }

    // casper.log('[DMAIL]     >>>> Request to: ' + requestData.url, 'debug');
    try {
        if (requestData.url.indexOf('sumologic') != -1) {
            if (requestData.url.indexOf('sessionids') != -1) {
                var sids = parseSIDs(requestData.url);
                var i;
                var sid;
                if (requestData.method == 'GET') {
                    casper.log("[DMAIL] GET SIDs: " + sids);
                    for (i = 0; i < sids.length; i++) {
                        sid = sids[i];
                        if (removedSIDs[sid]) {
                            casper.log("[DMAIL] SID was previously removed: " + sid, 'debug');
                        } else {
                            if (!addedSIDs[sid]) {
                                casper.log("[DMAIL] Adding SID: " + sid, 'debug');
                                addedSIDs[sid] = sid;
                            }
                        }
                        casper.log("[DMAIL] addedSIDs: " + JSON.stringify(addedSIDs) +
                            ", removedSIDs: " + JSON.stringify(removedSIDs));
                    }
                } else if (requestData.method == 'DELETE') {
                    casper.log("[DMAIL] DELETE SIDs: " + sids);
                    for (i = 0; i < sids.length; i++) {
                        sid = sids[i];
                        casper.log("[DMAIL] Removing SID: " + sid, 'debug');
                        removedSIDs[sid] = sid;
                        delete addedSIDs[sid];
                    }
                    casper.log("[DMAIL] addedSIDs: " + JSON.stringify(addedSIDs) +
                        ", removedSIDs: " + JSON.stringify(removedSIDs));
                    var addedSIDsLength = Object.keys(addedSIDs).length;
                    var removedSIDsLength = Object.keys(removedSIDs).length;
                    casper.log("[DMAIL] addedSIDs: " + addedSIDsLength +
                        ", removedSIDs: " + removedSIDsLength);
                    if (addedSIDsLength < 1 && removedSIDsLength > 0) {
                        casper.log('[DMAIL] All session IDs deleted', 'info');
                        casper.evaluate(function () {
                            var div = document.createElement('div');
                            div.id = 'overanddone';
                            document.body.insertBefore(div, document.body.firstChild);
                        });
                    }
                }
            }
            // casper.log('    >>>> Request ' + JSON.stringify(requestData, undefined, 4), 'debug');
        }
    } catch (err) {
        casper.log(err, 'error');
    }
};

casper.options.onResourceReceived = function (C, response) {
    if (response.stage == 'end') {
        // casper.log('[DMAIL]     <<<< Response from: ' + response.url, 'debug');
        if (response.url.indexOf('sumologic') != -1) {
            // casper.log('[DMAIL]     <<<< Response ' + JSON.stringify(response, undefined, 4), 'debug');
        }
    }
};

//
// Put together the plan to execute.
//

var dashboardUrl = url + "/ui/dashboard.html?f=" + +dashboardId + "&t=r";
casper.start(dashboardUrl, function () {
    casper.log("[DMAIL] Started with URL: " + dashboardUrl, 'info');
});
casper.waitForSelector('#input-email', function () {
    casper.log("[DMAIL] Got selector #input-email, now filling login form...", 'info');
    this.fill('form#form-login',
        {
            'login': username,
            'password': password
        },
        true);
});
casper.waitForSelector('.iris-content', function () {
    casper.log("[DMAIL] Got selector: .iris-content, now waiting for sessionids to be deleted...", 'info');
    lastSessionsIdsCall = Date.now();
});
casper.waitForSelector('div#overanddone', function () {
    this.wait(5000, function () {
        try {
            var documentHeight = casper.evaluate(function () {
                return document.body.offsetHeight;
            });
            casper.log("[DMAIL] Document height: " + documentHeight);
            casper.captureSelector(filename, '.iris-content', {
                top: 0,
                left: 0,
                width: DOCUMENT_WIDTH,
                height: 810
            });
            casper.log("[DMAIL] Caputred screen: " + filename, 'info');
        } catch (err) {
            casper.log("ERROR " + err);
        }
    });
});


//
// Execute the plan.
//

casper.log("[DMAIL] Capturing URL: " + dashboardUrl, 'info');
casper.run();


