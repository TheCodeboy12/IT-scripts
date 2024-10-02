const domain = PropertiesService.getScriptProperties().getProperty('domain');
/**
 * Retrieves the common Google Groups that two or more users are members of.
 *
 * @param {string[]} userEmails - An array of email addresses of the users to compare.
 *                                 Must contain at least two email addresses.
 * @return {string[]} An array of email addresses of the common Google Groups.
 *
 * @example
 * // Get common groups for users "user1@example.com" and "user2@example.com"
 * const commonGroups = getCommonGroups(["user1@example.com", "user2@example.com"]);
 * Logger.log(commonGroups); // Output: ["group1@example.com", "group2@example.com"]
 */
function getCommonGroups(userEmails) {
  // Check if at least two users are provided
  if (userEmails.length < 2) {
    Logger.log("Please provide at least two user emails.");
    return [];
  }

  // Initialize an array to store common groups
  let commonGroups = [];

  // Iterate through the users
  for (let i = 0; i < userEmails.length; i++) {
    const userEmail = userEmails[i];
    const userGroups = [];

    // Use Admin Directory API to get groups for the current user
    let pageToken;
    do {
      const response = AdminDirectory.Groups.list({
        userKey: userEmail,
        pageToken: pageToken
      });
      userGroups.push(...response.groups);
      pageToken = response.nextPageToken;
    } while (pageToken);

    // Update commonGroups based on the first user's groups
    if (i === 0) {
      commonGroups = userGroups;
    } else {
      // Filter commonGroups to only include groups the current user is also a member of
      commonGroups = commonGroups.filter(group => userGroups.some(userGroup => userGroup.email === group.email));
    }
  }

  // Return an array of common group emails
  return commonGroups.map(group => group.email);
}
