/**
 * Created by jbland on 4/10/16.
 */
var mongoose = require('mongoose');
var urlSchema = mongoose.Schema({
    url: {
        type:       String,
        required:   true,
        unique:     true
    },
    shortner: {
        type:       String,
        unique:     true
    }
});

var URL = mongoose.model('URL', urlSchema);

module.exports = URL;