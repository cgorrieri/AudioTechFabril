function Track(name) {
    this.loaded = false;
    this.name = name;
    this.title = "";
    this.description = "";
    this.image = "";
    this.url = "";
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
          thus.loaded = true;
          if(callback) callback(thus.subtracks);
      };
      xhr.send();
  } else {
      if(callback) callback(this.subtracks);
  }
}

Track.prototype.setDbPedia = function () {
  var thus = this;
    getTitle(this.name, function(value) {
      thus.title = value;
    });

    getAbstract(this.name, function(value) {
      thus.description = value;
    });

    getPictureURL(this.name, function(value) {
      thus.image = value;
    });

    getWikipediaPage(this.name, function(value) {
      thus.url = value;
    });
}
