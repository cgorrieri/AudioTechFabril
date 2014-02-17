function Track(name) {
    this.loaded = false;
    this.name = name;
    this.subtracks = [];

    // DBpedia datas
    this.title = "";
    this.description = "";
    this.image = "";
    this.url = "";
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

      DBpedia.getTitle(this.name, function(value) {
        thus.title = value;
      });

      DBpedia.getAbstract(this.name, function(value) {
        thus.description = value;
      });

      DBpedia.getPictureURL(this.name, function(value) {
        thus.image = value;
      });

      DBpedia.getWikipediaPage(this.name, function(value) {
        thus.url = value;
      });
  } else {
      if(callback) callback(this.subtracks);
  }
}