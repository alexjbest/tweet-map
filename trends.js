var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, fs = require('fs')
, url = require('url')
, path = require('path')
, twitter = require('ntwitter');

var config = require('./config.js');

//app.listen(config.port);
app.listen(8081);

var trends;

function load_static_file(uri, response) {
    var filename = path.join(process.cwd(), uri);
    console.log(uri);
    fs.exists(filename, function(exists) {
        if(!exists || uri.substring(0,10) == "/config.js") {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }
        fs.readFile(filename, "binary", function(err, file) {
            if(err) {
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }
            response.writeHead(200);
            response.write(file, "binary");
            response.end();
        });
    });
}

function handler (req, res) {
    var uri = url.parse(req.url).pathname;
    if(uri === "/index.html") {
        fs.readFile(__dirname + '/index.html',
                function (err, data) {
                    if (err) {
                        res.writeHead(500);
                        return res.end('Error loading index.html');
                    }

                    res.writeHead(200);
                    res.end(data);
                });
    }
    else {
        load_static_file(uri, res);
    }
}

var twit = new twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
});
function startStream() {
	return twit.stream('statuses/sample', { }, function(stream) {
	    tStream = stream;
	    stream.on('data', function (data) {
	        if (data['geo'] != null)
	        {
	            console.log(data['coordinates']);
	            io.sockets.emit('tweets', data['coordinates']['coordinates']);
	        }
	    });
	    stream.on('disconnect', function (disconnectMessage) {
		console.log("Disconnected: "+disconnectMessage);
		stream.start();
	    });
	});
}



function getTrends() {
    console.log("===Refreshing tweets===");
    twit.get('trends/place', {id: '1'}, function(err, reply) {
	console.log(err);
	trends = reply.trends;
    });
    console.log(trends);
    startStream();
}

setInterval(getTrends, 5000);
startStream();
