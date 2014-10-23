#i8

Basic express wrapper. More than express, it's a freeway. It's a tribute to San Diego, CA

###Hello World:
```javascript
var i8 = require('i8');
var logger = i8.createLogger({ name: 'serverTest'});
var server = i8.createServer(logger);

var router = i8.createRouter();
router.get('/', function(req, res, next) {
  res.send('Hello world');
});
server.use(router, 'TestRouter');

server.startup();
```
The i8 server provides the following functions:
* env.json configuration
* Application Info /api/appInfo
* Default and extensible error handling
* 404 handling
* server.use() & server.static()

###env.json configuration
Given an env.json file
```javascript
{ "development": { 
    "dbUrl": "mongo://localhost/dev"
  },
  "production": { 
    "dbUrl": "mongo://localhost/prd"
  }
}
```

```javascript
var i8 = require('i8');
var logger = i8.createLogger({ name: 'serverTest'});
var server = i8.createServer(logger);
var config = server.getConfig();
console.dir(config)
```
It will display **mongo://localhost/dev**
*(By default the i8 server considers the environment as development).*

But, if the NODE_ENV is defined to *'production'*
```javascript
process.env.NODE_ENV = 'production';
var i8 = require('i8');
var logger = i8.createLogger({ name: 'serverTest'});
var server = i8.createServer(logger);
var config = server.getConfig();
console.dir(config)
```
It will display **mongo://localhost/prd**


###Application Info /api/appInfo

Another useful feature is the default route */api/appInfo*. Any time the server is started it reads the packages.json and returns an object with application name, version and environment.
```javascript
// GET:/api/appInfo
{"name":"i8","version":"1.3.0","environment":"development"}
```

###Default and extensible error handling
The default error handler will set the status code to 500 (only if it is 200) log the url and the stacktrace.
If the url starts with /api it will return an object with the error message {message: xyz}. Otherwise, not /api, it will check for a registred errorCallback and if it is registred, calls it. If no function is registred then it will return a page with *statusCode: message*

```javascript
var i8 = require('i8');
var logger = i8.createLogger({ name: 'serverTest'});
var server = i8.createServer(logger);
                                  
var router = i8.createRouter();
router.get('/', function(req, res, next) {
  res.send('<ul>'+ 
           '<li><a href="error">error</a></li>' +
           '<li><a href="api/error">api/error</a></li>' +
           '</ul>');
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
server.startup();

```

You can also override *server.setErorHandler(fn)* before the startup if the current behaviour does not fit your needs.
```javascript
server.setErrorHandler(function(err, req, res, next) {
    res.send('SERVER_ERROR!');
});
```

###404 handling
When a route is not found in the server, the i8 will set the status to 404 and throw an error (that will be handled by the errorHandler). You can override this, simply by registering a 404callback function. If you do that you have to handle the '/api' request too (maybe with a next(Error(notFound)?)
```javascript
var i8 = require('i8');
var logger = i8.createLogger({ name: 'serverTest'});
var server = i8.createServer(logger);

server.register404Callback(function(req, res, next) {
  res.send('You requested the url ' + req.url + ' but it does not exist on our servers.');
});

server.startup();
```

### server.use() & server.static()
Those are wrappers to remove the need of the express dependency on your project.

## API

## i8

### i8.createServer(logger)
Creates a new server instance. 
* logger is a required bunnyan logger.

### i8.createLogger(logParams)
Creates a bunnyan logger. 
* logParams {name: loggerName, ...} You need to pass an object with at least the name.

### i8.createRouter()
Creates an express router. You must use server.use(router, 'comment') to append it to the server.

### i8.security.setup(logger, tokenSalt, deserializeCallback)
Configures the JWT Auth. 
* logger is a bunnyan logger
* tokenSalt is a constant to crypt and decrypt the tokens 
* deserializeCallback is a callback function with signature(object, done) where:
* * object is the decrypted token
* * done is a function(user). If user is null the access is not granted, otherwise it will set req.user. 

### i8.security.issueToken(obj)
Returns the object passed as argument encrypted.
* obj an object usually with the username {username: 'foo', expires: 1982391823123 }

### i8.security.isAuth(req, res, next)
Sets req.user *(done called on setup)* if the token/user is valid, othwerwise, usually returns a 401 error unless the token cannot be decrypted(500).
* req request express route param
* res response express route param
* next continue the flow express route param

## server

### server.startup(callback)
Starts listening on configured ports with registred routes.
* callback to be called after the server is started.
* 
### server.use(arg1, arg2)
Register a route or middleware*
* arg1 could be a path or a middleware.
* arg2 if arg1 is a path, arg2 must be a router, else, it will be use as a log message to the middleare addition. 

### server.static(url, path)
Register the path to serve static files.
* url network url
* path filesystem path

### server.registerErrorCallback(callback) 
Register a function to be called when an  error occur.
* callback

### server.register404Callback(callback) 
Register a function to be called when a path is not found.

### server.setErrorHandler(errorHandler)
Sets another errorhandler.

### server.getConfig()
Returns the configuration used by the server.
