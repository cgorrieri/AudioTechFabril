var player;

function initPlayer() {
    player = new Player();
}

function Player() {
    // tracks already loaded
    // key = songName, value = Track Object
    this.tracks = {}

	// Get handles on buttons
    this.buttonPlay = document.getElementById("bplay");
    this.buttonPlay.disabled = true;
    this.buttonPause = document.getElementById("bpause");
    this.buttonPause.style.display = "none";
    this.buttonStop = document.getElementById("bstop");
    this.buttonStop.disabled = true;

    this.stopped = true;

    this.divTrack = document.getElementById("tracks");


    // canvas where we draw the samples
    this.canvas = document.querySelector("#tracks_canvas");
    ctx = this.canvas.getContext('2d');

    // Create a second canvas
    this.frontCanvas = document.createElement('canvas');
    this.frontCanvas.id = 'canvasFront';
    // Add it as a second child of the mainCanvas parent.
    this.canvas.parentNode.appendChild(this.frontCanvas);
    // make it same size as its brother
    this.frontCanvas.height = this.canvas.height;
    this.frontCanvas.width = this.canvas.width;
    frontCtx = this.frontCanvas.getContext('2d');

    /*
    this.frontCanvas.addEventListener("mousedown", function(event) {
        console.log("mouse click on canvas, let's jump to another position in the song")
        var mousePos = getMousePos(this.frontCanvas, event);
        // will compute time from mouse pos and start playing from there...
        jumpTo(mousePos);
    })
	//*/

    this.graph = new AudioGraph(1);

    // Get the list of the songs available on the server and build a 
    // drop down menu
    this.loadSongList();

    //animateTime();
}

// ######### SONGS
Player.prototype.loadSongList = function() {
    var thus = this;

    var tracks = new TrackList();
    var tracksObjects = [];
    // create list
    var s = $("<select/>");
    s.appendTo("#songs");
    $("<option />", {value: "empty", text: "---------"}).appendTo(s);
    s.change(function(e) {
        $(this).children("[value=empty]").remove();
        thus.loadTrackList($(this).val());
    });
    // load tracks
    tracks.load(function(tracksList) {
	    tracksList.forEach(function(track) {
	    	$("<option />", {value: track, text: track}).appendTo(s);
	    });
	});
}

Player.prototype.loadTrackList = function(songName) {
    // if song loaded for the first time
    if(!this.tracks[songName]) {
        this.tracks[songName] = new Track(songName);
    }

    this.divTrack.innerHTML ="";

    var thus = this;

    var callback = this.enablePlay;

    this.tracks[songName].load(function(subtracks) {
        var subtracksLoadedCount = 0;
        subtracks.forEach(function(subtrack, trackNumber) {
            console.log("Subtrack: "+subtrack.name);
            console.log("\tAdd HTML");
            // Render HTMl
            var div = document.createElement('div');
            //var imageURL = "track/" + songName + "/visualisation/" + instrument.visualisation;
            var id_progressbar = "subtrack_"+trackNumber;
            div.innerHTML = subtrack.name +
                    "<button id='mute" + trackNumber + "' onclick='muteUnmuteTrack(" + trackNumber + ");'>Mute</button><br/>"
                    +"<div class=\"progress success\"> <span id=\""+id_progressbar+"\"class=\"meter\" style=\"width: 1%\"></span> </div>"
                    /*+
                    "<img class='sample' src='" + imageURL + "'/><br/>";
                    */
            //drawSampleImage(imageURL, trackNumber, instrument.name);
            thus.divTrack.appendChild(div);

            // Audio
            console.log("\tLoad audio");
            //* load audio
            subtrack.load(
                // success
                function(subtrack) {
                    $("#"+id_progressbar).width("100%");
                    draw_track(subtrack.buffer, thus.canvas, trackNumber);
                    if(++subtracksLoadedCount == subtracks.length) {
                        thus.graph.setSubtracks(thus.tracks[songName].subtracks)
                        thus.enablePlay();
                    }
                },
                // progress
                function(e) {
                    $("#"+id_progressbar).width(e+"%");
                },
                //error
                function() {

                }
            );
            //*/
        });
    });
}

Player.prototype.enablePlay = function() {
    this.buttonPlay.disabled = false;
}

Player.prototype.play = function() {
    if(this.stopped) this.graph.play(0);
    else this.graph.resume();
    this.buttonPlay.style.display = "none";
    this.buttonPause.style.display = "inline";
    this.buttonStop.disabled = false;
    this.stopped = false;
}

Player.prototype.pause = function() {
    this.graph.pause();
    this.buttonPlay.style.display = "inline";
    this.buttonPause.style.display = "none";
}

Player.prototype.stop = function() {
    this.graph.stop();
    this.buttonPlay.style.display = "inline";
    this.buttonPause.style.display = "none";
    this.buttonStop.disabled = true;
    this.stopped = true;
}

Player.prototype.setDescription = function(text) {
   $("#description").html(text);
}