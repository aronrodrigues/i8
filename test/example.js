var i8 = require('../main/index.js');
var bunyan = require('bunyan');
var logger = bunyan.createLogger({name: 'testApp'});
var server = new i8.Server(logger);

server.register404Callback(function (req, res, next) {
  res.send('You requested the url ' + req.url + ' but it does not exist on our servers. (It is OK! :D)');
});

server.registerErrorCallback(function (err, req, res, next) {
  res.send('The error ' + err.message + ' ocurred and your request cannot be completed. (It is OK! :D)');
});

server.static('/static', './test');

var handler = {
  get: [{
    path: '/',
    action: function (req, res, next) {
      res.send('<ul>' +
        '<li><a href="404.html">404</a></li>' +
        '<li><a href="api/404">api/404</a></li>' +
        '<li><a href="api/data">api/data</a></li>' +
        '<li><a href="api/noData">api/noData (204)</a></li>' +
        '<li><a href="static/example.js">static/example.js</a></li>' +
        '<li><a href="router/hello">router/hello</a></li>' +
        '<li><a href="error">error</a></li>' +
        '<li><a href="api/error">api/error</a></li>' +
        '</ul>');
    }
  }, {
    path: '/api/data',
    action: function (req, res, next) {
      i8.jsonResult(res, next)(null, {testData: 'Hello World'});
    }
  }, {
    path: '/api/noData',
    action: function (req, res, next) {
      i8.jsonResult(res, next)(null);
    }
  }, {
    path: '/error',
    action: function (req, res, next) {
      throw Error('TestError');
    }
  }, {
    path: '/api/error',
    action: function (req, res, next) {
      throw Error('ApiTestError');
    }
  }]
};

var router = i8.createRouter();
router.get('/hello', function (req, res, next) {
  res.send('Hello world!!');
});

server.use('/router', router)
server.use('/', i8.handlerToRouter(handler));

server.startup();