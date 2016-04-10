var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
//var dotenv = require('dotenv');
var favicon = require('serve-favicon');
var path = require('path');
var urlModel = require('./models/urlModel');
var url = require('url');

/**
 * get environment variables
 */
//dotenv.load({});
var port = process.env.PORT || 3000;
var mongodb = process.env.MONGODB || process.env.MONGOLAB_URI || 'mongodb://localhost:27017/urlshortner';

/**
 * Connect to MongoDB.
 */
mongoose.connect(mongodb);

// if connection throws an error
mongoose.connection.on('error', function(err) {
    console.log('Mongoose default connection error: ' + err);
    process.exit(1);
});

// when connection is disconnected
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose connection disconnected');
});

// if the node process ends, close the mongoose connection
mongoose.connection.on('SIGINIT', function() {
    mongoose.connection.close(function() {
        console.log('Mongoose connection closed since app terminated');
        process.exit(0)
    })
});

// only start server if able to successfully connect to mongo database
mongoose.connection.on('connected', function() {
    console.log('Connected to mongoose database...');

    var app = express();

    /**
     * configure server
     */
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));

    /**
     * setup routes
     */
    app.get('/:url', function(req, res) {
        var params = req.params.url;
        urlModel.find({shortner: params}, function(err, doc) {
            if (err) {
                return res.status(404).json({error: err});
            }

            res.redirect(doc[0].url);
        });
    });

    app.get('*', function(req, res) {
        var params = req.url.substr(5);
        var shortVal;

        urlModel.find({}, {shortner: 1, _id: 0}).sort({shortner: -1}).limit(1).exec(function(err, doc) {
            if (err) {
                return res.status(400).json({error: err});
            }

            if (doc.length === 0) {
                shortVal = 1;
            } else {
                shortVal = Number(doc[0].shortner) + 1;
            }

            var entry = {url: params, shortner: shortVal};

            var newEntry = new urlModel(entry);
            newEntry.save(function(err, doc) {
                if (err) {
                    return res.status(400).json({error: err});
                }

                res.json({'original_ur': req.url, 'short_url': shortVal});
            });
        });

    });



    /**
     * start server
     */
    app.listen(port, function() {
        console.log('Server listening on port ' + port + '...');
    });
});





