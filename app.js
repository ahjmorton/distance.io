'use strict';

var util = require('util'),
    redis = require('redis'),
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
      response.send('Validation errors with seconds'+ util.inspect(errors), 400);
      return;
    }

    var seconds = request.query.seconds;

    

    client.zrangebyscore(['times', seconds , '+inf', 'withscores', 'limit', 0, 1], 
      function(err, result) {
        if(err) {
          response.send('Errors reading from redis' + util.inspect(err), 500);
        } else {
          var description = result[0];
          var result = result[1];
          response.json({
             input: parseFloat(seconds),
             result: parseFloat(result),
             description: description
          });
        }
      }
    );
});

/*
 * Start it up
 */
app.listen(process.env.PORT || port);
console.log('Express started on port ' + port);
