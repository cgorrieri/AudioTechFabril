var audio_app = angular.module('AudioApp', []);

audio_app.controller("PlayerCtrl", function ($scope, $http) {
  $scope.audioGraph = new AudioGraph(1);
  $scope.uploadedTrack = new Track("uploaded");
  $scope.recordedTrack = new Track("recorded");
  $scope.tracks = [];
  $scope.subtracks = [];

  // Play status
  $scope.pausable = false;
  $scope.playable = false;
  $scope.stoppable = false;
  $scope.stopped = true;
  $scope.recordable == false;

  // Plaing speed
  $scope.speed = 25;

	$scope.volume = 100;

  // When click on a canvas
  $scope.changePositionInCanvas = function(mouseEvent) {
    $scope.stop();
    $scope.play(mouseEvent.offsetX / $scope.frontCanvas.width);
    $scope.$apply();
  }

  /* -- CANVAS FOR TRACKS -- */
  $scope.canvas = document.querySelector("#subtracks_canvas");
  $scope.trackDrawer = new TrackDrawer($scope.canvas, 80, 20);
  // Front canvas to draw time line
  $scope.frontCanvas = document.querySelector('#front_subtracks_canvas');
  $scope.frontCtx = $scope.frontCanvas.getContext('2d');
  // Add movement on click
  $scope.frontCanvas.addEventListener('click', $scope.changePositionInCanvas, false);
  /* -------- */

  /* -- CANVAS FOR UPLOADED TRACKS -- */
  $scope.uploadedCanvas = document.querySelector("#uploaded_subtracks_canvas");
  $scope.uploadedTrackDrawer = new TrackDrawer($scope.uploadedCanvas, 80, 20);
  // Front canvas to draw time line
  $scope.uploadedFrontCanvas = document.querySelector('#front_uploaded_subtracks_canvas');
  $scope.uploadedFrontCtx = $scope.uploadedFrontCanvas.getContext('2d');
  // Add movement on click
  $scope.uploadedFrontCanvas.addEventListener('click', $scope.changePositionInCanvas, false);
  /* -------- */

  /* -- CANVAS FOR Recorded TRACKS -- */
  $scope.recordedCanvas = document.querySelector("#recorded_subtracks_canvas");
  $scope.recordedTrackDrawer = new TrackDrawer($scope.recordedCanvas, 80, 20);
  // Front canvas to draw time line
  $scope.recordedFrontCanvas = document.querySelector('#front_recorded_subtracks_canvas');
  $scope.recordedFrontCtx = $scope.recordedFrontCanvas.getContext('2d');
  // Add movement on click
  $scope.recordedFrontCanvas.addEventListener('click', $scope.changePositionInCanvas, false);
  /* -------- */

  /* -- CANVAS TO DRAW FREQUENCES --*/
  $scope.canvas_frequence_left = document.querySelector("#canvas_fequencies_left");
  $scope.canvas_frequence_right = document.querySelector("#canvas_fequencies_right");

  $scope.ctx_sound_left = $scope.canvas_frequence_left.getContext("2d");
  $scope.ctx_sound_right = $scope.canvas_frequence_right.getContext("2d");
  $scope.ctx_sound_right.translate($scope.canvas_frequence_right.width, 0);
  /* -------- */

  /*-- RECORDING CANVAS --*/
  var rec_canvas = document.querySelector("#canvas_recording");
  $scope.recObjects = {
    canvas: rec_canvas,
    ctx2d: rec_canvas.getContext("2d"),
    samples: [],
    baseHeight: rec_canvas.height/2,
    coef: rec_canvas.height/2
  };

  for(var i = 0; i < rec_canvas.width; i++) $scope.recObjects.samples.push(0.0);
  $scope.recObjects.ctx2d.strokeStyle = '#EEEEEE';
  $scope.recObjects.ctx2d.lineWidth = 1;
  /* -------- */

  window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();

  $scope.oldPosition = 0;

  // Animatite function, periodicaly call
  // Draw time line and recording values
  $scope.animate = function() {
    // update time line position
    var pos = $scope.audioGraph.getPercent()/100 * $scope.frontCanvas.width;

    // Draw current recording
    if($scope.pausable && $scope.recordable) {
      var posI = Math.floor(pos);
      // Get max peak
      $scope.recObjects.samples[posI] = Math.max($scope.recObjects.samples[posI], $scope.audioGraph.peak);
      // If the position changed
      if(Math.floor($scope.oldPosition) != posI) {
        $scope.recObjects.ctx2d.beginPath();
        $scope.recObjects.ctx2d.moveTo(posI-0.5, $scope.recObjects.baseHeight - $scope.recObjects.samples[posI-1]*$scope.recObjects.coef - 1);
        $scope.recObjects.ctx2d.lineTo(posI-0.5, $scope.recObjects.baseHeight + $scope.recObjects.samples[posI-1]*$scope.recObjects.coef); 
        $scope.recObjects.ctx2d.stroke();
      }
    }

    // Draw time line on each canvas
    [$scope.frontCtx, $scope.uploadedFrontCtx, $scope.recordedFrontCtx].forEach(function(ctx) {
      // clear
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      // draw stuff
      ctx.beginPath();
      ctx.rect(pos-3, 0, 3, ctx.canvas.height);
      ctx.fillStyle = 'red';
      ctx.fill();
    })
    
    drawFrequencies($scope.audioGraph.analyser, $scope.canvas_frequence_left, $scope.canvas_frequence_right);

    $scope.oldPosition = pos;

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

    $scope.stop();
    $scope.selectedTrack.load(function(subtracks) {
      $scope.$apply();
      // Counter to watch the evolution of the load
      var subtracksLoadedCount = 0;

      $scope.updateCanvasSize($scope.canvas, $scope.frontCanvas, subtracks.length);
    
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

  // When volume is changed
  $scope.$watch("volume",function() {
    $scope.audioGraph.changeMasterVolume($scope.volume/100.0);
  });

  // Activate or desactivate recording
  $scope.setRecord = function(activate_record) {
    if(activate_record) {
      if (!navigator.getUserMedia)
          navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!navigator.cancelAnimationFrame)
          navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
      if (!navigator.requestAnimationFrame)
          navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

      navigator.getUserMedia({audio:true},
        function(stream) { 
          $scope.audioGraph.setRecording(true,stream);
          $scope.$apply(function() {
            $scope.recordable = true;
          })
        }, function(e) {
        });
    } else {
      $scope.audioGraph.setRecording(false);
      $scope.recordable = false;
    }
  }

  // Allows the user to press play button
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

  // Add all subtracks to the AudioGraph to be played
  $scope.setSubtracks = function() {
    var subtracks = $scope.uploadedTrack.subtracks.concat($scope.recordedTrack.subtracks);
    if($scope.selectedTrack)
      subtracks = subtracks.concat($scope.selectedTrack.subtracks);
    $scope.audioGraph.setSubtracks(subtracks);
  }

  // Add a subtrack from a file
  $scope.addFile = function(fileName, arrayBuffer) {
    $scope.stop();
    var subtrack = new SubTrack(fileName, "");

    $scope.$apply(function() {
      $scope.uploadedTrack.subtracks.push(subtrack);
    });

    $scope.updateCanvasSize($scope.uploadedCanvas, $scope.uploadedFrontCanvas, $scope.uploadedTrack.subtracks.length);
    
    subtrack.loadFromBuffer(arrayBuffer, $scope.audioGraph, function(subtrack) {
      /* DRAW TRACKS */
      $scope.uploadedTrack.subtracks.forEach(function(subtrack, i) {
        $scope.uploadedTrackDrawer.draw_track(subtrack.buffer, i);
      });
      $scope.setSubtracks();
      $scope.enablePlay();
    });
  }

  var recordNumber = 1;
  // Add a subtrack from the recorded buffer
  $scope.addRecord = function() {
    $scope.stop();
    // Set subtrack from buffer
    var subtrack = new SubTrack("Record "+(recordNumber++), "");
    subtrack.buffer = this.audioGraph.getRecordedBuffer();
    this.audioGraph.resetRecordedBuffer
    subtrack.loaded = true;
    this.recordedTrack.subtracks.push(subtrack);

    $scope.updateCanvasSize($scope.recordedCanvas, $scope.recordedFrontCanvas, this.recordedTrack.subtracks.length);

    $scope.recordedTrack.subtracks.forEach(function(subtrack, i) {
      $scope.recordedTrackDrawer.draw_track(subtrack.buffer, i);
    });

    $scope.recObjects.ctx2d.clearRect(0, 0, $scope.recObjects.canvas.width, $scope.recObjects.canvas.height);

    $scope.setSubtracks();
    $scope.enablePlay();
  }

  // Adjust canvas
  $scope.updateCanvasSize = function(canvas, front_canvas, number_elem) {
    canvas.height = 80*number_elem+20*(number_elem-1);
    front_canvas.height = canvas.height;
  }

  // Format number like 1k for 1000
  $scope.format_number = function(n,d){
    x=(''+n).length;
    p=Math.pow;
    d=p(10,d);
    x-=x%3
    return Math.round(n*d/p(10,x))/d+" kMGTPE"[x/3]
  }
});

// Attribute which allow drag and drop
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
