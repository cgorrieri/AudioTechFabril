/*
* This object represent the graph used to play songs
* volume: must be between 0 and 1 
*/
function AudioGraph(volume) {
    // Master volume slider
    this.masterVolumeSlider = document.querySelector("#masterVolume");

    // Init audio context
    this.context = initAudioContext();

    this.graphNodes = [];
    this.trackVolumeNodes = [];

    // Create a single gain node for master volume
    this.masterVolumeNode = this.context.createGain();
    this.changeMasterVolume(volume);

    this.buffers = [];

    this.lastTime = 0;
    this.elapsedTimeSinceStart = 0;
}

function initAudioContext() {
    // Initialise the Audio Context
    // There can be only one!
    var context;

    if (typeof AudioContext == "function") {
        context = new AudioContext();
        console.log("USING STANDARD WEB AUDIO API");
    } else if (typeof webkitAudioContext == "function") {
        context = new webkitAudioContext();
        console.log("USING WEBKIT AUDIO API");
    } else {
        throw new Error('AudioContext is not supported. :(');
    }
    return context;
}

AudioGraph.prototype.buildGraph = function() {
    var thus = this;
    this.buffers.forEach(function(buffer, i) {
		// each sound sample is the  source of a graph
        thus.graphNodes[i] = thus.context.createBufferSource();
        thus.graphNodes[i].buffer = buffer;
        // connect each sound sample to a vomume node
        thus.trackVolumeNodes[i] = thus.context.createGain();
        // Connect the sound sample to its volume node
        thus.graphNodes[i].connect(thus.trackVolumeNodes[i]);
        // Connects all track volume nodes a single master volume node
        thus.trackVolumeNodes[i].connect(thus.masterVolumeNode);
        // Connect the master volume to the speakers
        thus.masterVolumeNode.connect(thus.context.destination);
    });
}

AudioGraph.prototype.setSubtracks = function(subtracks) {
	this.graphNodes = [];
	this.trackVolumeNodes = [];
	this.elapsedTimeSinceStart = 0;
	var _buffers = [];
	subtracks.forEach(function(subtrack, i) {
		_buffers[i] = subtrack.buffer;
	})
	this.buffers = _buffers;
};

AudioGraph.prototype.playFrom = function(startTime) {
	this.buildGraph();

  	this.graphNodes.forEach(function(node) {
		// First parameter is the delay before playing the sample
		// second one is the offset in the song, in seconds, can be 2.3456
		// very high precision !
        node.start(0, startTime);
    })

  	// context.currentTime get time since context is started
    
}

AudioGraph.prototype.play = function(startTime) {
    this.playFrom(startTime);
    this.lastTime = this.context.currentTime;
}

AudioGraph.prototype.resume = function() {
	this.lastTime = this.context.currentTime - this.elapsedTimeSinceStart;
    this.playFrom(this.elapsedTimeSinceStart);
}

AudioGraph.prototype.stop = function() {
    this.graphNodes.forEach(function(s) {
		// destroy the nodes
        s.stop(0);
    });
    this.elapsedTimeSinceStart = 0;
}

AudioGraph.prototype.pause = function() {
    this.stop();

    this.elapsedTimeSinceStart = this.context.currentTime - this.lastTime;
}

AudioGraph.prototype.changeMasterVolume = function(volume) {
   	if(volume > 0)
        this.masterVolumeNode.gain.value = volume * volume;
   	else this.masterVolumeNode.gain.value = 0;
}


AudioGraph.prototype.muteUnmuteTrack = function(trackNumber) {
// AThe mute / unmute button
    var b = document.querySelector("#mute" + trackNumber);
    if (this.trackVolumeNodes[trackNumber].gain.value == 1) {
        this.trackVolumeNodes[trackNumber].gain.value = 0;
        b.innerHTML = "Unmute";
    } else {
        this.trackVolumeNodes[trackNumber].gain.value = 1;
        b.innerHTML = "Mute";
    }


}