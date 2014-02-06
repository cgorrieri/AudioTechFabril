
function PlayerCtrl ($scope, $http) {
	$scope.audioGraph = new AudioGraph(1);
	$scope.tracks = [];
	$scope.subtracks = [];

	$scope.pausable = false;
	$scope.playable = false;
	$scope.stoppable = false;
	$scope.stopped = true;

  // Vitesse de lecture
  //
  $scope.speed = 1;

	$scope.volume = 100;

  $scope.canvas = document.querySelector("#subtracks_canvas");
  $scope.trackDrawer = new TrackDrawer($scope.canvas, 80, 20);

  $scope.canvas_frequence_left = document.querySelector("#canvas_fequencies_left");
  $scope.canvas_frequence_right = document.querySelector("#canvas_fequencies_right");

  $scope.ctx_sound_left = $scope.canvas_frequence_left.getContext("2d");
  $scope.ctx_sound_right = $scope.canvas_frequence_right.getContext("2d");
  $scope.ctx_sound_right.translate($scope.canvas_frequence_right.width, 0);

  // Create a second canvas
  $scope.frontCanvas = document.createElement('canvas');
  $scope.frontCanvas.id = 'canvasFront';
  // Add it as a second child of the mainCanvas parent.
  $scope.canvas.parentNode.appendChild($scope.frontCanvas);
  // make it same size as its brother
  $scope.frontCanvas.width = $scope.canvas.width;
  $scope.frontCtx = $scope.frontCanvas.getContext('2d');

  $scope.frontCanvas.addEventListener('click', function(mouseEvent) {
    $scope.stop();
    $scope.play(mouseEvent.layerX / $scope.frontCanvas.width);
    $scope.$apply();
  }, false);

  // Animatite function, periodicaly call
  //
  $scope.animate = function() {
    // update
    var pos = $scope.audioGraph.getPercent()/100 * $scope.frontCanvas.width;

    // clear
    $scope.frontCtx.clearRect(0, 0, $scope.frontCanvas.width, $scope.frontCanvas.height);

    // draw stuff
    $scope.frontCtx.beginPath();
    $scope.frontCtx.rect(pos-3, 0, 3, $scope.frontCanvas.height);
    $scope.frontCtx.fillStyle = 'red';
    $scope.frontCtx.fill();

    drawFrequencies($scope.audioGraph.analyser, $scope.canvas_frequence_left, $scope.canvas_frequence_right);

    // request new frame
    requestAnimFrame(function() {
      $scope.animate();
    });
  }
  $scope.animate();

	$http({method: 'GET', url: '/track'}).
	  success(function(data, status, headers, config) {
	    //var songList = JSON.parse(data);
        data.forEach(function(songName) {
            $scope.tracks.push(new Track(songName));
        });
        //if(callback) callback(thus.tracks);
	  }).
	  error(function(data, status, headers, config) {
	    // TOTO
	  });

	$scope.$watch("selectedTrack",function() {
		if(!$scope.selectedTrack) return;

    console.log("ici");
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
            $scope.audioGraph.setSubtracks($scope.selectedTrack.subtracks);
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
    $scope.audioGraph.speed = $scope.speed;
    $scope.audioGraph.setSpeed();
  }, true);
  
}