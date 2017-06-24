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

var DOCUMENT_WIDTH = (screen.width*200)/100;
var DOCUMENT_HEIGHT = (screen.height*200)/100;
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
if (args.length != 10) {
    casper.log("Arguments: [username] [password] [url] [dashboard-id] [output-filename] [timeout]", "error");
    casper.exit();
    process.exit();
}

var username = args[4];
var password = args[5];
var url = args[6];
var dashboardId = args[7];
var filename = args[8];
var timeout = args[9];
casper.log("Username    : " + username);
casper.log("Password    : ********");
casper.log("URL         : " + url);
casper.log("Dashboard ID: " + dashboardId);
casper.log("Filename    : " + filename);
casper.log("Timeout     : " + timeout);


//
// Setup Casper options.
//

casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)');
casper.options.waitTimeout = timeout;


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
        casper.log("[DMAIL] ERROR " + err, 'error');
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

var dashboardUrl = url + "/ui/dashboard.html?k=" + dashboardId + "&t=r";

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
var selector = "#iris-view";
casper.waitForSelector(selector, function () {
    casper.log("[DMAIL] Got selector: " + selector + ", now waiting for sessionids to be deleted...", 'info');
    lastSessionsIdsCall = Date.now();

    // casper.evaluate(function () {
    //
    //     try {
    //         canvas.log("[DMAIL] Changing min-width...", 'info');
    //         $("#iris-view").css({"min-width": "256px", "width": "720px"});
    //         canvas.log("[DMAIL] Done changing min-width", 'info');
    //     } catch (err) {
    //         canvas.log("[DMAIL] ERROR in evaluate: " + err, 'err');
    //     }
    //
    //
    //     // // From http://stackoverflow.com/a/19826393
    //     // function changeCss(className, classValue) {
    //     //     // we need invisible container to store additional css definitions
    //     //     var cssMainContainer = $('#css-modifier-container');
    //     //     if (cssMainContainer.length == 0) {
    //     //         var cssMainContainer = $('<div id="css-modifier-container"></div>');
    //     //         cssMainContainer.hide();
    //     //         cssMainContainer.appendTo($('body'));
    //     //     }
    //     //
    //     //     // and we need one div for each class
    //     //     classContainer = cssMainContainer.find('div[data-class="' + className + '"]');
    //     //     if (classContainer.length == 0) {
    //     //         classContainer = $('<div data-class="' + className + '"></div>');
    //     //         classContainer.appendTo(cssMainContainer);
    //     //     }
    //     //
    //     //     // append additional style
    //     //     classContainer.html('<style>' + className + ' {' + classValue + '}</style>');
    //     // }
    //     //
    //     // try {
    //     //     canvas.log("[DMAIL] Changing min-width...", 'info');
    //     //     changeCss("#iris-view", "min-width: 0px;");
    //     //     canvas.log("[DMAIL] Done changing min-width", 'info');
    //     // } catch (err) {
    //     //     canvas.log("[DMAIL] ERROR in evaluate: " + err, 'err');
    //     // }
    // });
});
casper.waitForSelector('div#overanddone', function () {
    casper.log("[DMAIL] Detected that all session IDs have been deleted", 'info');
});
casper.wait(5000, function () {
    try {

        // http://stackoverflow.com/questions/16628737/setting-papersize-for-pdf-printing-in-casper

        var divHeight = casper.evaluate(function () {
            return $(".iris-content").height();
        });
        casper.log("[DMAIL] Div height: " + divHeight);
        if (filename.indexOf(".pdf") != -1) {
            casper.log("[DMAIL] PDF output", 'info');
            var top = 58;
            var left = 0;
            var height = divHeight + 58 + 20;
            var width = DOCUMENT_WIDTH;
            casper.log("[DMAIL] Top: " + top + ", left: " + left + ", width: " + width + ", height: " + height, 'info');
            this.viewport(width, height, function () {
                this.wait(5000, function () {
                    try {
                        this.capture(filename, {
                            top: top,
                            left: left,
                            width: width,
                            height: height - 58
                        });
                        casper.log("[DMAIL] Captured screen: " + filename, 'info');
                    } catch (err) {
                        casper.log("[DMAIL] ERROR " + err, 'error');
                    }
                });
            });
        } else {
            casper.log("[DMAIL] Non-PDF output", 'info');
            var top = 0;
            var left = 0;
            var width = DOCUMENT_WIDTH;
            var height = divHeight;
            casper.log("[DMAIL] Top: " + top + ", left: " + left + ", width: " + width + ", height: " + height, 'info');
            try {
                casper.captureSelector(filename, '.iris-content', {
                    top: top,
                    left: left,
                    width: width,
                    height: height
                });
                casper.log("[DMAIL] Captured screen: " + filename, 'info');
            } catch (err) {
                casper.log("[DMAIL] ERROR " + err, 'error');
            }
        }
    }
    catch (err) {
        casper.log("[DMAIL] ERROR " + err, 'error');
    }
});


//
// Execute the plan.
//

casper.log("[DMAIL] Capturing URL: " + dashboardUrl, 'info');
casper.run();
