var nodemailer = require('nodemailer');
var _ = require('underscore');

var eventEmitter = require("../util/events");
var logger = require("../util/logger");
var util = require("../util/utils");
//var GCONFIG = require("../config");

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

//These are the event listeners to catch each event that we are interested in
eventEmitter.on('RHMAPComment', handleNewComment)
eventEmitter.on('RHMAPCase', handleNewCase);
eventEmitter.on('3scaleComment', handleNewComment)
eventEmitter.on('3scaleCase', handleNewCase);
eventEmitter.on('quayComment', handleNewComment)
eventEmitter.on('quayCase', handleNewCase);
eventEmitter.on('codereadyComment', handleNewComment)
eventEmitter.on('codereadyCase', handleNewCase);

function handleNewCase(args) {
  logger.info("New Case", args);

  var mailSettings = {};
  var mailText =   'Case Number: ' + args.CaseNumber + '\n'
               + 'Subject: ' + args.Subject + '\n'
               + 'Severity: ' + args.Severity__c + '\n'
               + 'Account Name: ' + args.Account.Name + '\n'
               + 'Account Number: ' + args.Account.AccountNumber + '\n'
               + 'SBR: ' + args.SBR_Group__c + '\n'
               + 'Created Date: ' + args.CreatedDate + '\n'
               + 'Created By: ' + args.Created_By__c + '\n'
               + 'Contact: ' + args.Case_Contact__c + '\n'
               + 'Target Date: ' + util.isNull(args.TargetDate__c) + '\n'
               + 'SBT: ' + util.isNull(args.SBT__c) + '\n'
               + 'Portal Link: ' + util.stripUrl(args.Link_To_Case_in_Portal__c) + '\n'
               + 'Ascension Link: ' + process.env.ASCENSION_ROOT + args.CaseNumber + '\n'
               + 'SalesForce Link: ' + process.env.SALESFORCE_LINK_ROOT + args.CaseNumber + '\n\n'
               + 'Comment: ' + '\n\n\n' + args.Description + '\n\n';

  mailSettings.subject = 'NEW ' + util.formatSeverity(args.Severity__c)
                      + ' TICKET '
                      + args.CaseNumber
                      + ', has been created by '
                      + args.Created_By__c
                      + ' for '
                      + args.Account.Name
                      + '.  Subject: '
                      + args.Subject;

  mailSettings.text = mailText;

  switch(args.RH_Product__r.Id) {
      case process.env.RHMAP_PRODUCT:
          mailSettings.to = process.env.RHMAP_MAIL
          break;
      case process.env.SCALE_PRODUCT:
          mailSettings.to = process.env.SCALE_MAIL
          break;
      case process.env.CODEREADY_PRODUCT:
          mailSettings.to = process.env.CODEREADY_MAIL
          break;
      case process.env.COREOS_TECTONIC_PRODUCT:
      case process.env.QUAY_PRODUCT:
      case process.env.COREOS_CONTAINER_PRODUCT:
          mailSettings.to = process.env.QUAY_MAIL
          break;
      default:
          mailSettings.to = process.env.RHMAP_MAIL
  }

  //Send the email
  sendMail(mailSettings);
}

function handleNewComment(args) {
  logger.info("New Comment\n");

  var mailSettings = {};
  var body = args.Comment_Body__c;
  if (!args.Is_Public__c) {
    // This is a private update.
    body = 'INTERNAL COMMENT\n\n' + body
  }

  var mailText =   "Owner: " + args.Case__r.Owner.Name + "\n"
                 + "Owner Email: " + args.Case__r.Owner.Email + "\n"
                 + "Case Number: " + args.Case__r.CaseNumber + "\n"
                 + "Severity: " + args.Case__r.Severity__c + "\n"
                 + "Status: " + args.Case__r.Status + "\n"
                 + "Internal Status: " + args.Case__r.Internal_Status__c + "\n"
                 + "Account Name: " + args.Case__r.Account.Name + "\n"
                 + "Account Number: " + args.Case__r.Account.AccountNumber + "\n"
                 + 'SBR: ' + args.Case__r.SBR_Group__c + '\n'
                 + "Created Date: " + args.CreatedDate + "\n"
                 + "Case Contact: " + args.Case__r.Contact.Name + "\n"
                 + "Target Date: " + util.isNull(args.Case__r.TargetDate__c) + "\n"
                 + "SBT: " + util.isNull(args.Case__r.SBT__c) + "\n"
                 + "Portal Link: " + util.stripUrl(args.Case__r.Link_To_Case_in_Portal__c) + "\n"
                 + "Ascension Link: " + process.env.ASCENSION_ROOT + args.Case__r.CaseNumber + "\n"
                 + "SalesForce Link: " + process.env.SALESFORCE_LINK_ROOT + args.Case__r.CaseNumber + "\n"
                 + "Comment: \n\n" + body + "\n\n";

  mailSettings.subject = 'TICKET: ' + args.Case__r.CaseNumber
                        + ' || ' + util.formatSeverity(args.Case__r.Severity__c)
                        + ' || CLIENT: ' + args.Case__r.Account.Name
                        + ' || STATUS: ' + args.Case__r.Status
                        + ' || MODIFIED BY: ' + args.Created_By__c
                        + ' || SUBJECT: ' + args.Case__r.Subject;

  mailSettings.text = mailText;

  switch(args.Case__r.RH_Product__r.Id) {
      case process.env.RHMAP_PRODUCT:
          mailSettings.to = process.env.RHMAP_MAIL
          break;
      case process.env.SCALE_PRODUCT:
          mailSettings.to = process.env.SCALE_MAIL
          break;
      case process.env.CODEREADY_PRODUCT:
          mailSettings.to = process.env.CODEREADY_MAIL
          break;
      case process.env.COREOS_TECTONIC_PRODUCT:
      case process.env.QUAY_PRODUCT:
      case process.env.COREOS_CONTAINER_PRODUCT:
          mailSettings.to = process.env.QUAY_MAIL
          break;
      default:
          mailSettings.to = process.env.RHMAP_MAIL
  }

  //Send the email
  sendMail(mailSettings);

}

function sendMail(mailSettings) {

  mailSettings.from = process.env.MAIL_FROM;

  logger.info("Sending Mail - \n\n" + mailSettings.subject + "\n\n- to " + mailSettings.to + "\n");

  transporter.sendMail(mailSettings, function(error, info) {
    if (error) {
      logger.error("Email failed to send.")
      logger.error(error);
    } else {
      logger.debug('Message sent: ' + info.response);
    }
  });
}

