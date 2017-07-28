
@import 'util.js'


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
