(function () {
  'use strict';
  var express = require('express');

  /**
   * Wrapper class to a pre configured express server.
   * @constructor
   */
  function Server(logger) {
    this._logger = logger;
    this._app = null;
    this._config = null;
    this._started = false;
    this._404Callback = null;
    this._errorCallback = null;

    /**
     * Creates the server.
     * @param instance (this)
     */
    function _construct(instance) {
      if (!logger) throw ReferenceError('loggerCannotBeNull');
      instance._logger = logger;

      instance._logger.info('Initializing ocdtServer');
      var configLoader = require('./configLoader');
      instance._config = configLoader(logger);

      instance._logger.info('Configuring express');
      instance._app = express();

      instance._logger.info('Setting up express Logging');
      var expressLogger = instance._logger.child({
        module: 'express'
      });
      var morgan = require('morgan')('common', {
        stream: {
          write: function (str) {
            expressLogger.debug(str);
          }
        }
      });
      instance.use(morgan, 'morgan/logger');

      instance._logger.info('Setting up express Middleware');
      var bodyParser = require('body-parser');
      instance.use(bodyParser.json(), 'bodyParser.json()');
      instance.use(bodyParser.urlencoded({
        extended: true
      }), 'bodyParser.urlencoded');

    };

    /**
     * Starts the server
     */
    this.startup = function (callback) {
      if (this._started) throw Error('alreadyStarted');
      this._logger.info('Starting server');
      this._app.all('*', function (req, res, next) {
        if (this._404Callback) {
          this._404Callback(req, res, next);
        } else {
          res.status(404);
          next(new Error('notFound'));
        }
      });

      this.use(this._errorHandler, 'errorHandler');

      this._listenHttp(this._config.httpPort, this._config.host);
      this._listenHttps(this._config.httpsPort, this._config.host);

      this._started = true;
      
      if (callback) callback();
    }

    /**
     * Create a http socket.
     * @param port to listen the calls (defaults to process.env.PORT || 80)
     * @param host to listen the calls (defaults to process.env.IP || 'localhost')
     */
    this._listenHttp = function (port, host) {
      port = port || process.env.PORT || 80;
      host = host || process.env.IP || 'localhost';
      var http = require('http');
      var that = this;
      http.createServer(this._app).listen(port, host, function () {
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
    this._listenHttps = function (port, host) {
      port = port || 443;
      host = host || process.env.IP || 'localhost';
      this._logger.error('HTTPS is not implemented yet.');
    }

    /**
     * Default error handler.
     * It changes the statusCode, logs the error.
     * If it starts with '/api' return the message in json,
     * else, it calls registredErrorCallback(_errorCallback) if defined or
     * return a very simple 404 page.
     */
    this._errorHandler = function (err, req, res, next) {
      if (!res.statusCode || res.statusCode == 200) res.status(500);
        logger.error({
        url: req.url,
        trace: err.stack
      }, err.message);
      if (req.url.indexOf('/api') == 0) {
        return res.jsonp(err.message);
      } else {
        if (this._errorCallback) {
          return this._errorCallback(err, req, res, next);
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
    this.use = function (arg1, arg2) {
      if (this._started) throw Error('alreadyStarted');
      if (typeof arg1 == 'string') {
        this._logger.info('Routing %s', arg1);
        this._app.use(arg1, arg2);
      } else {
        if (arg2 == null) arg2 = '';
        this._logger.info('Middleware added %s', arg2);
        this._app.use(arg1);
      }
    }

    /**
     * Add static to static content.
     * @param url public address
     * @param path server internal path
     */
    this.static = function (url, path) {
      if (this._started) throw Error('alreadyStarted');
      var express = require('express');
      this.use(url, express.static(path));
    }

    /**
     * Add a callback to be called on non api errors.
     * @param callback
     */
    this.registerErrorCallback = function (callback) {
      if (this._started) throw Error('alreadyStarted');
      this._logger.info('Registering error callback.');
      this._errorCallback = callback;
    }

    /**
     * Add a callback to be called on a 404 error.
     * @param callback
     */
    this.register404Callback = function (callback) {
      if (this._started) throw Error('alreadyStarted');
      this._logger.info('Registering 404 callback.');
      this._404Callback = callback;
    }

    /**
     * Define a new error handler.
     * @param errorHandler
     */
    this.setErrorHandler = function (errorHandler) {
      if (this._started) throw Error('alreadyStarted');
      this._logger.info('Setting errorCallback');
      this._errorHandler = errorHandler;
    }

    _construct(this);
    
  }

  module.exports = Server;

})();