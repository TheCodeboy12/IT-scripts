/*
  For this script to work, you must include the OAuth2 library from here: https://github.com/googleworkspace/apps-script-oauth2
  And also, some functions rely on the Admin directory API

*/
  



/**
 * Admin user email to be used for impersonation in service calls.
 * Replace with the email of the admin user.
 */
//const USER_EMAIL_TO_IMPERSONATE = ""; // Replace with the email of the admin user

/**
 * Adds a mail delegate to a specified user's Gmail account.
 * @param {string} userEmail - The email of the user to whom a delegate will be added.
 * @param {string} delegateEmail - The email of the delegate to be added.
 */
function addMailDelegate_(userEmail, delegateToEmail) {
  const service = getService_(userEmail);
  //console.log(service.hasAccess());
  if (service.hasAccess()) {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/settings/delegates`;
    const payload = {
      delegateEmail: delegateToEmail,
      // Other required delegation parameters
    };
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      headers: {
        Authorization: 'Bearer ' + service.getAccessToken()
      },muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    console.log(`Successfully added delegate ${delegateToEmail} to ${userEmail}\n${response.getContentText()}`);
  } else {

    console.error(`Adding ${delegateToEmail} as delegate to ${userEmail} failed.\nreason: ${service.getLastError()}`);
  }
}

/**
 * Creates and returns an OAuth2 service for Google Admin SDK.
 * @param USER_EMAIL_TO_IMPERSONATE - user to imporsanate using domain wide delegation {string}
 * @return {OAuth2Service} The OAuth2 service for authorization.
 */
function getService_(USER_EMAIL_TO_IMPERSONATE) {
  return OAuth2.createService('Google Admin SDK')
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setPrivateKey(PropertiesService.getScriptProperties().getProperty("PRIVATE_KEY"))
    .setIssuer(PropertiesService.getScriptProperties().getProperty("CLIENT_EMAIL"))
    .setPropertyStore(PropertiesService.getScriptProperties())
    .setParam('scope', 'https://www.googleapis.com/auth/gmail.settings.sharing '+
    'https://www.googleapis.com/auth/admin.directory.user.readonly')
    .setSubject(USER_EMAIL_TO_IMPERSONATE); // Admin user email
}


/**
 * Lists all the users in a domain sorted by first name.
 * @see https://developers.google.com/admin-sdk/directory/reference/rest/v1/users/list
 * @return {Array} An array of user objects, each containing user details.

 */
function listAllUsers() {
  let pageToken;
  let page;
  var count =0;
  var title;
  var usersArr = [];
  
  
  do {
    page = AdminDirectory.Users.list({
      domain: 'bizzabo.com',
      orderBy: 'givenName',
      maxResults: 300,
      pageToken: pageToken
    });
    const users = page.users;
    if (!users) {
      console.log('No users found.');
      return;
    }
    // Print the user's full name and email.
    for (const user of users) {
      if (!user.suspended)
      {
        try {// Try to get the users title if there is an error push the error to the array
                    title = user.organizations[0].title;
                } catch (e) {
                    continue
                }
        if(user.primaryEmail.indexOf("-tmp") != -1) continue;
        var curr = new Object();
        curr["fullName"] = user.name.fullName;
        curr["primaryEmail"] = user.primaryEmail;
        curr["title"] = title;
        usersArr.push(curr);
        //console.log('%s (%s) (%s)', curr["fullName"] , curr["primaryEmail"] , curr["title"]);
        count++;
      }
    }
    pageToken = page.nextPageToken;
  } while (pageToken);
  return usersArr;
  
}

/**
 * Lists all users in the domain without any restrictions.
 * @return {Array} An array of user objects, each containing user details.
 */
function listUsers_No_restrictions_(){
  /**
   * Lists all the users in a domain sorted by first name.
   * @see https://developers.google.com/admin-sdk/directory/reference/rest/v1/users/list
   */
  let pageToken;
  let page;
  var list = [];
  do {
    page = AdminDirectory.Users.list({
      domain: 'bizzabo.com',
      orderBy: 'givenName',
      maxResults: 100,
      projection: 'FULL', // Include all data for each user
      pageToken: pageToken
    });
    const users = page.users;
    if (!users) {
      console.log('No users found.');
      return;
    }
    // Print the user's full name and email.
    for (const user of users) {
      //console.log('%s (%s)', user.name.fullName, user.primaryEmail);
      list.push(user);
    }
    pageToken = page.nextPageToken;
  } while (pageToken);
  return list;
}

/**
 * Suspends a specified user in Google Workspace.
 * @param {string} email - The email of the user to be suspended.
 */
function suspendUser_(email) {
  try{
    var user = AdminDirectory.Users.get(email);
    if (user && user.suspended !== true) {
      user.suspended = true;
      AdminDirectory.Users.update(user, email);
      Logger.log('User suspended: ' + email);
    } else {
      Logger.log('User not found or already suspended');
    }
  } catch(e) {
    console.error(`Error suspending user ${email} : ${e.message}`);
    return false;
  }


}


/**
 * Retrieves the Organizational Unit (OU) path of a specified user.
 * @param {string} userEmail - The email of the user whose OU path is to be retrieved.
 * @return {string} The OU path of the user.
 */
function getUserOU(userEmail) {
  var user;
  
  try {
    user = AdminDirectory.Users.get(userEmail);
  } catch (e) {
    console.error("Error retrieving user information: " + e.message);
    return "User not found or access denied.";
  }

  if (user && user.orgUnitPath) {
    Logger.log("User " + userEmail + " is in the OU: " + user.orgUnitPath);
    return user.orgUnitPath;
  } else {
    Logger.log("Organizational unit information not available for " + userEmail);
    return "OU information not available.";
  }
}


/**
 * Moves a specified user to a different Organizational Unit (OU).
 * @param {string} userEmail - The email of the user to be moved.
 * @param {string} ouLocation - The destination OU path.
 */
function moveToOU_(userEmail , ouLocation) {
  var offboardingOU = ouLocation;  // Update this path to match your OU structure
  var user = {
    orgUnitPath: offboardingOU
  };

  try {
    AdminDirectory.Users.update(user, userEmail);
    Logger.log(userEmail + ' moved to '+ouLocation+' OU.');
  } catch (e) {
    console.error('Error moving ' + userEmail + ' to '+ouLocation + ' OU: ' + e.message);
  }
}

/**
 * Resets the password for a specified user and sets whether they must change it at next login.
 * @param {string} userEmail - The email of the user whose password is to be reset.
 * @param {boolean} changeNextLogin - Whether the user should change their password at the next login.
 */
function resetUserPassword_(userEmail , changeNextLogin) {
  var newPassword = generateRandomPassword_();
  var user = {
    password: newPassword,
    changePasswordAtNextLogin: changeNextLogin // User must change password at next login
  };

  try {
    AdminDirectory.Users.update(user, userEmail);
    Logger.log('Password reset for ' + userEmail + '. New Password: ' + newPassword);
  } catch (e) {
    console.error('Error resetting password for ' + userEmail + ': ' + e.message);
  }
}

/**
 * Updates the departure date for a specified user in their custom schema.
 * @param {string} userEmail - The email of the user whose departure date is to be updated.
 * @param {string} departureDate - The departure date to set.
 */
function updateDepartureDate_(userEmail, departureDate) {
  var customSchemas = {
    "Basic_information": { // Replace with your actual schema name
      "Departure_date": departureDate
    }
  };

  var user = {
    customSchemas: customSchemas
  };

  try {
    AdminDirectory.Users.update(user, userEmail);
    Logger.log('Departure date updated for ' + userEmail);
  } catch (e) {
    Logger.log('Error updating departure date for ' + userEmail + ': ' + e.message);
  }
}

/**
 * Updates the data retention settings for a specified user in their custom schema.
 * @param {string} userEmail - The email of the user whose data retention settings are to be updated.
 * @param {boolean} gmail - The Gmail data retention setting.
 * @param {boolean} gDrive - The Google Drive data retention setting.
 * @param {boolean} cal - The Calendar data retention setting.
 * @param {string} transferTo - Email to which data should be transferred.
 */
function updateDataRetention_(userEmail, gmail,gDrive,cal , transferTo) {
  var transferTo = {
    value:transferTo,
    type : "work"
  };
  var customSchemas = {
    "IT_data_retention": { // Replace with your actual schema name
      "Gmail": gmail,
      "Google_drive" : gDrive,
      "Calendar" : cal,
      "Who_to_transfer_data_to" : [transferTo]
    }
  };

  var user = {
    customSchemas: customSchemas
  };

  try {
    AdminDirectory.Users.update(user, userEmail);
    console.log('IT data retention updated for ' + userEmail);
  } catch (e) {
    console.error('Error updating departure date for ' + userEmail + ': ' + e.message);
  }
}

/**
 * Prints the custom schemas of a specified user.
 * @param {string} userEmail - The email of the user whose custom schemas are to be printed.
 */
function printUserCustomSchemas(userEmail) {
  try {
    // Fetch user details with full projection to get all data including custom schemas
    var user = AdminDirectory.Users.get(userEmail, {projection: 'full'});
    var customSchemas = user.customSchemas;
    
    // Check if the user has any custom schemas
    if (customSchemas) {
      Logger.log('Custom schemas for ' + userEmail + ':');
      
      // Iterate over each schema and print the schema name and fields
      for (var schemaName in customSchemas) {
        Logger.log('Schema: ' + schemaName);
        for (var fieldName in customSchemas[schemaName]) {
          var fieldValue = customSchemas[schemaName][fieldName];

          // Check if the field value is an array (or object, and iterate accordingly)
          if (Array.isArray(fieldValue)) {
            fieldValue.forEach(function(item) {
              Logger.log(' - Field: ' + fieldName + ', Value: ' + item.value);
            });
          } else {
            Logger.log(' - Field: ' + fieldName + ', Value: ' + fieldValue);
          }
        }
      }
    } else {
      Logger.log('No custom schemas found for ' + userEmail + '.');
    }
  } catch (e) {
    Logger.log('Error retrieving custom schemas for ' + userEmail + ': ' + e.message);
  }
}



/**
 * Retrieves the Gmail profile of a specified user.
 * @param {string} userEmail - The email of the user whose Gmail profile is to be retrieved.
 */
function getUserProfile_(userEmail ) {
  const service = getService_();
  if (service.hasAccess()) {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/profile`;
    const options = {
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + service.getAccessToken()
      },muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    console.info(response.getContentText());
  } else {
    console.error(service.getLastError());
  }
}

/**
 * Retrieves the manager's email for a specified user.
 * @param {string} userEmail - The email of the user whose manager's email is to be retrieved.
 * @return {string|null} The manager's email, or null if not found.
 */
function getUsersManagerEmail_(userEmail) {
  try {
    var user = AdminDirectory.Users.get(userEmail);
    if (user.relations) {
      for (var i = 0; i < user.relations.length; i++) {
        if (user.relations[i].type === 'manager') {
          return user.relations[i].value;
        }
      }
    }
    console.warn('Manager not found for ' + userEmail);
    return null;
  } catch (e) {
    console.error('Error fetching manager information: ' + e.message);
    return null;
  }
}



/**
 * Removes a specified user from all their Google groups.
 * @param {string} userEmail - The email of the user to be removed from all groups.
 */
function removeUserFromAllGroups_(userEmail) {
  try {
    // List all groups for the user
    var groups = AdminDirectory.Groups.list({
      userKey: userEmail
    });

    if (groups.groups && groups.groups.length > 0) {
      // Iterate through each group and remove the user
      groups.groups.forEach(function(group) {
        AdminDirectory.Members.remove(group.id, userEmail);
        Logger.log('Removed user ' + userEmail + ' from group: ' + group.email);
      });
    } else {
      console.warn('No groups found for user ' + userEmail);
    }
  } catch (e) {
    console.error('Error removing user from groups: ' + e.message);
  }
}

/**
 * Lists all Organizational Units (OUs) in the domain and logs their names and IDs.
 */
function listAllOUs() {
  var ous = AdminDirectory.Orgunits.list('my_customer');
  if (ous.organizationUnits && ous.organizationUnits.length > 0) {
    for (var i = 0; i < ous.organizationUnits.length; i++) {
      var ou = ous.organizationUnits[i];
      console.info('OU Name: %s, OU ID: %s', ou.name, ou.orgUnitId);
    }
  } else {
    console.warn('No organizational units found.');
  }
}

/**
 * Hides a specified user from the Global Address List (GAL) in Google Workspace.
 * This action makes the user's profile invisible in directory searches
 * and contacts suggestions within your organization.
 * 
 * @param {string} userEmail - The email address of the user to be hidden from the GAL.
 */
function hideUserFromGlobalAddressList_(userEmail) {
  try {
    // Retrieve the current user's settings
    var user = AdminDirectory.Users.get(userEmail);

    // Update the includeInGlobalAddressList setting
    user.includeInGlobalAddressList = false;
    
    // Apply the update
    AdminDirectory.Users.update(user, userEmail);
    Logger.log(userEmail + ' has been hidden from the Global Address List.');
  } catch (e) {
    Logger.log('Error hiding ' + userEmail + ' from the Global Address List: ' + e.message);
  }
}

/**
 * Retrieves all users in a specified Organizational Unit (OU) path.
 * 
 * @param {string} ouPath - The OU path for which to retrieve users.
 * @return {Array} List of users in the specified OU.
 */
function getUsersInOU_(ouPath) {
  var usersInOU = [];
  var pageToken;
  do {
    try {
      var response = AdminDirectory.Users.list({
        domain: 'bizzabo.com', // Replace with your domain
        query: 'orgUnitPath=\'' + ouPath + '\'',
        maxResults: 100,
        pageToken: pageToken
      });
      
      var users = response.users;
      if (users) {
        usersInOU = usersInOU.concat(users);
      }
      pageToken = response.nextPageToken;
    } catch (e) {
      Logger.log('Error fetching users in OU: ' + ouPath + ' - ' + e.message);
      return []; // Or handle the error as needed
    }
  } while (pageToken);

  return usersInOU.map(function(user) {
    return {
      fullName: user.name.fullName,
      email: user.primaryEmail,
      orgUnitPath: user.orgUnitPath
    };
  });
}
