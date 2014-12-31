(function () {
	'use strict';
	
	/**
	 * Returns a function handle(err, data)
	 * 200 + jsonData / 204 (noData) / next(err)
	 */
	function jsonResult(res, next) {
		return function(err, data) {
			if (!err) {
				if (data) {
					return res.status(200).jsonp(data);
				} else {
					return res.status(204).jsonp();
				}
			}
			return next(err);
		};
	}

	module.exports = jsonResult;

})();