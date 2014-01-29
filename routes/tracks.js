var tracks = require('../controllers/tracks');

var TRACKS_PATH = 'multitrack/';

module.exports = function(app, basename) {
	// routing
	app.get('/', function (req, res) {
		res.sendfile(__dirname + '/index.html');
	});

	// routing
	app.get('/track', function (req, res) {
		tracks.getTracks(function (trackList) {
			if (!trackList)
				return res.send(404, 'No track found');
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(trackList));
			res.end();
		}); 
	});

	// routing
	app.get('/track/:id', function (req, res) {
		var id = req.params.id;
		
		tracks.getTrack(id, function (track) {
			if (!track)
				return res.send(404, 'Track not found with id "' + id + '"');
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(track));
			res.end();
		});
	});

	// routing
	app.get(/\/track\/(\w+)\/(?:sound|visualisation)\/((\w|.)+)/, function (req, res) {
		console.log(basename + '/' + TRACKS_PATH + req.params[0] + '/' + req.params[1]);
		res.sendfile(basename + '/' + TRACKS_PATH + req.params[0] + '/' + req.params[1]);
	});
}