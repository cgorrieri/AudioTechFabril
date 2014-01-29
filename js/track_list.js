function TrackList() {
    this.loaded = false;
    this.tracks = [];
}

TrackList.prototype.load = function(callback) {
    if(!this.loaded) {
	    // load songs
	    var xhr = new XMLHttpRequest();
	    xhr.open('GET', "track", true);

	    // reference to this used in the onload function
	    var thus = this;

	    xhr.onload = function(e) {
	        var songList = JSON.parse(this.response);

	        songList.forEach(function(songName) {
	            thus.tracks.push(songName);
	        });
	        if(callback) callback(thus.tracks);
	    };
	    xhr.send();

	    this.loaded = true;
	} else {
		if(callback) callback(this.tracks);
	}
}

TrackList.prototype.reload = function(callback) {
	this.loaded = false;
	this.tracks = [];
	this.load(callback);
}
