var jsforce = require('jsforce');
var eventEmitter = require("../util/events");
var logger = require("../util/logger");
var _ = require("underscore");

// SalesForce
var conn = new jsforce.Connection({});

exports.login = function(cb) {

  conn.login(process.env.USERNAME, process.env.PASSWORD, function(err) {
    if (err) {
      logger.error("SalesForce Login Failed", err);
      return cb(err, null);
    }

    logger.info("SalesForce Login Successful");
    //console.log("conn looks like", conn);
    return cb(null, conn)
  });
};

exports.query = function(query, eventName, cb) {

  conn.query(query, function(err, result) {
    if (err) {
      logger.error("SalesForce Query Failed", err);
      return cb(err, null);
    }

    _.each(result.records, function(res) {
      eventEmitter.emit(eventName, res);
    });

    return cb(null, result);
  });
}
