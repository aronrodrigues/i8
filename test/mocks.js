(function () {
  'use strict';
  
  var sinon = require('sinon'); // Used to create spies

  /**
   * @return a fake logger.
   */
  exports.logger = function(sandbox) {
    if (!sandbox) sandbox = sinon; 
    var logger = {};
    logger.info = sandbox.spy();
    logger.error = sandbox.spy();
    logger.debug = sandbox.spy();
    logger.child = sandbox.stub().returns(logger);
    logger.level = sandbox.spy();
    return logger;
  }
  
  exports.req = function (sandbox) {
    var req = {};
    req.url = null;
    req.headers = [];
    req.params = {};
    req.body = {};
    req.i8 = {
      config: {},
      logger: exports.logger(sandbox)
    }
    return req; 
  }
  
  exports.res = function (sandbox) {
    if (!sandbox) sandbox = sinon;
    var res = {};
    res.statusCode = 200;
    res.jsonp = sandbox.stub().returns(res);
    res.send = sandbox.stub().returns(res);
    res.end = sandbox.stub().returns(res);
    res.status = sandbox.stub().returns(res);
    res.contentType = sandbox.stub().returns(res);
    return res;
  }
  

})();
