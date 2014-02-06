PLAYING = 0;
PAUSED = 1;
STOPPED = 2;

/*
* This object represent the graph used to play songs
* - volume: must be between 0 and 1 
*/
function AudioGraph(volume) {
    // Master volume slider
    this.masterVolumeSlider = document.querySelector("#masterVolume");

    // Init audio context
    this.context = initAudioContext();

    this.graphNodes = [];
    this.trackVolumeNodes = [];

    this.speed = 1;

    // Create a single gain node for master volume
    this.masterVolumeNode = this.context.createGain();
    this.changeMasterVolume(volume);

    // Create à analyser node
    //
    this.analyser = this.context.createAnalyser();

    // Créate a equalizer node
    //
    this.equalizer = [
        this.context.createBiquadFilter(),
        this.context.createBiquadFilter(),
        this.context.createBiquadFilter(),
        this.context.createBiquadFilter(),
        this.context.createBiquadFilter()
    ];

    this.equalizer[0].frequency.value = 60;
    this.equalizer[0].type = 0;
    this.equalizer[1].frequency.value = 250;
    this.equalizer[1].type = 0;
    this.equalizer[2].frequency.value = 1000;
    this.equalizer[2].type = 0;
    this.equalizer[3].frequency.value = 3500;
    this.equalizer[3].type = 0;
    this.equalizer[4].frequency.value = 10000;
    this.equalizer[4].type = 0;

    this.equalizer[0].gain.value = 10;
    this.equalizer[1].gain.value = 5;
    this.equalizer[2].gain.value = 0;
    this.equalizer[3].gain.value = 5;
    this.equalizer[4].gain.value = 10;

    this.delay = this.context.createDelay();

    // Array of Subtracks to put in the graph
    this.subtracks = [];

    this.lastTime = 0;
    this.elapsedTimeSinceStart = 0;

    this.state = STOPPED;
    this.duration = 0;
}

// Private function to initialise the Audio Context
function initAudioContext() {
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

// Build the graph using buffers
AudioGraph.prototype.buildGraph = function() {
    var thus = this;
    this.subtracks.forEach(function(subtrack, i) {
		// each sound sample is the  source of a graph
        thus.graphNodes[i] = thus.context.createBufferSource();
        thus.graphNodes[i].buffer = subtrack.buffer;
        // connect each sound sample to a vomume node
        if(!subtrack.volumeNode)
          subtrack.volumeNode = thus.context.createGain();
        // Connect the sound sample to its volume node
        thus.graphNodes[i].connect(subtrack.volumeNode);
        // Connects all track volume nodes a single master volume node
        subtrack.volumeNode.connect(thus.masterVolumeNode);
    });

    // Connect the analyser to the equaliser
    //
    this.masterVolumeNode.connect(this.equalizer[0]);
    this.masterVolumeNode.connect(this.equalizer[1]);
    this.masterVolumeNode.connect(this.equalizer[2]);
    this.masterVolumeNode.connect(this.equalizer[3]);
    this.masterVolumeNode.connect(this.equalizer[4]);

    // Connect to the analyser
    //
    this.equalizer[0].connect(this.analyser);
    this.equalizer[1].connect(this.analyser);
    this.equalizer[2].connect(this.analyser);
    this.equalizer[3].connect(this.analyser);
    this.equalizer[4].connect(this.analyser);

    // Connect to the delayNode
    //
    this.analyser.connect(this.delay);
    this.analyser.connect(this.context.destination);
    
    // Connect the destination
    //
    this.delay.connect(this.context.destination);
}

/*
* Replace buffers and rebuild the graph
* - subtracks: Array of Subtrack object
*/
AudioGraph.prototype.setSubtracks = function(subtracks) {
  // Reset previous track
  this.subtracks.forEach(function (subtrack) {
    subtrack.volumeNode = undefined;
    subtrack.volume = 100;
  });
  // Reset nodes and time
  this.graphNodes = [];
	this.trackVolumeNodes = [];
	this.elapsedTimeSinceStart = 0;
	// Set new tracks
	this.subtracks = subtracks;
  this.duration = subtracks[0].buffer.duration;
};

/*
* Play song from the givent time
* Used privatly
*/
AudioGraph.prototype.playFrom = function(startTime) {
	this.buildGraph();
    var thus = this;
	this.graphNodes.forEach(function(node) {
	// First parameter is the delay before playing the sample
	// second one is the offset in the song, in seconds, can be 2.3456
	// very high precision !
      node.start(0, startTime);
      thus.setSpeed();
  })

  this.state = PLAYING;    
}

AudioGraph.prototype.play = function(percent) {
  this.elapsedTimeSinceStart = percent*this.duration;
  this.lastTime = this.context.currentTime - this.elapsedTimeSinceStart;
  this.playFrom(this.elapsedTimeSinceStart);
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
    this.state = STOPPED;
}

AudioGraph.prototype.pause = function() {
    this.stop();
    this.elapsedTimeSinceStart = this.context.currentTime - this.lastTime;
    this.state = PAUSED;
}

AudioGraph.prototype.changeMasterVolume = function(volume) {
   	if(volume > 0)
        this.masterVolumeNode.gain.value = volume * volume;
   	else this.masterVolumeNode.gain.value = 0;
}

AudioGraph.prototype.getPercent = function() {
    switch(this.state) {
      case STOPPED:
        return 0;
      case PAUSED:
        return this.elapsedTimeSinceStart/this.duration*100;
      case PLAYING:
        var timeSinseStart = this.context.currentTime - this.lastTime;
        return timeSinseStart/this.duration*100;
    }
    return 0;
}

AudioGraph.prototype.setSpeed = function() {
    var thus= this;
    this.graphNodes.forEach(function(node,i) {
      node.playbackRate.value = thus.speed;
    });
}