#i8

Basic express wrapper. More than express, it's a freeway. It's a tribute to San Diego, CA

###Hello World:
```javascript
var i8 = require('i8');
var logger = require('bunyan').createLogger({ name: 'serverTest'});
var server = i8.Server(logger);

var handler = {
  get: [{
    path: '/', action: function (req, res, next) {
      res.send('Hello World');
    }
  }]
}
server.use(i8.handleToRouter(handler), 'TestRouter');

server.startup();
```
The i8 server provides the following functions:
* env.json configuration (server.getConfig)
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
var logger = require('bunyan').createLogger({ name: 'serverTest'});
var server = i8.Server(logger);
var config = server.getConfig();
console.dir(config)
```
It will display **mongo://localhost/dev**
*(By default the i8 server considers the environment as development).*

But, if the NODE_ENV is defined to *'production'*
```javascript
process.env.NODE_ENV = 'production';
var i8 = require('i8');
var logger = require('bunyan').createLogger({ name: 'serverTest'});
var server = i8.Server(logger);
var config = server.getConfig();
console.dir(config)
```
It will display **mongo://localhost/prd**

###Default and extensible error handling
The default error handler will set the status code to 500 (only if it is 200) log the url and the stacktrace.
If the url starts with /api it will return an object with the error message {message: xyz}. Otherwise, not /api, it will check for a registred errorCallback and if it is registred, calls it. If no function is registred then it will return a page with *statusCode: message*

```javascript

var i8 = require('i8');
var logger = require('bunyan').createLogger({ name: 'serverTest'});
var server = i8.Server(logger);
        
var handler = {
  get: [{
    path: '/', action: function (req, res, next) {
      res.send('<ul>'+ 
           '<li><a href="error">error</a></li>' +
           '<li><a href="api/error">api/error</a></li>' +
           '</ul>');
    }
  }]
}
server.use(i8.handleToRouter(handler), 'TestRouter');

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
var logger = require('bunyan').createLogger({ name: 'serverTest'});
var server = i8.Server(logger);

server.register404Callback(function(req, res, next) {
  res.send('You requested the url ' + req.url + ' but it does not exist on our servers.');
});

server.startup();
```

### server.use() & server.static()
Those are wrappers to remove the need of the express dependency on your project.

## API

## i8

### new i8.Server(logger)
Creates a new server instance. 
* logger is a required bunnyan logger.

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

## i8.jsonResult(res, next)
Returns a function handle(err, data)
* 200 + jsonData 
* 204 (noData) 
* next(err)

## handlerToRouter
Transforms a handler object into an express router.
```javascript
var handler = {
  get: [{  // METHOD
    path: '/', action: function (req, res, next) {
      res.send('Hello World');
    }
  }]
}

### handler.getRoute = function (method, path) {
Returns the function (improve testability)
```