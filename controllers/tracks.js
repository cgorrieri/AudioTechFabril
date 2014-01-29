var fs = require("fs");

var TRACKS_PATH = './multitrack/';

module.exports = {
	getTracks: function(callback) {
		getFiles(TRACKS_PATH, callback);
	},

	getTrack: function(id, callback) {
		getFiles(TRACKS_PATH + id, function(fileNames) {
			//console.log(filesNames);
			var track = {
				id: id,
				instruments: []	
			};
			fileNames.sort();
			for (var i = 0; i < fileNames.length; i += 2) {
				var instrument = fileNames[i].match(/(.*)\.[^.]+$/, '')[1];
				track.instruments.push({
					name: instrument,
					sound: instrument + '.mp3',
					visualisation: instrument + '.png'
				});
			}
			callback(track);
		})
	}
};

var getFiles = function(dirName, callback) {
	console.log("dirname", dirName);
	fs.readdir(dirName, function(error, directoryObject) {
		callback(directoryObject);
	});
}