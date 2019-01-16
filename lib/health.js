var express = require('express');
var cors = require('cors');

function healthRoute() {
  var health = new express.Router();
  health.use(cors());
//  health.use(bodyParser());


  // GET REST endpoint - query params may or may not be populated
  health.get('/', function(req, res) {
    console.log(new Date(), 'Checking health');

    // see http://expressjs.com/4x/api.html#res.json
    res.json({msg: 'mailforce_ok'});
  });

  return health;
}

module.exports = healthRoute;
