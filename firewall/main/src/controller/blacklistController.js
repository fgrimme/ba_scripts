va fs = require.resolve('fs');


var BlicklistController = function(){
	var _path = './conf/blicklist';
	
	this.updateBlacklist = funciton(ip){
		fs.appendFile(_path , ip, function (err) {
			if(err) sys.log('Error in updating blacklist [' + err + ']');
		});
	};
};

exports.BlacklistController = BlacklistController;