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

var port = 3000;

/*
 * Use Handlebars for templating
 */
var exphbs = require('express3-handlebars');
var hbs;

// For gzip compression
app.use(express.compress());
app.use(express.bodyParser());
app.use(expressValidator());

/*
 * Config for Production and Development
 */
if (process.env.NODE_ENV === 'production') {
    // Set the default layout and locate layouts and partials
    app.engine('handlebars', exphbs({
        defaultLayout: 'main',
        layoutsDir: 'dist/views/layouts/',
        partialsDir: 'dist/views/partials/'
    }));

    // Locate the views
    app.set('views', __dirname + '/dist/views');
    
    // Locate the assets
    app.use(express.static(__dirname + '/dist/assets'));

} else {
    app.engine('handlebars', exphbs({
        // Default Layout and locate layouts and partials
        defaultLayout: 'main',
        layoutsDir: 'views/layouts/',
        partialsDir: 'views/partials/'
    }));

    // Locate the views
    app.set('views', __dirname + '/views');
    
    // Locate the assets
    app.use(express.static(__dirname + '/assets'));
}

// Set Handlebars
app.set('view engine', 'handlebars');

/*
 * Routes
 */
// Index Page
app.get('/', function(request, response, next) {
    response.render('index');
});


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
