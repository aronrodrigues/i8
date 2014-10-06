//exports.Server = require('./main/Server');
//exports.createRouter = require('./main/createRouter');
var express = require('express');
var app = express();

/*
app.get('/', function(req, res, next) { 
  console.log('/');
  next(Error('testError'));
});
app.use(function (err, req, res, next) {
  console.error(res.statusCode);
  console.error(err.message);
  res.status(500).send('Something broke!' + err.message);
});

app.listen(3000);
*/