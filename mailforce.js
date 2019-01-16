var moment = require("moment");
var schedule = require('node-schedule');
var async = require('async');
var _ = require('underscore');
var soqlQueries = require('./templates/soqlQueries');
var logger = require('./util/logger');
var salesforce = require("./lib/salesforce");

//Register listeners
require('./lib/mail')

function startSFPoll() {
  logger.info("Start SF query process");

  var now = moment();
  now.subtract("1", "Minutes");
  var sfISOString = now.toISOString();

  logger.debug("ISO String being used is :: ", sfISOString);

  salesforce.login(function(err) {
    if (err) {
      logger.info("Cancelling this interval search due to failed login");
      return;
    }

    //List of checks to query
    var sfCalls = [];

    _.each(soqlQueries, function(queryString, eventName) {
      queryString = queryString.join('\n').replace(/(\r\n|\n|\r)/gm, " ").replace("{{createdDate}}", sfISOString);
      
      // this line causes error
      sfCalls.push(async.apply(salesforce.query, queryString, eventName));
    })

    // Don't need callback as we don't care at this point
    async.parallel(sfCalls);

  });
}

//Start now and then start poll
startSFPoll();

schedule.scheduleJob('*/1 * * * *', function() {
  startSFPoll();
});
