var http = require('http');
var sys  = require('sys');
var fs   = require('fs');

var blacklist = [];
var whitelist = [];

try {
	fs.watchFile('./conf/blacklist', function(c,p) { updatePermissions(); });
	fs.watchFile('./conf/whitelist', function(c,p) { updatePermissions(); });
} catch (err){
	sys.log(err);
}

function updatePermissions() {
	sys.log("Updating permissions");
	try {
		blacklist = fs.readFileSync('./conf/blacklist', encoding='utf8').split('\n')
						.filter(function(ip) { return ip.length });
		whitelist = fs.readFileSync('./conf/whitelist', encoding='utf8').split('\n')
						.filter(function(ip) { return ip.length });
	} catch (err) {
		sys.log(err);
	}
}

function isBanned(ip){
	for (i in blacklist) {
		if (blacklist[i] == ip) {
			return true;
		}
	} 
	return false;
}

function isAllowed(ip) {
	if (whitelist.length == 0) return true;
	for (i in whitelist) {
		if (whitelist[i] == ip) {
			return true;
		}
	}
	return false;
}

function deny(response, msg) {
  response.writeHead(403);
  response.write(msg);
  response.end();
}

http.createServer(function(request, response) {
	sys.log(request.connection.remoteAddress + ": " + request.method + " " + request.url);
	
	var ip = request.connection.remoteAddress;
	if (isBanned(ip)) {
		msg = "IP " + ip + " is banned!";
		deny(response, msg);
		sys.log(msg);
		return;
	}
	if (!isAllowed(ip)) {
		msg = "IP " + ip + " is not allowed to use this proxy";
		deny(response, msg);
		sys.log(msg);
		return;
	}
  
	request.headers.host = '';
	var options = {
		hostname: 'localhost',
		port: 8080,
		path: request.url,
		method: request.method,
		headers: request.headers
	};
  
	var proxy_request = http.request(options);  
  
	proxy_request.addListener('response', function (proxy_response) {

		proxy_response.addListener('data', function(chunk) {
			response.write(chunk, 'binary');
		});

		proxy_response.addListener('end', function() {
			response.end();
		});

		proxy_response.addListener('error', function(error) {
			sys.log('request.listener - error: ' + error);
		});
		
		response.writeHead(proxy_response.statusCode, proxy_response.headers);
	});
	 
	request.addListener('data', function(chunk) {
		proxy_request.write(chunk, 'binary');
	});

	request.addListener('end', function() {
		proxy_request.end();
	});
 
	request.addListener('error', function(error) {
	});
	
}).listen(8081);

updatePermissions();