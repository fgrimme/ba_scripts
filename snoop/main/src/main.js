var sys  = require('sys');
var fs  = require('fs');
var Snoop = require('./snoops/snoop').Snoop;
var Permissions = require('./snoops/permissions').Permissions;
var BruteForce = require('./snoops/bruteforce').BruteForce;
var SQLi = require('./snoops/sqli').SQLi;
var LFI = require('./snoops/lfi').LFI;
var XSS = require('./snoops/xss').XSS;
var Router = require('./services/router').Router;
var Logger = require('./services/logging').Logger;
var HttpServer = require('./server/http').Server; 
var HttpsServer = require('./server/https').Server; 
var TestApp = require('./server/testapps').Server; 
var FileServer = require('./server/static').FileServer; 
var config = require('./conf/config.json');

var bruteOptions = {
		urls: ['/login', '/sign'],
		time: 30,
		max_tries: 10,
		free_mem: 120
	};

var permOptions = {
		blacklist: './conf/blacklist',
		whitelist: './conf/whitelist',
		unban: 30
	};

var routerOpts = {
	http : {
		'localhost' : {
			hostname: 'localhost',
			port: 9000
		}
	}, 
	https : {
		'localhost' : {
			hostname: 'localhost',
			port: 9021
		}
	}
};

var httpsOpts = {
		port : 8021,
		keys : {
			key: './keys/key.pem',
			cert: './keys/cert.pem'
		}
	};

var router = new Router(config.router);
var logger = new Logger(config.logging);

// detectives
var permissions = new Permissions(config.permissions);
var bf = new BruteForce(config.bruteforce);
var sqli = new SQLi();
var xss = new XSS();
var lfi = new LFI();
var snoop = new Snoop(router, permissions, [bf, sqli, xss, lfi]);

// server
var fileServer = new FileServer();
var httpServer = new HttpServer(router, snoop, fileServer, {});
httpServer.start();
var httpsServer = new HttpsServer(router, snoop, fileServer, config.https);
httpsServer.start();

var testApp = new TestApp(fileServer);
testApp.startHttp();
testApp.startHttps();
