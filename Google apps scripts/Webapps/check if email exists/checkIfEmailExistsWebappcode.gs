const curr_active_user = Session.getActiveUser().getEmail();
function getService() {
  const service = OAuth2.createService('Google Admin SDK')
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setPrivateKey(PropertiesService.getScriptProperties().getProperty("PRIVATE_KEY"))
    .setIssuer(PropertiesService.getScriptProperties().getProperty("CLIENT_EMAIL"))
    .setPropertyStore(PropertiesService.getScriptProperties())
    .setScope('https://www.googleapis.com/auth/admin.directory.user.readonly ' +
      'https://www.googleapis.com/auth/admin.directory.group.readonly');

  return service;
}

function checkEmailUsage(email) {
  const curr_user = Session.getEffectiveUser().getEmail();
  console.log(`${curr_user} ran this app to check if ${email} exists`);
  const regex = /^[a-zA-Z][a-zA-Z0-9._%-]+@bizzabo\.com$/i;
  if (regex.test(email.toLowerCase())) {
    const service = getService();
    if (!service.hasAccess()) {
      console.error('Authentication failed.');
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
    const groupJson = JSON.parse(groupResponse.getContentText());
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

function getGroupMembers(email) {
  const service = getService();
  if (!service.hasAccess()) {
    console.error('Authentication failed.');
    return "A technical error occurred.\nPlease reach out to it@bizzabo.com for support";
  }

  const options = {
    method: 'get',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + service.getAccessToken(),
      Accept: 'application/json'
    },
    muteHttpExceptions: true
  };

  const groupMembersApiUrl = `https://admin.googleapis.com/admin/directory/v1/groups/${email}/members`;
  const groupMembersResponse = UrlFetchApp.fetch(groupMembersApiUrl, options);

  if (groupMembersResponse.getResponseCode() === 200) {
    const groupMembersJson = JSON.parse(groupMembersResponse.getContentText());
    return groupMembersJson.members; // This will return an array of member objects
  } else {
    return "Error fetching group members.";
  }
}


function doGet() {
  // List of authorized group emails
  const authorizedGroups = [
    'it@bizzabo.com',
    'people@bizzabo.com'
    // Add more authorized group emails as needed
  ];

  // Check if the user is in any of the authorized groups
  let isAuthorized = false;
  for (let i = 0; i < authorizedGroups.length; i++) {
    const groupEmail = authorizedGroups[i];
    
    // Use Members.list to check group membership
    const members = getGroupMembers(groupEmail);
    if (members && members.some(member => member.email == curr_active_user)) {
      isAuthorized = true;
      break;
    }
  }
  if (isAuthorized) {
    return HtmlService.createTemplateFromFile('Index').evaluate();
  } else {
    console.info(`user ${curr_active_user} tried to access this app, access denied.`)
    return HtmlService.createTemplateFromFile('not_authorized').evaluate();
  }
}

function doPost(e) {
  var email = e.parameter.email; // Get the email parameter from the request
  var result = checkEmailUsage(email); // Call your function

  return ContentService.createTextOutput(result)
    .setMimeType(ContentService.MimeType.TEXT);
}




function main() {
  var email = "it@bizzabo.com"
  let g  = getGroupMembers(email)
  getService().reset();

  //console.info(checkEmailUsage(email));
}

