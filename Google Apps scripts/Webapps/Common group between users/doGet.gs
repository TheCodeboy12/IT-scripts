const _curr_active_user = Session.getActiveUser().getEmail();
/**
 * Creates the HTML output for the web app.
 *
 * @return {HtmlOutput} The HTML output for the web app.
 */
function doGet() {
  const _curr_active_user = Session.getActiveUser().getEmail();
  // List of authorized group emails
  const authorizedGroups = [
    'it@'+domain,
    // Add more authorized group emails as needed
  ];

  // Check if the user is in any of the authorized groups
  let isAuthorized = false;
  for (let i = 0; i < authorizedGroups.length; i++) {
    const groupEmail = authorizedGroups[i];
    
    // Use Members.list to check group membership
    const members = AdminDirectory.Members.list(groupEmail).members;
    if (members && members.some(member => member.email == _curr_active_user)) {
      isAuthorized = true;
      break;
    }
  }

  if (isAuthorized) {
    return HtmlService.createTemplateFromFile('index').evaluate();
  } else {
    console.info(`user ${_curr_active_user} tried to access this app, access denied.`)
    return HtmlService.createTemplateFromFile('not_authorized').evaluate();
  }
}

/**
 * Processes the form submission and returns the common groups.
 *
 * @param {Object} formObject - The form data submitted by the user.
 * @return {string} The HTML output containing the common groups.
 */
function processForm(formObject) {
  const userEmails = formObject.userEmails.split(',').map(email => email.trim());
  const commonGroups = getCommonGroups(userEmails);
  console.log(`${_curr_active_user} ran this app on ${userEmails}`);

  let resultHtml = '<h3>Common Groups:</h3>';
  if (commonGroups.length > 0) {
    resultHtml += '<ul>';
    commonGroups.forEach(group => {
      resultHtml += `<li>${group}</li>`;
    });
    resultHtml += '</ul>';
  } else {
    resultHtml += '<p>No common groups found.</p>';
  }

  return resultHtml;
}
