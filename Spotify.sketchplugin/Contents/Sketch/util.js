
function authenticate() {
	
	// setPreferences("spotify_auth", "BQCg_CakzuUTsUvbxM_juxzpJ_4OQD6MQIiGJRW0Q51N7GwDKI1QRzOElcuGY2-MAWTWYBnO3ns2buCtb6GHpHXmVhug6BPrmsg-8hZu6qWw25Ec9C-w1tNZag1x5giorYJ9T_a96fso9zbgHFwVt571x6sMfp7rFyoc6znYW_olY9U4dEFIF4xG0rnMprrMJjHMSjeDE92qGUnTURil4nI6iLdO1tDKsKI5p-JU97lq3xfT1u-s3xm2Cfjz2OeKGhkHdAB5KUsmz4mH-t7p-pwjsa0K8qnfauvwyeXCGfYhSysr46qsVRFl7BGR4UWKVHEsA03qxZU");
	
	// return;
	
	
	var url = "https://accounts.spotify.com/api/token?grant_type=client_credentials"
	var requestURL = NSURL.URLWithString(url);
	var request = NSMutableURLRequest.alloc().initWithURL(requestURL).autorelease();
	[request setHTTPMethod:@"POST"];
	
	// var string = NSString.stringWithString("0e131740c91141e1b586039d410b4160:734b622dbcd34302b626dd7a632126c8");
	// var stringData = string.dataUsingEncoding(NSUTF8StringEncoding);
	// var stringBase64 = stringData.base64EncodedStringWithOptions(0).UTF8String();
	// log(stringBase64);
	
	request.setValue_forHTTPHeaderField("Basic MGUxMzE3NDBjOTExNDFlMWI1ODYwMzlkNDEwYjQxNjA6NzM0YjYyMmRiY2QzNDMwMmI2MjZkZDdhNjMyMTI2Yzg=", "Authorization");
	request.setValue_forHTTPHeaderField("application/json", "Accept");
	request.setValue_forHTTPHeaderField("application/x-www-form-urlencoded", "Content-Type");
	request.setValue_forHTTPHeaderField("curl/7.37.0", "User-Agent");
	
	var response = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);
	var res = NSJSONSerialization.JSONObjectWithData_options_error(response, 0, null);
	
	setPreferences("spotify_auth", res.access_token);
	
}


// Network --------------------------------------------------------------------

function spotifyAPI(endpoint, callback) {
	
	var url = "https://api.spotify.com" + endpoint;
	var requestURL = NSURL.URLWithString(url);
	var request = NSMutableURLRequest.alloc().initWithURL(requestURL).autorelease();
	
	var auth_token = getPreferences("spotify_auth");
	if (!auth_token) {
		authenticate();
		auth_token = getPreferences("spotify_auth");
	}
	
	request.setValue_forHTTPHeaderField("api.spotify.com", "Host");
	request.setValue_forHTTPHeaderField("application/json", "Accept");
	request.setValue_forHTTPHeaderField("application/json", "Content-Type");
	request.setValue_forHTTPHeaderField("gzip, deflate, compress", "Accept-Encoding");
	request.setValue_forHTTPHeaderField("Bearer " + auth_token, "Authorization");
	request.setValue_forHTTPHeaderField("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36", "User-Agent");
	
	var response = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);
	var res = NSJSONSerialization.JSONObjectWithData_options_error(response, 0, null);
	
	if (res.error && res.error.status == 401) {
		// alert("access token expired!");
		authenticate();
		spotifyAPI(endpoint, callback)
	}

	return callback(res);
}

function ajax(url, callback) {
	var requestURL = NSURL.URLWithString(url);
	var request = NSURLRequest.requestWithURL(requestURL);
	var response = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);
	return callback(response);
}


// Utility functions ----------------------------------------------------------

function parseMarkup(string) {
	var text = NSString.stringWithString(string);
	text = text.stringByReplacingOccurrencesOfString_withString("<br />", "\n");
	text = text.stringByReplacingOccurrencesOfString_withString("&quot;", "\"");
	text = text.stringByReplacingOccurrencesOfString_withString("&rdquo;", "\"");
	text = text.stringByReplacingOccurrencesOfString_withString("&ndash;", "-");
	text = text.stringByReplacingOccurrencesOfString_withString("&amp;", "&");
	return text;
}

function alert(string) {
	NSApp.displayDialog(string);
}

function toJSArray(arr) {
	var len = arr.length, res = [];
	
	while(len--) {
		res.push(arr[len]);
	}
	
	return res;
}

function testAction(context){
	// log(context.action);
}


var pluginIdentifier = "com.andrewfiorillo.sketch.spotify";

function getPreferences(key) {
	var userDefaults = NSUserDefaults.standardUserDefaults();
	if (!userDefaults.dictionaryForKey(pluginIdentifier)) {
		var defaultPreferences = NSMutableDictionary.alloc().init();
		// Your defult preferences
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




// Debugging ------------------------------------------------------------------

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

				
				
				
				