var sys  = require('sys');

BruteForce = function() {
	var _this = this;
	var _time = 10;
	var _max_tries = 10;
	var _connections = {};
	/*
	var _resetConnections = function(){
		setTimeout(function(){
			now = Date.now();
			for (i in _conections)
		}, 120);
	};
	*/
	var _reset = function(ip){
		_connections[ip]['tries'] = 1;
		_connections[ip]['timestamp'] = Date.now();
	};

	var _addConnection = function(ip){
		if (_connections[ip]) {
			sys.log('Increase ' + ip);
			_connections[ip]['tries'] += 1;
		} else {
			sys.log('Add ' + ip + ' to connections');
			_connections[ip] = {'tries': 1, 'timestamp': Date.now()};
		}
		sys.log(_connections[ip]['tries']);
	};
	
	this.check = function(ip){
		sys.log('BruteForce check ...');
		
		if (_connections[ip])  {
			tries = _connections[ip]['tries'];
			timestamp  = _connections[ip]['timestamp'];
			
			too_much = tries >= _max_tries;
			in_time  = timestamp + _time*1000 > Date.now();
			
			if (too_much && in_time){
				sys.log('IP: ' + ip + ' blocked');
				return true;
			} else if (!in_time) {
				sys.log('Reset counter for IP: ' + ip);
				_reset(ip);
			} else {
				_addConnection(ip);
			} 
		} else{
			_addConnection(ip);
		}
	};
};
exports.BruteForce = BruteForce;