var TRACK_HEIGHT = 30;

// Draw a track in a canvas
// track: an AudioBuffer object
// canvas: reference to a canvas object
// position: position of the track in the list (start to 0)
function draw_track(track, canvas, position) {
	console.log("TODO: Draw track");
	return;
	// init context to draw on the canvas
	var ctx=canvas.getContext("2d");
	var baseHeight = position*TRACK_HEIGHT+TRACK_HEIGHT/2;

	ctx.strokeStyle = 'yellow';
    ctx.fillStyle = '#303030';
    ctx.beginPath();
	ctx.moveTo(0, baseHeight);

	// Pas entre chaque sample
	var pas = canvas.width/track.length;

	var channel;
	var buffer = track.getChannelData(0);

	// initiate samples
	var samples = [];

	// set samples

	// loop on samples to draw them
	var i;
	for(i = 0; i < buffer.length; i++) {
		//console.log(i, buffer[i]);
		ctx.lineTo(i,baseHeight+buffer[i]*TRACK_HEIGHT);
		for(var j = 0; j < track.numberOfChannels; j++) {

		}
	}

	ctx.stroke(); 
	ctx.closePath();
}