(function () {
  var bunyan = require('bunyan');

  function createLogger(loggerParam) {
    return bunyan.createLogger(loggerParam);
  }

  module.exports = createLogger;
  
})();