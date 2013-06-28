var sys  = require('sys');
var fs   = require('fs');

PermissionController = function() {
	var _this = this;
   // list all ip addresses that should be blocked
	var _blacklist = [];
	// list all ip addresses that should be allowed
	var _whitelist = [];
	
	var _black_path = './conf/blacklist';
	var _white_path = './conf/whitelist';
	
	var _UNBLOCK = 60; 
	
	// watch the config files for black- and whitelist
	// if a file changes update the list at runtime - no restart required
	try {
		fs.watchFile(_black_path, function(c,p) { _this.updatePermissions(); });
		fs.watchFile(_white_path, function(c,p) { _this.updatePermissions(); });
	} catch (err){
		sys.log(err);
	}

	this.ban = function(ip){
		// determine linebreak of the current platform
		var nl = process.platform === 'win32' ? '\r\n' : '\n';
		// check if ip is already in the blacklist
		for (i in _blacklist) {
			if (_blacklist[i] == ip) {
				return;
			}
		}
		_blacklist.push(ip);
		// add ip to blacklist - file & memory
		fs.appendFile(_black_path , ip + nl, encoding='utf8', function (err) {
			if(err) sys.log('Error in updating blacklist [' + err + ']');
		});
	};
	
	var _unBan = function() {
		_blacklist = [];
		fs.writeFile(_black_path, '', function(err){
			if (err) {
				console.log(err);
			} else {
				sys.log('Deleting blacklist');			
			}
		});
		_blacklist = [];
		setTimeout(_unBan, _UNBLOCK*1000);
	};

	_unBan();
};

// read the allowed and blocked ip addresses from the config files
// triggered once when server starts & and everytime the config changes
PermissionController.prototype.updatePermissions = function() {
	sys.log("Updating permissions");
	try {
		_blacklist = fs.readFileSync('./conf/blacklist', encoding='utf8').split('\n')
						.filter(function(ip) { return ip.length });
		_whitelist = fs.readFileSync('./conf/whitelist', encoding='utf8').split('\n')
						.filter(function(ip) { return ip.length });
	} catch (err) {
		sys.log(err);
	}
}

// check if the ip is blacklisted/banned
// @param ip: the ip address to check
PermissionController.prototype.isBanned = function(ip){
	for (i in _blacklist) {
		if (_blacklist[i] == ip) {
			return true;
		}
	} 
	return false;
}

// if the config file is not empty check if the ip is whitelisted/allowed
// @param ip: the ip address to check
PermissionController.prototype.isAllowed = function(ip) {
	if (_whitelist.length == 0) return true;
	for (i in _whitelist) {
		if (_whitelist[i] == ip) {
			return true;
		}
	}
	return false;
}

// when invalid client deny the response
PermissionController.prototype.deny = function(response, msg) {
  response.writeHead(403);
  response.write(msg);
  response.end();
}

exports.PermissionController = PermissionController;