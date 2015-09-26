'use strict';

var redis = require('redis'),
    client = redis.createClient();

client.on('error', function(err) {
   console.log('Redis Error ' + err);
});

/*
 * Express Dependencies
 */
var express = require('express'),
    expressValidator = require('express-validator'),
    app = express();

var port = 3001;

// For gzip compression
app.use(express.compress());
app.use(express.bodyParser());
app.use(expressValidator());

/*
 * Get entry 
 */
app.get('/distance', function(request, response, next) {
    request.checkQuery('seconds', 'Require number of seconds').isDecimal();

    var errors = request.validationErrors();
    if(errors) {
      next(errors);
      return;
    }

    var seconds = request.query.seconds;

    client.zrangebyscore(['times', seconds , '+inf', 'limit', 0, 1], 
      function(err, result) {
        if(err) {
          next(err);
        } else {
          response.json(result);
        }
      }
    );
});

/*
 * Start it up
 */
app.listen(process.env.PORT || port);
console.log('Express started on port ' + port);
