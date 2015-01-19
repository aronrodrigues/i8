(function () {
	'use strict';
	 var express = require('express');
   var expressRequestId = require('express-request-id')();

	function Server(logger) {
		var server = {
			_config: null, 		// config file used by this server
			_app: null, 			// express app
			_started: false, 	// server status
      _errorCallback: null,
      _404Callback: null
		};

		/**
		 * Construct the server and init express
		 */
		function _construct () {
			logger.info('Initializing i8Server');
      var configLoader = require('./configLoader');
      server._config = configLoader(logger);
      loadDefaults();
      logger.level(server._config.logLevel);
      
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

      logger.info('Setup request');
      server.use(expressRequestId, 'expressRequestId');
      server.use('*', server._setupRequest);
    }

    /**
     * Puts logger and config in req.
     */
    server._setupRequest = function (req, res, next) {
      logger.debug('Generating req.i8');
      req.i8 = {
        logger: logger.child({reqId: req.id}),
        config: server._config
      };
      logger.debug('req.i8', req.i8);
      next();
    };

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
        if (arg2 === null) arg2 = '';
        logger.info('Middleware added %s', arg2);
        server._app.use(arg1);
      }
    };

    /**
     * Add static to static content.
     * @param url public address
     * @param path server internal path
     */
    server.static = function (url, path) {
      if (server._started) throw Error('alreadyStarted');
      var express = require('express');
      server.use(url, express.static(path));
    };

    /**
     * Return the parameters
     */
    server.getConfig = function () {
      return server._config;
    };

    /**
     * Starts the server
     * options = {
     *   enableHttp: default true,
     *   enableHttps: default false
     * }
     */
    server.startup = function (callback) {
      if (server._started) throw Error('alreadyStarted');
      logger.info('Starting server');

      if (server._config.httpPort !== -1 || server._config.httpsPort !== -1) {

        server._app.all('*', server._default404Handler);

        server.use(server._defaultErrorHandler, 'errorHandler');

        if (server._config.httpsPort !== -1) {
          throw new Error('httpsNotImplementedYet');
        }
        if (server._config.httpPort !== -1) {
        	var http = require('http');
        	http.createServer(server._app).listen(
        			server._config.httpPort, 
        			server._config.host, 
        			function () {
          	logger.info('Listening http on %s:%s mode %s',
            server._config.host, server._config.httpPort, process.env.NODE_ENV);
        	});
        }

        server._started = true;

        if (callback) {
          callback();
        }
      } else {
        throw new Error('noPort');
      }
    };

    /**
     * Default 404 handler.
     * Calls 404 callback or next a notFound error.
     */
    server._default404Handler = function (req, res, next) {
      if (server._404Callback) {
        server._404Callback(req, res, next);
      } else {
        res.status(404);
        next(new Error('notFound'));
      }
    };

    /**
     * Default error handler.
     * It changes the statusCode, logs the error.
     * If it starts with '/api' return the message in json,
     * else, it calls registredErrorCallback(_errorCallback) if defined or
     * return a very simple 404 page.
     */
    server._defaultErrorHandler = function (err, req, res, next) {
      if (!res.statusCode || res.statusCode == 200) res.status(500);
      logger.error({
        url: req.url,
        trace: err.stack
      }, err.message);
      if (req.url.indexOf('/api') === 0) {
        return res.jsonp({message: err.message});
      } else {
        if (server._errorCallback) {
          return server._errorCallback(err, req, res, next);
        } else {
          return res.send(res.statusCode + ': ' + err.message);
        }
      }
    };

    /**
     * Set default config values.
     */
    function loadDefaults() {
    	logger.info('Loading default configuration');
    	server._config.httpPort = process.env.PORT || server._config.httpPort || 80;
    	server._config.httpsPort = server._config.httpsPort || -1;
    	server._config.host = process.env.IP || server._config.host || 'localhost';
    	server._config.logLevel = server._config.logLevel || 'info';
    	logger.info('Default configuration loaded', server._config);
    } 

    /**
     * Add a callback to be called on non api errors.
     * @param callback
     */
    server.registerErrorCallback = function (callback) {
      if (server._started) throw Error('alreadyStarted');
      logger.info('Registering error callback.');
      server._errorCallback = callback;
    };

    /**
     * Add a callback to be called on a 404 error.
     * @param callback
     */
    server.register404Callback = function (callback) {
      if (server._started) throw Error('alreadyStarted');
      logger.info('Registering 404 callback.');
      server._404Callback = callback;
    };

    /**
     * Define a new error handler.
     * @param errorHandler
     */
    server.setErrorHandler = function (errorHandler) {
      if (server._started) throw Error('alreadyStarted');
      logger.info('Setting errorCallback');
      server._defaultErrorHandler = errorHandler;
    };

    _construct(logger);
    return server;
	}

  module.exports = Server;
	
})();