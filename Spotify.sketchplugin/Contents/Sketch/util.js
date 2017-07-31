

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


// ----------------------------------------------------------------------------------------------------
// Store and retrieve data locally
// ----------------------------------------------------------------------------------------------------

var pluginIdentifier = "com.andrewfiorillo.sketch.spotify";

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
// Debuggin
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
