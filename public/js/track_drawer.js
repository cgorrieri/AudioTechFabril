var TRACK_HEIGHT = 80;

// Draw a track in a canvas
// track: an AudioBuffer object
// canvas: reference to a canvas object
// position: position of the track in the list (start to 0)
function draw_track(track, canvas, position) {
	
	// init context to draw on the canvas

	var baseHeight = position*(TRACK_HEIGHT + 20)+TRACK_HEIGHT/2;

	// Pas entre chaque sample
	var pas = canvas.width/track.length;

  var index,i,j,buffer;

	// initiate samples
	var samples = [];
  for(i = 0; i<canvas.width; i++) {
    samples[i]=0;
  }

  // Compute sampes
  // Get max values from all channels
  for(j = 0; j < track.numberOfChannels ; j++) {
    buffer = track.getChannelData(j);
  	for(i = 0; i < buffer.length; i++) {
      index = parseInt(i*pas);
      samples[index] = Math.max(samples[index], buffer[i]);
  	}
  }

  var ctx=canvas.getContext("2d");

  ctx.strokeStyle = '#202020';
  ctx.lineWidth = 1;

  ctx.beginPath();

  // Draw samples
  for(i = 0; i < samples.length; i++) {
    ctx.moveTo(i+0.5, baseHeight - samples[i]*TRACK_HEIGHT/2 - 1);
    ctx.lineTo(i+0.5, baseHeight + samples[i]*TRACK_HEIGHT/2); 
  }

  ctx.stroke();
}