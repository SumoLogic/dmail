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
casper.options.waitTimeout = 120000;


//
// Hook up request & response monitoring.
//


//
// Hook up request & response monitoring.
//

casper.options.onResourceRequested = function(C, requestData, networkRequest) {
    // casper.log('[DMAIL]     >>>> Request to: ' + requestData.url, 'debug');
	if (requestData.url.indexOf('sumologic') != -1) {
		if (requestData.url.indexOf('sessionids') != -1) {
			if (requestData.method == 'DELETE') {
			    casper.log('[DMAIL] Session IDs deleted', 'info');				
				casper.evaluate(function() {
					var div = document.createElement('div');
					div.id = 'overanddone';
					document.body.insertBefore(div, document.body.firstChild);
				});
			}
		}
	    // casper.log('    >>>> Request ' + JSON.stringify(requestData, undefined, 4), 'debug');
    }
};
casper.options.onResourceReceived = function(C, response) {
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

var dashboardUrl = url + "/ui/dashboard.html?f=" + + dashboardId + "&t=r";
casper.start(dashboardUrl, function() {
	casper.log("[DMAIL] Started with URL: " + dashboardUrl, 'info');
});
casper.waitForSelector('#input-email', function() {
	casper.log("[DMAIL] Got selector #input-email, now filling login form...", 'info');
	this.fill('form#form-login',
	 {
	    'login': username,
    	'password': password
    }, 
	true);
});
casper.waitForSelector('.iris-content', function() {
	casper.log("[DMAIL] Got selector: .iris-content, now waiting for sessionids to be deleted...", 'info');
	lastSessionsIdsCall = Date.now();
});
casper.waitForSelector('div#overanddone', function() {
	this.wait(5000, function() {
		try {
		    var documentHeight = casper.evaluate(function() { 
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


