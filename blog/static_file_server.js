var sys = require("sys"),
http = require("http"),
path = require("path"),
url = require("url"),
fs = require("fs");

var Fileserver = function(){};

Fileserver.prototype.start = function(){
  console.log('Starting server @ http://127.0.0.1:9000/');  
  http.createServer(function(request, response){
  
    //pipe some details to the node console
    console.log('Incoming Request from: ' +
           request.connection.remoteAddress +
          ' for href: ' + url.parse(request.url).href);
  
    var img_name = url.parse(request.url).pathname;
    var full_path = path.join(__dirname, 'public', 'uploads', img_name);
    console.log(full_path);
    
    fs.exists(full_path,function(exists){
      if(!exists){
        response.writeHeader(404, {"Content-Type": "text/plain"});  
        response.write("404 Not Found\n");  
        response.end();
      }
      else{
        fs.readFile(full_path, "binary", function(err, file) {  
           if(err) {  
             response.writeHeader(500, {"Content-Type": "text/plain"});  
             response.write(err + "\n");  
             response.end();
           }  
           else{
            response.writeHeader(200);  
            response.write(file, "binary");  
            response.end();
          }
        });
      }
    });
  }).listen(9000, function() {
    //runs when our server is created
    console.log('Fileserver running @ http://127.0.0.1:9000/');
  });
};
exports.Fileserver = Fileserver;