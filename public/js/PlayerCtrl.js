
function PlayerCtrl ($scope, $http) {
	$scope.audioGraph = new AudioGraph(1);
	$scope.tracks = [];
	$scope.subtracks = [];

	$scope.pausable = false;
	$scope.playable = false;
	$scope.stoppable = false;
	$scope.stopped = true;

  $scope.canvas = document.querySelector("#subtracks_canvas");

	$scope.volume = 100;

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
    $scope.selectedTrack.load(function(subtracks) {
    	$scope.$apply();
  		var subtracksLoadedCount = 0;
      $scope.canvas.height = 80*subtracks.length+20*(subtracks.length-1);
      $scope.selectedTrack.subtracks.forEach(function(subtrack,i) {
        $scope.selectedTrack.subtracks[i].load($scope.audioGraph, function(subtrack){
          //$scope.$apply();
          if(++subtracksLoadedCount == subtracks.length) {
            $scope.audioGraph.setSubtracks($scope.selectedTrack.subtracks);
            $scope.enablePlay();
          }
          draw_track(subtrack.buffer, $scope.canvas, i);
        });
      });
		});
	});

	$scope.$watch("volume",function() {
		console.log($scope.volume/100.0);
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
	    //$scope.$apply(function() {
			$scope.pausable = true;
			$scope.stoppable = true;
		//});
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
}