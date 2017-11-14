
@import 'MochaJSDelegate.js'


// ----------------------------------------------------------------------------------------------------
// Utility functions
// ----------------------------------------------------------------------------------------------------


// Simple network request, with callback

function ajax(url, callback) {
	var requestURL = NSURL.URLWithString(url);
	var request = NSURLRequest.requestWithURL(requestURL);
	var response = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);
	return callback(response);
}

// Convert NSArray to JS array

function toJSArray(arr) {
	var len = arr.length, res = [];
	
	while(len--) {
		res.push(arr[len]);
	}
	
	return res;
}

// Display simple alert message

function alert(string) {
	NSApp.displayDialog(string);
}

function setImage(layer, imageData) {
	var image = [[NSImage alloc] initWithData:imageData];
	var fill = layer.style().fills().firstObject()
	var coll = fill.documentData().images();
	
	fill.setFillType(4);
	fill.setImage(MSImageData.alloc().initWithImageConvertingColorSpace(image));
	fill.setPatternFillType(1);
}


// ----------------------------------------------------------------------------------------------------
// Store and retrieve data locally
// ----------------------------------------------------------------------------------------------------


var pluginIdentifier = "com.sketch.spotify";

function getPreferences(key) {
	var userDefaults = NSUserDefaults.standardUserDefaults();
	
	if (!userDefaults.dictionaryForKey(pluginIdentifier)) {
		var defaultPrefs = NSMutableDictionary.alloc().init();
		userDefaults.setObject_forKey(defaultPrefs, pluginIdentifier);
		userDefaults.synchronize();
	}
	return userDefaults.dictionaryForKey(pluginIdentifier).objectForKey(key);
}

function setPreferences(key, value) {
	var userDefaults = NSUserDefaults.standardUserDefaults();
	
	if (!userDefaults.dictionaryForKey(pluginIdentifier)) {
		var prefs = NSMutableDictionary.alloc().init();
	} else {
		var prefs = NSMutableDictionary.dictionaryWithDictionary(userDefaults.dictionaryForKey(pluginIdentifier));
	}
	prefs.setObject_forKey(value, key);
	userDefaults.setObject_forKey(prefs, pluginIdentifier);
	userDefaults.synchronize();
}

function removeKey(key) {
	var userDefaults = NSUserDefaults.standardUserDefaults();
	
	if (!userDefaults.dictionaryForKey(pluginIdentifier)) {
		var prefs = NSMutableDictionary.alloc().init();
	} else {
		var prefs = NSMutableDictionary.dictionaryWithDictionary(userDefaults.dictionaryForKey(pluginIdentifier));
	}
	prefs.removeObjectForKey(key);
	userDefaults.setObject_forKey(prefs, pluginIdentifier);
	userDefaults.synchronize();
}


// ----------------------------------------------------------------------------------------------------
// Authenticate with Spotify
// ----------------------------------------------------------------------------------------------------


// function authenticate() {
	
// 	var url = "https://accounts.spotify.com/api/token?grant_type=client_credentials"
// 	var requestURL = NSURL.URLWithString(url);
// 	var request = NSMutableURLRequest.alloc().initWithURL(requestURL).autorelease();
	
// 	[request setHTTPMethod:@"POST"];
	
// 	// Set headers including credentials to retrieve auth token
// 	request.setValue_forHTTPHeaderField("application/json", "Accept");
// 	request.setValue_forHTTPHeaderField("application/x-www-form-urlencoded", "Content-Type");
// 	request.setValue_forHTTPHeaderField("curl/7.37.0", "User-Agent");
// 	request.setValue_forHTTPHeaderField("Basic MGUxMzE3NDBjOTExNDFlMWI1ODYwMzlkNDEwYjQxNjA6NzM0YjYyMmRiY2QzNDMwMmI2MjZkZDdhNjMyMTI2Yzg=", "Authorization");
	
// 	// Send Request and parse JSON from response
// 	var response = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);
// 	var res = NSJSONSerialization.JSONObjectWithData_options_error(response, 0, null);
	
// 	// store auth token locally
// 	setPreferences("spotify_auth", res.access_token);
	
// }


// Prompt user to sign in. Get auth coded needed to exchange for auth token.

function authorize() {
	
	COScript.currentCOScript().setShouldKeepAround_(true);
	
	var URL = "https://accounts.spotify.com/authorize?client_id=0e131740c91141e1b586039d410b4160&response_type=code&redirect_uri=http://spotify.com&scope=playlist-read-private%20user-follow-read%20user-library-read%20user-top-read%20user-read-recently-played&show_dialog=true";
	
	var frame = NSMakeRect(0,0,400,520)
	var webView = WebView.alloc().initWithFrame(frame);
	var windowObject = webView.windowScriptObject();
	var authorized = false;
	
	var delegate = new MochaJSDelegate({
		"webView:didFinishLoadForFrame:": (function(webView, webFrame) {
			var location = windowObject.evaluateWebScript("window.location.toString()");

			if ((location.indexOf("code=") >= 0) && !authorized) {
				setPreferences("auth_code", location.split("=")[1]);
				authorized = true;
				panel.close();
				authenticate();
				COScript.currentCOScript().setShouldKeepAround_(false);
			}
		})
	});

	webView.setFrameLoadDelegate_(delegate.getClassInstance());
	webView.mainFrame().loadRequest(NSURLRequest.requestWithURL(NSURL.URLWithString(URL)));
	
	// var mask = NSTitledWindowMask + NSClosableWindowMask + NSMiniaturizableWindowMask + NSResizableWindowMask + NSUtilityWindowMask;
	var mask = NSTitledWindowMask + NSClosableWindowMask;
	
	var panel = NSPanel.alloc().initWithContentRect_styleMask_backing_defer(frame, mask, NSBackingStoreBuffered, true);
	
	panel.contentView().addSubview(webView);
	panel.makeKeyAndOrderFront(null);
	panel.center();
}

// Exchange auth code for auth token needed to make API calls

function authenticate() {
	
	var auth_code = getPreferences("auth_code");
	
	var url = "https://accounts.spotify.com/api/token?grant_type=authorization_code&code=" + auth_code + "&redirect_uri=http://spotify.com";
	var requestURL = NSURL.URLWithString(url);
	var request = NSMutableURLRequest.alloc().initWithURL(requestURL).autorelease();
	
	// Set headers including credentials to retrieve auth token
	[request setHTTPMethod:@"POST"];
	request.setValue_forHTTPHeaderField("application/json", "Accept");
	request.setValue_forHTTPHeaderField("application/x-www-form-urlencoded", "Content-Type");
	request.setValue_forHTTPHeaderField("curl/7.37.0", "User-Agent");
	request.setValue_forHTTPHeaderField("Basic MGUxMzE3NDBjOTExNDFlMWI1ODYwMzlkNDEwYjQxNjA6NzM0YjYyMmRiY2QzNDMwMmI2MjZkZDdhNjMyMTI2Yzg=", "Authorization");
	
	// Send Request and parse JSON from response
	var response = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);
	var res = NSJSONSerialization.JSONObjectWithData_options_error(response, 0, null);
	
	log(res);
	
	// store auth token locally
	setPreferences("auth_token", res.access_token);
	
	if (res.refresh_token) {
		setPreferences("refresh_token", res.refresh_token);	
	}
	
}

// Sign in

function signin(context) {
	authorize();
}

// Sign out 

function signout(context) {
	removeKey("auth_code");
	removeKey("auth_token");
	removeKey("refresh_token");
}


// ----------------------------------------------------------------------------------------------------
// Spotify API Requests
// ----------------------------------------------------------------------------------------------------


function spotifyAPI(endpoint, callback) {
	
	var url = "https://api.spotify.com" + endpoint;
	var requestURL = NSURL.URLWithString(url);
	var request = NSMutableURLRequest.alloc().initWithURL(requestURL).autorelease();
	var end = endpoint;
	var call = callback;
	
	// Use saved auth token. If ghere is none, get one
	var auth_token = getPreferences("auth_token");
	if (!auth_token) {
		authorize();
		return;
	}
	
	// Set request Headers, including auth token
	request.setValue_forHTTPHeaderField("api.spotify.com", "Host");
	request.setValue_forHTTPHeaderField("application/json", "Accept");
	request.setValue_forHTTPHeaderField("application/json", "Content-Type");
	request.setValue_forHTTPHeaderField("gzip, deflate, compress", "Accept-Encoding");
	request.setValue_forHTTPHeaderField("Bearer " + auth_token, "Authorization");
	request.setValue_forHTTPHeaderField("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36", "User-Agent");
	
	// Send Request and parse JSON from response
	var response = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);
	var res = NSJSONSerialization.JSONObjectWithData_options_error(response, 0, null);
	
	// Get new auth token if expired.
	// Otherwise, Success! Return callback function.
	if (res.error) {
		log(res);
		authorize();
	} else {
		return callback(res);
	}
		
}


// ----------------------------------------------------------------------------------------------------
// Debugging
// ----------------------------------------------------------------------------------------------------


function logFileSize(data) {
	log("File size: " + data.length()/1000 + "k");	
}

function fileSize(data) {
	var size = data.length()/1000;
	return size;
}

function date() {
	var dateFormatter = NSDateFormatter.alloc().init();
	dateFormatter.setDateFormat("hh:mm:ss:SSS");
	return dateFormatter.stringFromDate(NSDate.date());
}

function benchmarkStart() {
	benchmarkStartTime = NSDate.date();
}

function benchmarkEnd() {
	var benchmarkEndTime = NSDate.date();
	var executionTime = benchmarkEndTime.timeIntervalSinceDate(benchmarkStartTime);
	log("Execution Time: " + executionTime + "s");
}
				
function testAction(context) {
	// log(context.action);
}

