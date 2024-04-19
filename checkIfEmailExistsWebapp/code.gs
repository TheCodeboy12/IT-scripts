function getService() {
  const service = OAuth2.createService('Google Admin SDK')
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setPrivateKey(PropertiesService.getScriptProperties().getProperty("PRIVATE_KEY"))
    .setIssuer(PropertiesService.getScriptProperties().getProperty("CLIENT_EMAIL"))
    .setPropertyStore(PropertiesService.getScriptProperties())
    .setScope('https://www.googleapis.com/auth/admin.directory.user.readonly ' +
      'https://www.googleapis.com/auth/admin.directory.group.readonly');

  // Set the subject/email of the user to impersonate (if required)
  //service.setSubject("adm_gabriel.s@bizzabo.com");

  return service;
}

function checkEmailUsage(email) {
  const regex = /^[a-zA-Z][a-zA-Z0-9._%-]+@bizzabo\.com$/i;
  if (regex.test(email.toLowerCase())) {
    const service = getService();
    if (!service.hasAccess()) {
      Logger.log('Authentication failed.');
      return "A technical error occured.\nPlease reach out to it@bizzabo.com for support";
    }

    const options = {
      method: 'get',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + service.getAccessToken(),
        Accept: 'application/json'
      }, muteHttpExceptions: true
    };
    // Check if email exists as a user
    const userApiUrl = `https://admin.googleapis.com/admin/directory/v1/users/${email}`;
    const userResponse = UrlFetchApp.fetch(userApiUrl, options);
    const userExists = userResponse.getResponseCode() === 200;

    // Check if email exists as a group
    const groupApiUrl = `https://admin.googleapis.com/admin/directory/v1/groups/${email}`;
    const groupResponse = UrlFetchApp.fetch(groupApiUrl, options);
    const groupExists = groupResponse.getResponseCode() === 200;


    if (userExists) {
      return 'Email address is used by a user.';
    } else if (groupExists) {
      return 'Email address is used by a group.';
    } else {
      return 'Email address is available for use';
    }
  }
  else {
    return 'You did not enter a valid Bizzabo email.\n Please make sure that the email is in the following format: username@bizzabo.com'
  }
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index');
}

function doPost(e) {
  var email = e.parameter.email; // Get the email parameter from the request
  var result = checkEmailUsage(email); // Call your function

  return ContentService.createTextOutput(result)
    .setMimeType(ContentService.MimeType.TEXT);
}




function main() {
  var email = "it34343@bizzabo.com"
  getService().reset();
  console.info(checkEmailUsage(email));
}

