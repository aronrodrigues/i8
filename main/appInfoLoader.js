(function() {
/** 
 * Loads the package.json file and returns the data.
 * 
 * @sync
 * @return appInfo object.
 * @throws Error if cannot read the file.
 */
module.exports = function(logger) {
  var fs = require('fs');
  var appInfo = {};
  var filename = './package.json';
  if (fs.existsSync(filename)) {
    logger.info('Loading package.json file');
    var data = fs.readFileSync('./package.json', 'utf8');
    var package = JSON.parse(data);
    appInfo.name = package.name;
    appInfo.version = package.version;
    if (process.env.NODE_ENV) {
      appInfo.environment = process.env.NODE_ENV;
    }
    logger.info(appInfo, 'Application info loaded.');
    return appInfo;
  }
}
})();