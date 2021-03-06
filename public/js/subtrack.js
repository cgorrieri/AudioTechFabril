function SubTrack(name, url) {
    // subtrack name
    this.name = name;
    // subtrack URL
    this.url = url;
    // boolean used to avaoid to reload
    // the subtrack if it already loaded
    this.loaded = false;
    // Loading progress
    this.progress = 0;
    // AudioBuffer object
    this.buffer = {};
    // used to mute or unmute the track
    this.mutted = false;
    // the volume for this node
    this.volume = 100;
    // The AudioGraph Volume node associated to this subtrack
    this.volumeNode = undefined;
}

SubTrack.prototype.loadFromBuffer = function(arrayBuffer, audioGraph, callbackLoad, callbackError) {
    var thus = this;
    audioGraph.context.decodeAudioData(
        arrayBuffer,
        function(buffer) {
            if (!buffer) {
                alert('error decoding buffer');
                return;
            }
            thus.buffer = buffer;
            thus.loaded = true;
            if(callbackLoad) callbackLoad(thus);
        },function() {
          callbackError("Not an AudioBuffer")
        }
    );
}

SubTrack.prototype.load = function(audioGraph, callbackLoad, callbackError) {
    // If not loaded
    if(!this.loaded) {
        var request = new XMLHttpRequest();
        request.open("GET", this.url, true);

        request.responseType = "arraybuffer";

        var thus = this;

        request.onload = function() {
            // Asynchronously decode the audio file data in request.response
            thus.loadFromBuffer(request.response, audioGraph, callbackLoad, callbackError);
        }

        request.onprogress = function(e) {
            //console.log("loaded : " + e.loaded + " total : " + e.total);
            thus.setProgress(e.loaded/e.total*100);
        }
        request.onerror = function() {
            //alert('BufferLoader: XHR error');
            callbackError("error on network access");
        }

        request.send();
    } 
    // If already loaded
    else {
        this.setProgress(100);
        if(callbackLoad) callbackLoad(this);
    }
}

SubTrack.prototype.setProgress = function(value) {
  this.progress = value;
}

SubTrack.prototype.setVolume = function() {
  this.mutted = this.volume == 0;
  if(this.volumeNode) {
    this.volumeNode.gain.value = this.volume * this.volume / 10000
  }
}

SubTrack.prototype.mute = function() {
  this.volume = 0;
  this.setVolume();
}

SubTrack.prototype.unmute = function() {
  this.volume = 100;
  this.setVolume();
}