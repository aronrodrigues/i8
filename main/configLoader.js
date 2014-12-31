(function () {
  /** 
   * Loads the env.json config file and returns the config.
   *
   * @sync
   * @return Config object.
   * @throws Error if cannot read the file or if it can't find the NODE_ENV on it.
   *
   * Example:
   * {
   *   "development": {
   *     "dbUrl": "mongodb://localhost/geoport_dev"
   *   },
   *   "production": {
   *     "dbUrl": "mongodb://localhost/geoport_prd"
   *   }
   * }
   */
  module.exports = function (logger) {
    var fs = require('fs');
    var config = {};
    var filename = './env.json';
    if (!process.env.NODE_ENV) {
      logger.info('Environment variable process.env.NODE_ENV is unset. ' +
        'Assuming develoment enviroment.');
      process.env.NODE_ENV = 'development';
    }
    if (fs.existsSync(filename)) {
      logger.info('Loading env.json file');
      var data = fs.readFileSync(filename, 'utf8');
      var env = JSON.parse(data);
      config = env[process.env.NODE_ENV];
      if (config) {
        logger.info({
            config: ((process.env.NODE_ENV == 'development') ? config : null),
            environment: process.env.NODE_ENV
          },
          'Configuration loaded');
        return config;
      } else {
        var error = new Error('cantLoadConfig');
        logger.error(error, 'Cannot load config in env.json for %s',
          process.env.NODE_ENV);
        throw error;
      }
    } else {
      logger.info('File env.json not found. Using default configuration.');
      return config;
    }
  };
})();