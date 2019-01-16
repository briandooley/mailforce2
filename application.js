var cors = require('cors');
var express = require('express');
var app = express();

app.use(cors());

var ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.use(express.static('public'));
app.use('/health', require('./lib/health.js')());

// app is running!
console.log('running at ' + new Date());

app.get('/', function(req, res) {
    res.send('mailforce pinged at ' + new Date());
    console.log('Pinged at ' + new Date());
});

var ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
app.listen(8080, ip);

// Main entry point for the mailforce application
require("./mailforce");

module.exports = app;