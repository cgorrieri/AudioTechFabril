function Track(name) {
    this.loaded = false;
    this.name = name;
    this.subtracks = [];
}

Track.prototype.load = function(callback) {
    if(!this.loaded) {
        // load songs
        var xhr = new XMLHttpRequest();
        xhr.open('GET', "track/" + this.name, true);

        var thus = this;

        xhr.onload = function(e) {
            var track = JSON.parse(this.response);

            track.instruments.forEach(function(instrument, trackNumber) {
                // load audio dans un tableau...
                var url = "track/" + thus.name + "/sound/" + instrument.sound;
                var subTrack = new SubTrack(instrument.name, url);
                thus.subtracks.push(subTrack);
            });
            if(callback) callback(thus.subtracks);
        };
        xhr.send();
    }
    if(callback) callback(this.subtracks);
}