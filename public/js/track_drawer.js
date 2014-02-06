function TrackDrawer(canvas, track_height, outline_height) {
  this.track_height = track_height;
  this.outline_height = outline_height;
  // Setup canvas
  this.canvas = canvas;
  this.ctx_2D=this.canvas.getContext("2d");
  this.ctx_2D.strokeStyle = '#202020';
  this.ctx_2D.lineWidth = 1;
}

// Draw a track in the canvas
// track: an AudioBuffer object
// position: position of the track in the list (start to 0)
TrackDrawer.prototype.draw_track = function(track, position) {

	var baseHeight = position*(this.track_height + this.outline_height)+this.track_height/2;

	// Step between samples
	var pas = this.canvas.width/track.length;

  var index,i,j,buffer;

	// initiate samples
	var samples = [];
  for(i = 0; i<this.canvas.width; i++) {
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

  this.ctx_2D.beginPath();

  // Draw samples
  for(i = 0; i < samples.length; i++) {
    this.ctx_2D.moveTo(i+0.5, baseHeight - samples[i]*this.track_height/2 - 1);
    this.ctx_2D.lineTo(i+0.5, baseHeight + samples[i]*this.track_height/2); 
  }

  this.ctx_2D.stroke();
}