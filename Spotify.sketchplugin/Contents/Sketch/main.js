
@import 'util.js'


// ------------------------------------------------------------------------------------------------
// Get photos of artists in the US Top 50 
// ------------------------------------------------------------------------------------------------


function insertPhotosByTopArtists(context) {
	
	var selection = context.selection;
	if (selection.length < 1) { alert("Select one or more layers!"); return; }
	
	// US Top 50 Playlist
	var endpoint = "/v1/users/spotifycharts/playlists/37i9dQZEVXbLRQDuF5jeBp/tracks";
	
	spotifyAPI(endpoint, function(res) {
		
		// Build API query
		var tracks = res.items;
		var artistsURL = "/v1/artists?ids=";
		
		for (var i = 0; i < tracks.length; i++) {
			artistsURL += tracks[i].track.artists[0].id;
			if (i < (tracks.length - 1)) { artistsURL += "," }
		}
	
		// Need full artist objects to get images
		spotifyAPI(artistsURL, function(res) {

			var artists = res.artists;
			var numArtists = artists.length;
			var max = selection.length;
			
			if (max > numArtists) { max = numArtists }
			
			// Randomize				
			artists = toJSArray(artists).sort(function(a, b) {
				return 0.5 - Math.random();
			});
			
			// Loop through slection and set pattern fills
			for (var i = 0; i < max; i++) {
				ajax(artists[i].images[0].url, function(imageData) {	
					setImage(selection[i], imageData);
				});
			}
		});
		
	});

}


// ------------------------------------------------------------------------------------------------
// Get photos of artist via artist search
// ------------------------------------------------------------------------------------------------


function insertArtistsPhotosByArtistSearch(context) {
	
	var doc = context.document;
	var selection = context.selection;
	if (selection.length < 1) { alert("Select one or more layers!"); return; }
	
	var keyword = [doc askForUserInput:"Search for an artist" initialValue:"Yeasayer"];
	
	var endpoint = "/v1/search?q=" + encodeURIComponent(keyword) + "&type=artist";
	
	spotifyAPI(endpoint, function(res) {
		
		var results = toJSArray(res.artists.items).sort(function(a, b) {
			return b.popularity - a.popularity;
		});
		
		var artistImageURL = results[0].images[0].url;
		
		ajax(artistImageURL, function(imageData) {
			for (var i = 0; i < selection.length; i++) {
				setImage(selection[i], imageData);
			}
		});
		
	});

}


// ------------------------------------------------------------------------------------------------
// Get album art of artists in the US Top 50
// ------------------------------------------------------------------------------------------------

function insertAlbumArtByTopArtists(context) {
	
	var selection = context.selection;
	if (selection.length < 1) { alert("Select one or more layers!"); return; }
	
	// US Top 50 Playlist
	var endpoint = "/v1/users/spotifycharts/playlists/37i9dQZEVXbLRQDuF5jeBp/tracks";
	
	spotifyAPI(endpoint, function(res) {
		
		var tracks = toJSArray(res.items);
		var numTracks = tracks.length;
		var max = selection.length;
			
		if (max > numTracks) { max = numTracks }
		
		// Create a new array filled with the tracks album name & artwork
		var albums = tracks.map(item => { 
			return { name: item.track.album.name.UTF8String(), artwork: item.track.album.images[0].url.UTF8String() }
		});

		// Filter out duplicate albums by their name
		var albumNames = [];
		var uniqueAlbums = albums.filter(album => {
			if (albumNames.indexOf(album.name) < 0) {
				albumNames.push(album.name);
				return true;
			}
			return false;
		})
		
		// Randomize
		uniqueAlbums = uniqueAlbums.sort(function(a, b) {
			return 0.5 - Math.random();
		});
		
		 // Loop through selection and set pattern fills
		 // If the selection length is greater than the albums length, fill the albums again from the start.
		 for (var i = 0, albumIndex = 0; i < selection.length; i++, albumIndex++) {
			if (albumIndex === uniqueAlbums.length - 1) {
				albumIndex = 0;
			}

			ajax(uniqueAlbums[albumIndex].artwork, function(imageData) {	
				setImage(selection[i], imageData);
			});
		}
	
	});
	
}


// ------------------------------------------------------------------------------------------------
// Get album art for New Releases
// ------------------------------------------------------------------------------------------------


function insertAlbumArtByNewReleases(context) {
	
	var selection = context.selection;
	if (selection.length < 1) { alert("Select one or more layers!"); return; }
	
	// US Top 50 Playlist
	var endpoint = "/v1/browse/new-releases?limit=20&offset=0";
	
	spotifyAPI(endpoint, function(res) {
		
		var releases = res.albums.items;
		var numReleases = releases.length;
		var max = selection.length;
			
		if (max > numReleases) { max = numReleases }
		
		// Randomize
		releases = toJSArray(releases).sort(function(a, b) {
			return 0.5 - Math.random();
		});
		
		// Loop through slection and set pattern fills
		for (var i = 0; i < max; i++) {
			ajax(releases[i].images[0].url, function(imageData) {
				setImage(selection[i], imageData);
			});
		}
			
	});
	
}


// ------------------------------------------------------------------------------------------------
// Get album art for Discover Weekly
// ------------------------------------------------------------------------------------------------


function insertAlbumArtByDiscoverWeekly(context) {
	
	var selection = context.selection;
	if (selection.length < 1) { alert("Select one or more layers!"); return; }
	
	spotifyAPI("/v1/me/playlists", function(res) {
		
		// Get Discover Weekly playlist ID		
		var id = res.items.find(function(playlist) {
  			return playlist.name == "Discover Weekly";
		}).id;

		// Get Discover Weekly tracks
		spotifyAPI("/v1/playlists/" + id + "/tracks?fields=items.track(album)", function(res) {

			var tracks = res.items;
			var numTracks = tracks.length;
			var max = selection.length;
				
			if (max > numTracks) { max = numTracks }
			
			// Loop through slection and set pattern fills
			for (var i = 0; i < max; i++) {
				ajax(tracks[i].track.album.images[0].url, function(imageData) {
					setImage(selection[i], imageData);
				});
			}

		});
			
	});

}


// ------------------------------------------------------------------------------------------------
// Get album art via artist search
// ------------------------------------------------------------------------------------------------


function insertAlbumArtByArtistSearch(context) {
	
	var doc = context.document;
	var selection = context.selection;
	if (selection.length < 1) { alert("Select one or more layers!"); return; }
	
	var keyword = [doc askForUserInput:"Search for an artist" initialValue:"Yeasayer"];
	
	// Search for artist
	var endpoint = "/v1/search?q=" + encodeURIComponent(keyword) + "&type=artist";
	
	spotifyAPI(endpoint, function(res) {
		
		// Sort by popularity
		var results = toJSArray(res.artists.items).sort(function(a, b) {
			return b.popularity - a.popularity;
		});
		
		// Get albums of most popular artist matching search criteria
		spotifyAPI("/v1/artists/" + results[0].id + "/albums?limit=50&market=US&include_groups=album,single", function(res) {
			
			var albums = res.items;
			var numAlbums = albums.length;
			var max = selection.length;
			
			if (max > numAlbums) { max = numAlbums }
				
			// Randomize
			albums = toJSArray(albums).sort(function(a, b) {
				return 0.5 - Math.random();
			});
			
			// Loop through slection and set pattern fills
			for (var i = 0; i < max; i++) {
				ajax(albums[i].images[0].url, function(imageData) {	
					setImage(selection[i], imageData);
				});
			}
			
		});
		
	});

}


// ------------------------------------------------------------------------------------------------
// Test User Data
// ------------------------------------------------------------------------------------------------

function testCommand(context) {
	
	// log("MY TOP ARTISTS:")
	
	spotifyAPI("/v1/me/playlists?limit=50&offset=0", function(res) {
		results = res.items
		log(res.items);
		return;
		for (var i = 0; i < results.length; i++) {
			log(results[i].name)
		};
			
	});
	
}
