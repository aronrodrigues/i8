(function () {
	'use strict';
	
	/**
	 * Returns a function handle(err, data)
	 * 200 + jsonData / 204 (noData) / next(err)
	 */
	function jsonResult(req, res, next) {
		return function(err, data) {
			var logger = req.i8.logger;
			if (!err) {
				if (data && (!(data instanceof Array) || data.length > 0)) { 
					logger.debug({data: data}, 'dataFound');
					return res.status(200).jsonp(data);
				} else {
					logger.debug('noDataFound');
					return res.status(204).jsonp();
				}
			}
			return next(err);
		};
	}

	module.exports = jsonResult;

})();