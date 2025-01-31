function basicOktaRequest(url) {
  /**
   * Sends a request to Okta API url
   */
  const oktaApiKey= PropertiesService.getScriptProperties().getProperty('okta_api_key');

  let headers = {
    'Authorization': `SSWS ${oktaApiKey}`
  }
  let options = {
    'headers': headers,
    'muteHttpExceptions': true
  }
  let response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
  return response;
}


function addToSheet() {
  const oktaDomain= PropertiesService.getScriptProperties().getProperty('okta_domain');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = "App Usage1";
  let sheet = ss.getSheetByName(sheetName) || ss.insertSheet().setName(sheetName);
  sheet.clearContents();

  const oktaApps = basicOktaRequest(`https://${oktaDomain}.okta.com/api/v1/apps?filter=status+eq+%22ACTIVE%22&includeNonDeleted=false&useOptimization=true&limit=200`);

  let headers = [];

  oktaApps.forEach(app => {
    const shouldSkipApp = skipList.some(skipString => 
      app.label.toLowerCase().includes(skipString.toLowerCase())
    );
    if (shouldSkipApp) {
      console.log("Skipping app:", app.label);
      return;
    }

    const appInfo = [
      app.id,
      app.label,
      app?.features?.toString(),
      app?.signOnMode,
      app?._links?.users?.href
    ];

    try {
      const usersResponse = basicOktaRequest(appInfo[4] + '?expand=user&limit=200');
      const users = Array.isArray(usersResponse) ? usersResponse : usersResponse.users;

      if (users && users.length > 0) {
        users.forEach(user => {
          const profile = user._embedded?.user?.profile;
          const rowData = [
            ...appInfo,
            profile?.displayName,
            profile?.login,
            profile?.department,
            profile?.title,
            profile?.country,
            profile?.employeeType ,
            user?.scope,
            user?._links?.group?.name
          ];

          // Write data to the sheet immediately
          sheet.appendRow(rowData); 
        });
      } else {
        console.log("No users found for app:", app.label);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }

    // Extract headers only once
    if (headers.length === 0) {
      headers = [
        "appId", "appName", "features", "signOnMode", "usersHref",
        "name", "email", "department", "title", "country", "employeeType",'scope','groupname'
      ];
      sheet.appendRow(headers); // Write headers immediately
    }
  });
}
