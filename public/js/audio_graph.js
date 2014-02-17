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
    this.context = AudioGraph.initAudioContext();

    this.graphNodes = [];
    this.trackVolumeNodes = [];

    this.speed = 1;

    // Create a single gain node for master volume
    this.masterVolumeNode = this.context.createGain();
    this.changeMasterVolume(volume);

    // Create an analyser node
    this.analyser = this.context.createAnalyser();

    // Créate a equalizer node
    this.equalizer = [];
    var thus = this;
    // Set filters
    [60, 170, 350, 1000, 3500, 10000].forEach(function(freq, i) {
      var eq = thus.context.createBiquadFilter();
      eq.frequency.value = freq;
      eq.type = "peaking";
      eq.gain.value = 0;
      thus.equalizer.push(eq);
    })

    this.delay = this.context.createDelay();

    // Array of Subtracks to put in the graph
    this.subtracks = [];

    this.lastTime = 0;
    this.elapsedTimeSinceStart = 0;

    this.state = STOPPED;
    this.duration = 0;

    this.audioStream = undefined;
    this.activateRecording = false;
    this.audioRecorder = undefined;
    this.recProcessNode = undefined;
    this.recBufferR = [];
    this.recBufferL = [];
    this.recLength = 0;
    this.peak = 0;
}

// Private function to initialise the Audio Context
AudioGraph.initAudioContext = function() {
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

AudioGraph.prototype.initRecordingGraph = function(stream) {
  this.audioStream = stream;
  this.streamAudioInput = this.context.createMediaStreamSource(this.audioStream);

  var inputPoint = this.context.createGain();
  this.streamAudioInput.connect(inputPoint);

  var bufferLen = 4096;
  if(!this.context.createScriptProcessor){
     this.recProcessNode = this.context.createJavaScriptNode(bufferLen, 2, 2);
  } else {
     this.recProcessNode = this.context.createScriptProcessor(bufferLen, 2, 2);
  }
  var thus = this;
  this.recProcessNode.onaudioprocess = function(e) {
    thus.recordingCallback(e.inputBuffer);
  }

  inputPoint.connect(this.recProcessNode);
  this.recProcessNode.connect(this.context.destination);

  var zeroGain = this.context.createGain();
  zeroGain.gain.value = 0.0;
  inputPoint.connect( zeroGain );
  zeroGain.connect( this.context.destination );
}

AudioGraph.prototype.destroyRecordingGraph = function() {
  //this.streamAudioInput.destroy();
  //this.recProcessNode.stop();
}

// Build the graph using buffers
AudioGraph.prototype.buildGraph = function() {
    var thus = this;
    this.subtracks.forEach(function(subtrack, i) {
    // each sound sample is the  source of a graph
        thus.graphNodes[i] = thus.context.createBufferSource();
        thus.graphNodes[i].buffer = subtrack.buffer;
        thus.graphNodes[i].playbackRate.value = thus.speed;
        // connect each sound sample to a vomume node
        if(!subtrack.volumeNode)
          subtrack.volumeNode = thus.context.createGain();
        // Connect the sound sample to its volume node
        thus.graphNodes[i].connect(subtrack.volumeNode);
        // Connects all track volume nodes a single master volume node
        subtrack.volumeNode.connect(thus.masterVolumeNode);
    });

    // Connect equalizers in serie
    this.masterVolumeNode.connect(this.equalizer[0]);
    for(var i = 0; i < this.equalizer.length - 1; i++) {
      this.equalizer[i].connect(this.equalizer[i+1]);
    }
    // Connect to the analyser
    this.equalizer[this.equalizer.length - 1].connect(this.analyser);

    //this.masterVolumeNode.connect(this.analyser);

    // Connect to the delayNode
    this.analyser.connect(this.delay);
    this.analyser.connect(this.context.destination);
    
    // Connect the destination
    this.delay.connect(this.context.destination);
}

// Called when a buffer from the recorder is ready
AudioGraph.prototype.recordingCallback = function(buffer) {
  if(this.activateRecording && this.state == PLAYING) {
    this.peak = 0;
    var buff1 = buffer.getChannelData(0), buff2 = buffer.getChannelData(1);
    for(var i = 0; i < buffer.getChannelData(0).length; i++) {
      this.recBufferR.push(buff1[i]);
      this.recBufferL.push(buff2[i]);
      // Calc curren peak
      this.peak = Math.max(this.peak, buff1[i], buff2[i]);
    }
    this.recLength += buffer.getChannelData(0).length;
  }
};

AudioGraph.prototype.getPeak = function() {
  return this.peak;
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

// Return the current time elapsed in percent
AudioGraph.prototype.getPercent = function() {
    switch(this.state) {
      case STOPPED:
        return 0;
      case PAUSED:
        return this.elapsedTimeSinceStart*this.speed/this.duration*100;
      case PLAYING:
        var timeSinseStart = this.context.currentTime - this.lastTime;
        return timeSinseStart*this.speed/this.duration*100;
    }
    return 0;
}

// TODO update time on change speed
AudioGraph.prototype.setSpeed = function(speed) {
    this.speed = speed;
    this.graphNodes.forEach(function(node,i) {
      node.playbackRate.value = speed;
    });
}

AudioGraph.prototype.setRecording = function(recording, stream) {
    this.activateRecording = recording;
    if(this.activateRecording) {
      this.initRecordingGraph(stream);
    } else {
      this.destroyRecordingGraph();
    }
}

// Return an AudioBuffer from recorded buffers
AudioGraph.prototype.getRecordedBuffer = function() {
    var buff = this.context.createBuffer(2, this.graphNodes[0].buffer.length, this.context.sampleRate);
    var b1 = buff.getChannelData(0);
    var b2 = buff.getChannelData(1);
    for(var i = this.recLength-1; i> 0; i--) {
      b1[i] = this.recBufferL[i];
      b2[i] = this.recBufferR[i];
    }
    return buff;
}

AudioGraph.prototype.resetRecordedBuffer = function() {
    this.recBufferL = [];
    this.recBufferR = [];
    this.recLength = 0;
}

