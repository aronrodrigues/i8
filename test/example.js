var i8 = require('../main/index.js');
var logger = i8.createLogger({ name: 'serverTest'});
var server = i8.createServer(logger);
                                  
var router = i8.createRouter();
router.get('/', function(req, res, next) {
  res.send('<ul>'+ 
           '<li><a href="404.html">404</a></li>' + 
           '<li><a href="api/404">api/404</a></li>' + 
           '<li><a href="api/appInfo">api/appInfo</a></li>' + 
           '<li><a href="error">error</a></li>' +
           '<li><a href="api/error">api/error</a></li>' +
           '<li><a href="api/secure?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InRlc3RVc2VyIiwiZGF0ZSI6MTQxMzk5ODg4OTM0Mn0.a10pCGZ1cSiNpKzTSXntI1HPo5MZbNQmWzF4joKRuus">api/secure?token</a></li>' +
           '<li><a href="api/secure">api/secure</a></li>' +
           '<li><a href="api/issueToken">api/issueToken</a></li>' +
           '</ul>');
});

server.register404Callback(function(req, res, next) {
  res.send('You requested the url ' + req.url + ' but it does not exist on our servers.');
});

server.registerErrorCallback(function(err, req, res, next) {
  res.send('The error ' + err.message + ' ocurred and your request cannot be completed.');
});

router.get('/error', function(req, res, next) {
  throw Error('TestError');
})

router.get('/api/error', function(req, res, next) {
  throw Error('ApiTestError');
})

var security = i8.security;
security.setup(logger, 'TOKEN_SALT', function(obj, done) {
  done(obj);
});

router.get('/api/secure', security.isAuth, function(req, res, next) {
  res.send('user: ' + req.user.username + '<br /> date: ' + req.user.date);
}); 

router.get('/api/issueToken', function(req, res, next) {
  res.send('<p>token ' + security.issueToken({username: "testUser", date: 1413998889342}) + '</p>' + 
          '<p>token eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InRlc3RVc2VyIiwiZGF0ZSI6MTQxMzk5ODg4OTM0Mn0.a10pCGZ1cSiNpKzTSXntI1HPo5MZbNQmWzF4joKRuus</p>');
}); 

server.use(router, 'TestRouter');

server.startup();