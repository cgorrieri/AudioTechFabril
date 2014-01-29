function SubTrack(name, url) {
    this.name = name;
    this.url = url;
    this.loaded = false;
    this.buffer = {};
    this.mutted = false;
    this.progress = 0;
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
            thus.progress = e.loaded/e.total*100;
        }
        request.onerror = function() {
            //alert('BufferLoader: XHR error');
            callbackError();
        }

        request.send();
    }
}