(function () {
  'use strict';
  var express = require('express');

  /**
   * Returns an express router.
   */
  function createRouter() {
    return express.Router();
  }

  module.exports = createRouter;
})();