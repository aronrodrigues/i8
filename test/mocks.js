(function() {
  'use strict'
  var sinon = require('sinon'); // Used to create spies
  
  /**
   * @return a fake logger.
   */
  function logger() {
    var logger = {}
    logger.info = sinon.spy();
    logger.error = sinon.spy();
    logger.debug = sinon.spy();
    logger.child = sinon.stub().returns(logger);
    logger.logLevel = sinon.spy();
    return logger;
  }
  
  function req () {
    var req = {};
    req.url = null;
    return req; 
  }
  
  function res() {
    var res = {};
    res.statusCode = 200;
    res.jsonp = sinon.spy();
    res.send = sinon.stub().returns(res);
    res.status = sinon.stub().returns(res);
    return res;
  }
  
  //-- Exports -----------------------------------------------------------------
  exports.logger = logger;
  exports.req = req;
  exports.res = res;
    
})();