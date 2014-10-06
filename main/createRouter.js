(function () {
  var express = require('express');

  function createRouter() {
    return express.Router();
  }

  module.exports = createRouter;
})();