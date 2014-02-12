var audio_app = angular.module('AudioApp', []);

audio_app.controller("PlayerCtrl", function ($scope, $http) {
  $scope.audioGraph = new AudioGraph(1);
  $scope.uploadedTrack = new Track("uploaded")
  $scope.tracks = [];
  $scope.subtracks = [];

  $scope.pausable = false;
  $scope.playable = false;
  $scope.stoppable = false;
  $scope.stopped = true;

  // Vitesse de lecture
  //
  $scope.speed = 25;

	$scope.volume = 100;

  /* -- CANVAS FOR TRACKS -- */
  $scope.canvas = document.querySelector("#subtracks_canvas");
  $scope.trackDrawer = new TrackDrawer($scope.canvas, 80, 20);

  // Create a second canvas
  $scope.frontCanvas = document.querySelector('#front_subtracks_canvas');
  $scope.frontCtx = $scope.frontCanvas.getContext('2d');

  $scope.frontCanvas.addEventListener('click', function(mouseEvent) {
    $scope.stop();
    $scope.play(mouseEvent.layerX / $scope.frontCanvas.width);
    $scope.$apply();
  }, false);
  /* -------- */

  /* -- CANVAS FOR UPLOADED TRACKS -- */
  $scope.uploadedCanvas = document.querySelector("#uploaded_subtracks_canvas");
  $scope.uploadedTrackDrawer = new TrackDrawer($scope.uploadedCanvas, 80, 20);

  // Create a second canvas
  $scope.uploadedFrontCanvas = document.querySelector('#front_uploaded_subtracks_canvas');
  $scope.uploadedFrontCtx = $scope.uploadedFrontCanvas.getContext('2d');

  $scope.uploadedFrontCanvas.addEventListener('click', function(mouseEvent) {
    $scope.stop();
    $scope.play(mouseEvent.layerX / $scope.frontCanvas.width);
    $scope.$apply();
  }, false);
  /* -------- */

  $scope.canvas_frequence_left = document.querySelector("#canvas_fequencies_left");
  $scope.canvas_frequence_right = document.querySelector("#canvas_fequencies_right");

  $scope.ctx_sound_left = $scope.canvas_frequence_left.getContext("2d");
  $scope.ctx_sound_right = $scope.canvas_frequence_right.getContext("2d");
  $scope.ctx_sound_right.translate($scope.canvas_frequence_right.width, 0);

  // Animatite function, periodicaly call
  //
  $scope.animate = function() {
    // update time line position
    var pos = $scope.audioGraph.getPercent()/100 * $scope.frontCanvas.width;

    // Draw time line on each canvas
    [$scope.frontCtx, $scope.uploadedFrontCtx].forEach(function(ctx) {
      // clear
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      // draw stuff
      ctx.beginPath();
      ctx.rect(pos-3, 0, 3, ctx.canvas.height);
      ctx.fillStyle = 'red';
      ctx.fill();
    })
    
    drawFrequencies($scope.audioGraph.analyser, $scope.canvas_frequence_left, $scope.canvas_frequence_right);

    // request new frame
    requestAnimFrame(function() {
      $scope.animate();
    });
  }
  $scope.animate();

  // Get all tracks on the server
  $http({method: 'GET', url: '/track'}).
    success(function(data, status, headers, config) {
        data.forEach(function(songName) {
            $scope.tracks.push(new Track(songName));
        });
    }).
    error(function(data, status, headers, config) {
      // TOTO
    });

  // Event when a track is selected
  $scope.$watch("selectedTrack",function() {
    if(!$scope.selectedTrack) return;

    $scope.selectedTrack.setDbPedia();

    $scope.stop();
    $scope.selectedTrack.load(function(subtracks) {
      $scope.$apply();
      // Counter to watch the evolution of the load
      var subtracksLoadedCount = 0;

      // TODO: prendre taille dynamiquement
      $scope.canvas.height = 80*subtracks.length+20*(subtracks.length-1);
      $scope.frontCanvas.height = $scope.canvas.height;
      // Load all subtracks
      $scope.selectedTrack.subtracks.forEach(function(subtrack,i) {
        $scope.selectedTrack.subtracks[i].load($scope.audioGraph, function(subtrack){
          $scope.$apply();
          if(++subtracksLoadedCount == subtracks.length) {
            $scope.setSubtracks();
            $scope.enablePlay();
          }
          $scope.trackDrawer.draw_track(subtrack.buffer, i);
        });
      });
    });
  });

  $scope.$watch("volume",function() {
    $scope.audioGraph.changeMasterVolume($scope.volume/100.0);
  })

  $scope.enablePlay = function() {
    $scope.$apply(function() {
      $scope.playable = true;
    });
  }

  $scope.play = function(start) {
    if($scope.stopped) $scope.audioGraph.play(start);
    else $scope.audioGraph.resume();
    $scope.pausable = true;
    $scope.stoppable = true;
    $scope.stopped = false;
  }

  $scope.pause = function() {
    $scope.audioGraph.pause();
    $scope.pausable = false;
  }

  $scope.stop = function() {
    $scope.audioGraph.stop();
    $scope.pausable = false;
    $scope.stoppable = false;
    $scope.stopped = true;
	}
  
  $scope.$watch("speed", function() {
    $scope.audioGraph.setSpeed($scope.speed/25);
  });

  $scope.setSubtracks = function() {
    var subtracks = $scope.uploadedTrack.subtracks;
    if($scope.selectedTrack)
      subtracks = subtracks.concat($scope.selectedTrack.subtracks);
    $scope.audioGraph.setSubtracks(subtracks);
  }

  $scope.addFile = function(fileName, arrayBuffer) {
    $scope.stop();
    var subtrack = new SubTrack(fileName, "");

    $scope.$apply(function() {
      $scope.uploadedTrack.subtracks.push(subtrack);
    });

    $scope.uploadedCanvas.height = 80*$scope.uploadedTrack.subtracks.length+20*($scope.uploadedTrack.subtracks.length-1);
    $scope.uploadedFrontCanvas.height = $scope.uploadedCanvas.height;
    
    subtrack.loadFromBuffer(arrayBuffer, $scope.audioGraph, function(subtrack) {
      /* DRAW TRACKS */
      $scope.uploadedTrack.subtracks.forEach(function(subtrack, i) {
        $scope.uploadedTrackDrawer.draw_track(subtrack.buffer, i);
      });
      $scope.setSubtracks();
      $scope.enablePlay();
    });
  }

  $scope.format_number = function(n,d){
    x=(''+n).length;
    p=Math.pow;
    d=p(10,d);
    x-=x%3
    return Math.round(n*d/p(10,x))/d+" kMGTPE"[x/3]
  }
});

audio_app.directive('dragAndDrop', function() {
  return {
    restrict: 'A',
    link: function($scope, elem, attr) {
      elem.off('.upload') // remove all events in namespace upload
      .on({
          'dragenter.upload': function(e) {
              e.stopPropagation();
              e.preventDefault();
          },
          'dragover.upload': function(e) {
              e.stopPropagation();
              e.preventDefault();
          },
          'drop.upload': function(e) {
              e.stopPropagation();
              e.preventDefault();

              var files = e.originalEvent.dataTransfer.files;
        
              for (var i = 0, f; f = files[i]; i++) {
                var reader = new FileReader();
                reader.onload = (function(theFile) {
                  return function(e) {
                    $scope.addFile(theFile.name, e.target.result);
                  };
                })(f);
                reader.readAsArrayBuffer(f);
              }
          }
        });
    }
  };
});
