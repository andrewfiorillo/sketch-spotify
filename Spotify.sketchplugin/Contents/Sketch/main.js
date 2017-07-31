
@import 'util.js'


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
// Get photos of artists in the US Top 50 
// ----------------------------------------------------------------------------------------------------

function insertPhotosByTopArtists(context) {
	
	var selection = context.selection;
	
	// make sure user has selected layers
	if (selection.length < 1) { 
		alert("Select one or more layers!");
		return;
	}
	
	// US Top 50
	var endpoint = "/v1/users/spotifycharts/playlists/37i9dQZEVXbLRQDuF5jeBp/tracks";
	
	spotifyAPI(endpoint, function(res) {
		
		// make sure access token is valid
		if (res.error && res.error.status == 401) {
			alert("access token expired!");
			return;
		}
		
		// Build API query
		var tracks = res.items;
		var artistsURL = "/v1/artists?ids=";
		
		for (var i = 0; i < tracks.length; i++) {
			artistsURL += tracks[i].track.artists[0].id;
			if (i < (tracks.length - 1)) { artistsURL += "," }
		};
	
		// Need full artist objects to get images
		spotifyAPI(artistsURL, function(res) {

			var artists = res.artists;
			var numArtists = artists.length;
			var max = selection.length;
			
			if (max > numArtists) { max = numArtists }
			
			// Randomize				
			artists = toJSArray(artists);
			artists.sort(function(a, b){return 0.5 - Math.random()});
			
			// Loop through slection and set pattern fills
			for (var i = 0; i < max; i++) {
				var artistImageURL = artists[i].images[0].url;
				
				ajax(artistImageURL, function(imageData) {	
					var image = [[NSImage alloc] initWithData:imageData];
					var fill = selection[i].style().fills().firstObject()
					var coll = fill.documentData().images();
					
					fill.setFillType(4);
					fill.setImage(MSImageData.alloc().initWithImage_convertColorSpace(image, false));
					fill.setPatternFillType(1);
				});
			}
		});
		
	});

}


// ----------------------------------------------------------------------------------------------------
// Get album art of artists in the US Top 50
// ----------------------------------------------------------------------------------------------------

function insertAlbumArtByTopArtists(context) {
	
	var selection = context.selection;
	
	
	// US Top 50
	var endpoint = "/v1/users/spotifycharts/playlists/37i9dQZEVXbLRQDuF5jeBp/tracks";
	
	spotifyAPI(endpoint, function(res) {
		
		// make sure access token is valid
		if (res.error && res.error.status == 401) {
			alert("access token expired!");
			return;
		}
		
		var tracks = res.items;
		var numTracks = tracks.length;
		var max = selection.length;
			
		if (max > numTracks) { max = numTracks }
		
		// Randomize
		tracks = toJSArray(tracks);
		tracks.sort(function(a, b){return 0.5 - Math.random()});
		
		// Loop through slection and set pattern fills
		for (var i = 0; i < max; i++) {
			var albumImage = tracks[i].track.album.images[0].url
			
			ajax(albumImage, function(imageData) {	
				var image = [[NSImage alloc] initWithData:imageData];
				var fill = selection[i].style().fills().firstObject()
				var coll = fill.documentData().images();
				
				fill.setFillType(4);
				fill.setImage(MSImageData.alloc().initWithImage_convertColorSpace(image, false));
				fill.setPatternFillType(1);
			});
		}
			
			
	});
	
}


// ----------------------------------------------------------------------------------------------------
// Get album art via artist search
// ----------------------------------------------------------------------------------------------------

function insertAlbumArtByArtistSearch(context) {
	
	var doc = context.document;
	var selection = context.selection;
	var keyword = [doc askForUserInput:"Search for an artist" initialValue:"Kanye"];
	var encodedKeyword = encodeURIComponent(keyword);
	
	var endpoint = "/v1/search?q=" + encodedKeyword + "&type=artist";
	
	spotifyAPI(endpoint, function(res) {
		
		var results = res.artists.items;
		
		results = toJSArray(results);
		results = results.sort(function(a, b) {
			return b.followers.total - a.followers.total;
		});
		
		// var topResult = results[0].name;
		// log(results[0].name);
		// log(results[0].id)
		
		spotifyAPI("/v1/artists/" + results[0].id + "/albums?limit=50&market=US&album=album", function(res) {
			// log(res.items);
			
			var albums = res.items;
			var numAlbums = albums.length;
			var max = selection.length;
			
			if (max > numAlbums) { max = numAlbums }

			for (var i = 0; i < max; i++) {
				// log(albums[i].images[0]);
				
				var albumImage = albums[i].images[0].url;
			
				ajax(albumImage, function(imageData) {	
					var image = [[NSImage alloc] initWithData:imageData];
					var fill = selection[i].style().fills().firstObject()
					var coll = fill.documentData().images();
					
					fill.setFillType(4);
					fill.setImage(MSImageData.alloc().initWithImage_convertColorSpace(image, false));
					fill.setPatternFillType(1);
				});
				
			};
			
		});
		
		
	});

}



// Just for refernence: Insert Usernames

// function insertUsernames(context, demo) {
	
// 	var selection = context.selection;
// 	var numLayers = selection.length;

// 	if (numLayers > 0 && selection[0].class() == "MSTextLayer") {
		
// 		var users = getUsers(context, demo);
		
// 		for (var i = 0; i < numLayers; i++) {
// 			var layer = selection[i];
// 			var user = users[i];
// 			var username = "" + user.username;
// 			layer.setStringValue(username);
// 			layer.adjustFrameToFit();
// 			layer.setName(username);
// 		}
		
// 	} else { alert("Select a text layer!") }
	
// }
