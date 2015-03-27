(function () {
	'use strict';

	var express = require('express');
	var methods = 'get post delete put all'.split(' ');

	/**
	 * Transforms a handler object into an express router.
	 */
	function handlerToRouter(handler, logger) {
		console.log('##### handlerToRouter is DEPRECATED #####');
		var router = express.Router();
		function addRoute(route) {
			if (route.before) {
				router[method](route.path, route.before, route.action);	
			} else {
				router[method](route.path, route.action);
			}
		}

		for (var method in handler) {
			if (methods.indexOf(method) >= 0 && Array.isArray(handler[method])) {
				handler[method].forEach(addRoute);
			} else {
				throw new Error('invalidMethod ' + method);
			}
		}


		/**
		 * Returns the function specified by the method/path.
		 */
		handler.getRoute = function (method, path) {
			if (handler[method]) {
				for (var i = 0; i < handler[method].length; i++) {
					if (handler[method][i].path === path) {
						return handler[method][i];
					}
				}
			}
			return null;
		};

		router.__handler = handler;
		return router;
	}

	module.exports = handlerToRouter;

})();