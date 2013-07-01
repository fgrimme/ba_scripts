var sys = require('sys');
var type = require('../utils/type').Type;

var Snoop = function(router, permissions, snoops){
	var _router = router;
	var _permissions = permissions;
	var _snoops = snoops || [];
	
	if (!_permissions) throw 'need permissions to check';
	if (!_router) throw 'need router to route';
	
	
	this.check = function(request, response){
		// check if the ip is allowed/banned
		_checkPermissions(request, response);
		// check if the data/cookies contain attack signatures
		_checkPatterns(request, response);
	};
	
	this.checkPermissions = function(request, response){
		// ip address of the crrent request
		var ip = request.connection.remoteAddress;
		
		// check the requests against blacklist
		if (permissions.isBanned(ip)) {
			router.drop(response);
			msg = "ip " + ip + " is banned";
			sys.log(msg);
			return;
		}
		// check the requests against whitelist
		if (!permissions.isAllowed(ip)) {
			msg = "ip " + ip + " is not allowed to use this proxy";
			router.reject(response, msg);
			sys.log(msg);
			return;
		}
	};
	
	this.checkPatterns = function(request, response, buffer) {
		// ip address of the crrent request
		var ip = request.connection.remoteAddress;
		if (type.compare(_snoops, [])) {
			for (var i in _snoops) {
				var snoop = _snoops[i];
				// check the request for brute-force attacks
				if (snoop.check(request, response, buffer)) {
					// add ip to the blacklist
					permissions.ban(ip);
					// dropping the request by ending the response
					router.drop(response);
					msg = "IP " + ip + " is blocked - suspicious behavoir detected";
					sys.log(msg);
					return;
				}
			}
		}
	};
};

exports.Snoop = Snoop;