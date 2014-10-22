(function () {
  'use strict';
  var express = require('express');

  /**
   * Wrapper class to a pre configured express server.
   * @constructor
   */
  module.exports = function (logger) {

    if (!logger) throw ReferenceError('loggerCannotBeNull');
    var server = {};
    server._logger = logger;
    server._app = null;
    server._config = null;
    server._appInfo = null;
    server._started = false;
    server._404Callback = null;
    server._errorCallback = null;

    var _construct = function () {
      logger.info('Initializing i8Server');
      var configLoader = require('./configLoader');
      server._config = configLoader(logger);
      if (server._config.logLevel) {
        logger.logLevel(server._config.logLevel);
      }

      logger.info('Configuring express');
      server._app = express();

      logger.info('Setting up express Logging');
      var expressLogger = logger.child({
        module: 'express'
      });
      var morgan = require('morgan')('common', {
        stream: {
          write: function (str) {
            expressLogger.debug(str);
          }
        }
      });
      server.use(morgan, 'morgan/logger');

      logger.info('Setting up express Middleware');
      var bodyParser = require('body-parser');
      server.use(bodyParser.json(), 'bodyParser.json()');
      server.use(bodyParser.urlencoded({
        extended: true
      }), 'bodyParser.urlencoded');
    }

    /**
     * Starts the server
     */
    server.startup = function (callback) {
      if (server._started) throw Error('alreadyStarted');
      logger.info('Starting server');
      var appInfoLoader = require('./appInfoLoader');
      server._appInfo = appInfoLoader(logger);

      server._app.get('/api/appInfo', function (req, res, next) {
        return res.jsonp(server._appInfo);
      });

      server._app.all('*', function (req, res, next) {
        if (server._404Callback) {
          server._404Callback(req, res, next);
        } else {
          res.status(404);
          next(new Error('notFound'));
        }
      });

      server.use(server._errorHandler, 'errorHandler');

      server._listenHttp(server._config.httpPort, server._config.host);
      server._listenHttps(server._config.httpsPort, server._config.host);

      server._started = true;

      if (callback) callback();
    }

    /**
     * Create a http socket.
     * @param port to listen the calls (defaults to process.env.PORT || 80)
     * @param host to listen the calls (defaults to process.env.IP || 'localhost')
     */
    server._listenHttp = function (port, host) {
      port = port || process.env.PORT || 80;
      host = host || process.env.IP || 'localhost';
      var http = require('http');
      var that = this;
      http.createServer(server._app).listen(port, host, function () {
        that._logger.info('Listening http on %s:%s mode %s',
          host, port, process.env.NODE_ENV);
      });
    }

    /**
     * Create a https socket.
     * @param port to listen the calls (defaults to 443)
     * @param host to listen the calls (defaults to process.env.IP || 'localhost')
     * @deprecated
     */
    server._listenHttps = function (port, host) {
      port = port || 443;
      host = host || process.env.IP || 'localhost';
      logger.error('HTTPS is not implemented yet.');
    }

    /**
     * Default error handler.
     * It changes the statusCode, logs the error.
     * If it starts with '/api' return the message in json,
     * else, it calls registredErrorCallback(_errorCallback) if defined or
     * return a very simple 404 page.
     */
    server._errorHandler = function (err, req, res, next) {
      if (!res.statusCode || res.statusCode == 200) res.status(500);
      logger.error({
        url: req.url,
        trace: err.stack
      }, err.message);
      if (req.url.indexOf('/api') == 0) {
        return res.jsonp(err.message);
      } else {
        if (server._errorCallback) {
          return server._errorCallback(err, req, res, next);
        } else {
          return res.send(res.statusCode + ': ' + err.message);
        }
      }
    }

    /**
     * Add routes or add middleware
     * @param arg1 route name or middleware function
     * @param arg2 route object or middleware description
     */
    server.use = function (arg1, arg2) {
      if (server._started) throw Error('alreadyStarted');
      if (typeof arg1 == 'string') {
        logger.info('Routing %s', arg1);
        server._app.use(arg1, arg2);
      } else {
        if (arg2 == null) arg2 = '';
        logger.info('Middleware added %s', arg2);
        server._app.use(arg1);
      }
    }

    /**
     * Add static to static content.
     * @param url public address
     * @param path server internal path
     */
    server.static = function (url, path) {
      if (server._started) throw Error('alreadyStarted');
      var express = require('express');
      server.use(url, express.static(path));
    }

    /**
     * Add a callback to be called on non api errors.
     * @param callback
     */
    server.registerErrorCallback = function (callback) {
      if (server._started) throw Error('alreadyStarted');
      logger.info('Registering error callback.');
      server._errorCallback = callback;
    }

    /**
     * Add a callback to be called on a 404 error.
     * @param callback
     */
    server.register404Callback = function (callback) {
      if (server._started) throw Error('alreadyStarted');
      logger.info('Registering 404 callback.');
      server._404Callback = callback;
    }

    /**
     * Define a new error handler.
     * @param errorHandler
     */
    server.setErrorHandler = function (errorHandler) {
      if (server._started) throw Error('alreadyStarted');
      logger.info('Setting errorCallback');
      server._errorHandler = errorHandler;
    }

    server.getConfig = function () {
      return server._config;
    }

    _construct();
    return server;

  }

})();