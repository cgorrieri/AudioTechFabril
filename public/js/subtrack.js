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

SubTrack.prototype.load = function(audioGraph, callbackLoad, callbackError) {
    if(!this.loaded) {
        var request = new XMLHttpRequest();
        request.open("GET", this.url, true);

        request.responseType = "arraybuffer";

        var thus = this;

        request.onload = function() {
            // Asynchronously decode the audio file data in request.response
            audioGraph.context.decodeAudioData(
                    request.response,
                    function(buffer) {
                        if (!buffer) {
                            alert('error decoding file data: ' + url);
                            return;
                        }
                        thus.buffer = buffer;
                        thus.loaded = true;
                        if(callbackLoad) callbackLoad(thus);
                    },
                    function(error) {
                        console.error('decodeAudioData error', error);
                    }
            );
        }

        request.onprogress = function(e) {
            //console.log("loaded : " + e.loaded + " total : " + e.total);
            thus.setProgress(e.loaded/e.total*100);
        }
        request.onerror = function() {
            //alert('BufferLoader: XHR error');
            callbackError();
        }

        request.send();
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