(function () {
  'use strict';

  var jwt = require('jwt-simple');
  var crypto = require('crypto');
  exports._unserializeCallback = null;
  exports._tokenSalt = null;
  exports._logger = null;

  exports.isAuth = function (req, res, next) {
    if (req.user) return next();
    checkSetup();
    var token = (req.headers && req.headers['x-access-token']);
    if (!token && process.env.NODE_ENV === 'development') {
      token = (req.body && req.body.token) ||
        (req.query && req.query.token);
    }
    if (!token) {
      exports._logger.debug('tokenNotFound');
      return res.status(401).send();
    }

    try {
      var decoded = jwt.decode(token, exports._tokenSalt);
      exports._unserializeCallback(decoded, function (user) {
        if (!user) {
          exports._logger.debug('cannotUseToken');
          return status(401).send();
        }
        req.user = user;
        return next();
      });

    } catch (err) {
      exports._logger.error(err);
      return res.status(500).send();
    }
  }

  exports.issueToken = function (obj) {
    checkSetup();
    return jwt.encode(obj, exports._tokenSalt);
  }

  exports.setup = function (logger, tokenSalt, unserializeCallback) {
    if (!logger || !tokenSalt || !typeof unserializeCallback == 'function') {
      throw ReferenceError('allArgsAreRequired');
    }
    exports._tokenSalt = tokenSalt;
    exports._unserializeCallback = unserializeCallback;
    exports._logger = logger
  }

  var checkSetup = function () {
    if (!exports._logger || !exports._tokenSalt || !exports._unserializeCallback) {
      throw Error('mustRunSetupFirst')
    }

  }


})();