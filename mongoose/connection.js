var config = require('../config');      // Load config file to get URL, username, password, etc

var mongoose = require('mongoose');     // Import the mongoose module

/* PULL IN SENSITIVE INFORMATION FROM config.js */
var local_url = 'mongodb://127.0.0.1:27017/test';   // Local URL, connects EC2 instance to local mongod
var remote_url = config.ec2.public_ip;              // Connects to the public IP of the server hosting the database

var options = {
    user:   config.mongo.username,      // Username and password of a user that has read and write permissions
    pass:   config.mongo.password
};
var uri = 'mongodb://' + remote_url + '/' + config.mongo.db + '?authSource=admin';

// Connect to the URL
mongoose.connect(uri, options);
mongoose.connection.on('error', console.error.bind(console, '[ DATABASE ] Connection :: Connection response: '));
mongoose.connection.once('open', function () {
    console.log('[ DATABASE ] Connection :: Successfully connected to the database: ' + config.mongo.db);
});

// Nothing needs to be exported, simply use:   require('<path>/mongoose')
module.exports = mongoose;