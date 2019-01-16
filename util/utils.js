// Used to format SF Severity into codes
exports.formatSeverity = function(sev) {
  var retString = '';
  switch (sev) {
    case '1 (Urgent)':
      retString = 'SEV1'
      break;
    case '2 (High)':
      retString = 'SEV2'
      break;
    case '3 (Normal)':
      retString = 'SEV3'
      break;
    case '4 (Low)':
      retString = 'SEV4'
      break;
    default:
      retString = 'Unknown Severity'
  }

  return (retString);
};

exports.isNull = function(val) {
  if (val === null || val === undefined) {
    return ('-----');
  } else {
    return (val);
  }
}

exports.stripUrl = function(url) {
  return (url.substr(url.search('href=') + 6, url.search('target=') - 11));
};
