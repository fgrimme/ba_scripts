var http = require('http');
var https = require('https');
var sys  = require('sys');
var fs = require('fs');
var Snoop = require('./snoops/snoop').Snoop;
var Permissions = require('./snoops/permissions').Permissions;
var BruteForce = require('./snoops/bruteForce').BruteForce;
var SQLi = require('./snoops/sqli').SQLi;
var XSS = require('./snoops/xss').XSS;
var Router = require('./services/router').Router;
var Logger = require('./services/logging').Logger;

var bruteOptions = {
		urls: ['/login', '/sign'],
		time: 30,
		max_tries: 10,
		free_mem: 120
	};

var permOptions = {
		blacklist: './conf/blacklist',
		whitelist: './conf/whitelist',
		unban: 40
	};

var router = new Router();
var logger = new Logger();

// detectives
var permissions = new Permissions(permOptions);
var bruteForce = new BruteForce(bruteOptions);
var sqli = new SQLi();
var xss = new XSS();
var snoop = new Snoop(router, permissions, [bruteForce, sqli, xss]);


// create the proxy server
http.createServer(function(request, response) {
	//sys.log(request.connection.remoteAddress + ": " + request.method + " " + request.url);

	// preform checks on the current request
	snoop.checkPermissions(request, response);
	
	var buffer = '';
	
	// options for the proxy request
	request.headers.host = '';
	var options = {
		hostname: 'localhost',
		port: 8080,
		path: request.url,
		method: request.method,
		headers: request.headers
	};

	// create the proxy request object
	var proxy_request = http.request(options); 
	// add listeners to the proxy request 
	proxy_request.addListener('response', function (proxy_response) {
	
		proxy_response.on('data', function(chunk) {
			response.write(chunk, 'binary');
		});

		proxy_response.on('end', function() {
			response.end();
		});

		proxy_response.on('error', function(error) {
			sys.log('request.listener - error: ' + error);
		});
			
		response.writeHead(proxy_response.statusCode, proxy_response.headers);
	});
		
	// add the listeners for the requests
	request.on('data', function(chunk) {
		buffer += chunk;
		proxy_request.write(chunk, 'binary');
	});

	request.on('end', function() {
		snoop.checkPatterns(request, response, buffer);
		proxy_request.end();
	});
	 
	request.on('error', function(error) {
		sys.log(err);
	});
	
	
}).listen(8081);
sys.log('starting http proxy firewall on port 8081');



var options = {
  key: fs.readFileSync('./keys/key.pem'),
  cert: fs.readFileSync('./keys/cert.pem')
};

var a = https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(8021);
sys.log('starting https proxy firewall on port 8021');