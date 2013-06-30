var http = require('http');
var https = require('https');
var sys  = require('sys');
var fs = require('fs');
var Permissions = require('./snoops/permissions').Permissions;
var BruteForce = require('./snoops/bruteForce').BruteForce;
var Router = require('./services/router').Router;
var Logger = require('./services/logging').Logger;

var bruteOptions = {
		urls: ['/login', '/sign'],
		time: 30,
		max_tries: 10,
		free_mem: 120
	};

var permissions = new Permissions();
var bruteForce = new BruteForce(bruteOptions);
var router = new Router();
var logger = new Logger();

// create the proxy server
http.createServer(function(request, response) {
	sys.log(request.connection.remoteAddress + ": " + request.method + " " + request.url);
	
	// check the requests against blacklist
	var ip = request.connection.remoteAddress;
	//ip = '1.1.9';
	if (permissions.isBanned(ip)) {
		router.drop(response);
		msg = "IP " + ip + " is banned";
		sys.log(msg);
		return;
	}	
	// check the requests against whitelist
	if (!permissions.isAllowed(ip)) {
		router.deny(response, msg);
		msg = "IP " + ip + " is not allowed to use this proxy";
		sys.log(msg);
		return;
	}
	// check the request for brute-force attacks
	if (bruteForce.check(ip, request.url)) {
		permissions.ban(ip);
		router.drop(response);
		msg = "IP " + ip + " is blocked because of too many requests";
		sys.log(msg);
		return;
	}
	// if nothing suspicious - forward the request
	router.forward(request, response);
	
}).listen(8081);
sys.log('Starting http proxy firewall on port 8081');

var options = {
  key: fs.readFileSync('./keys/key.pem'),
  cert: fs.readFileSync('./keys/cert.pem')
};

var a = https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(8021);
sys.log('Starting https proxy firewall on port 8021');