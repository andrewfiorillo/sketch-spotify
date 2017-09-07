
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
	fill.setImage(MSImageData.alloc().initWithImage_convertColorSpace(image, false));
	fill.setPatternFillType(1);
}


// ----------------------------------------------------------------------------------------------------
// Store and retrieve data locally
// ----------------------------------------------------------------------------------------------------


var pluginIdentifier = "com.sketch.spotify";

function getPreferences(key) {
	
	var userDefaults = NSUserDefaults.standardUserDefaults();
	
	if (!userDefaults.dictionaryForKey(pluginIdentifier)) {
		var defaultPreferences = NSMutableDictionary.alloc().init();
		
		defaultPreferences.setObject_forKey("value1", "key1");
		defaultPreferences.setObject_forKey("value2", "key2");

		userDefaults.setObject_forKey(defaultPreferences, pluginIdentifier);
		userDefaults.synchronize();
	}
	return userDefaults.dictionaryForKey(pluginIdentifier).objectForKey(key);
}

function setPreferences(key, value) {
	
	var userDefaults = NSUserDefaults.standardUserDefaults();
	
	if (!userDefaults.dictionaryForKey(pluginIdentifier)) {
		var preferences = NSMutableDictionary.alloc().init();
	} else {
		var preferences = NSMutableDictionary.dictionaryWithDictionary(userDefaults.dictionaryForKey(pluginIdentifier));
	}
	
	preferences.setObject_forKey(value, key);
	userDefaults.setObject_forKey(preferences, pluginIdentifier);
	userDefaults.synchronize();
}


// ----------------------------------------------------------------------------------------------------
// Authenticate with Spotify
// ----------------------------------------------------------------------------------------------------


function authenticate() {
	
	var url = "https://accounts.spotify.com/api/token?grant_type=client_credentials"
	var requestURL = NSURL.URLWithString(url);
	var request = NSMutableURLRequest.alloc().initWithURL(requestURL).autorelease();
	
	[request setHTTPMethod:@"POST"];
	
	// Set headers including credentials to retrieve auth token
	request.setValue_forHTTPHeaderField("application/json", "Accept");
	request.setValue_forHTTPHeaderField("application/x-www-form-urlencoded", "Content-Type");
	request.setValue_forHTTPHeaderField("curl/7.37.0", "User-Agent");
	request.setValue_forHTTPHeaderField("Basic MGUxMzE3NDBjOTExNDFlMWI1ODYwMzlkNDEwYjQxNjA6NzM0YjYyMmRiY2QzNDMwMmI2MjZkZDdhNjMyMTI2Yzg=", "Authorization");
	
	// Send Request and parse JSON from response
	var response = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);
	var res = NSJSONSerialization.JSONObjectWithData_options_error(response, 0, null);
	
	// store auth token locally
	setPreferences("spotify_auth", res.access_token);
	
}


// ----------------------------------------------------------------------------------------------------
// Spotify API Requests
// ----------------------------------------------------------------------------------------------------


function spotifyAPI(endpoint, callback) {
	
	var url = "https://api.spotify.com" + endpoint;
	var requestURL = NSURL.URLWithString(url);
	var request = NSMutableURLRequest.alloc().initWithURL(requestURL).autorelease();
	
	// Use saved auth token. If ghere is none, get one
	var auth_token = getPreferences("spotify_auth");
	if (!auth_token) {
		authenticate();
		auth_token = getPreferences("spotify_auth");
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
	
	// Get new auth token if expired
	if (res.error && res.error.status == 401) {
		authenticate();
		spotifyAPI(endpoint, callback);
	}
	
	return callback(res);
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

