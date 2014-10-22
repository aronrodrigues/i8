var bunyan = require('bunyan');
var i8 = require('../main/index.js');
console.dir(i8);

var logger = i8.createLogger({ name: 'serverTest'});
var server = i8.createServer(logger);
                                  
var router = i8.createRouter();
router.get('/', function(req, res, next) {
  res.send('<ul>'+ 
           '<li><a href="404.html">404</a></li>' + 
           '<li><a href="api/404">api/404</a></li>' + 
           '<li><a href="api/appInfo">api/appInfo</a></li>' + 
           '</ul>');
  
});

server.use(router, 'TestRouter');

server.startup();