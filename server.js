// We need to use the express framework: have a real web server that knows how to send mime types etc.
var express=require('express');

// Init globals variables for each module required
var app = express()
, http = require('http')
, server = http.createServer(app);

// Indicate where static files are located  
app.configure(function () {  
	app.use(express.static(__dirname + '/'));  
});  

// Config
var PORT = 8082;

require("./routes/tracks")(app, __dirname);

// launch the http server on given port
server.listen(PORT);