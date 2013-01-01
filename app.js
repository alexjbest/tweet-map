var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , url = require('url')
  , path = require('path')
  , twitter = require('ntwitter');


app.listen(8080);

function load_static_file(uri, response) {
	var filename = path.join(process.cwd(), uri);
	fs.exists(filename, function(exists) {
		if(!exists) {
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
  consumer_key: 'H2xKLFmn4yrAsTsvcyFg',
  consumer_secret: 'tRuSeWMK2CbxINeKtIZkKom7JANMQ6oBmnhx8fetM',
  access_token_key: '144853729-1Djic1F6rNYPgvA83jfQLn4lWCN59smjaIjuucT8',
  access_token_secret: 'AM6pTLQcgPpAFje1VtTzoIlWIDzmdQRSr4of4OJ8JU'
});

twit.stream('statuses/sample', { }, function(stream) {
  stream.on('data', function (data) {
    //console.log(data['user']['name']);
    if (data['geo'] != null)
  {
	  console.log(data['coordinates']);
	  io.sockets.emit('tweets', data['coordinates']['coordinates']);
	  

  }
  });
});
