//This can be paired with the helper functions also in this branch
/**
 * This function will get all of the staged users from Okta and will return them as a list of objects
 * https://developer.okta.com/docs/reference/api/users/#list-users-with-search
 * @return list of user objects
 */
function getAllStagedUsers() {
  //Defining initial constants
  const yourOktaDomain = PropertiesService.getScriptProperties().getProperty("okta_domain");
  const oktaToken = PropertiesService.getScriptProperties().getProperty("okta_token");
  const methodURL = `https://${yourOktaDomain}/api/v1/users?search=status+eq+%22STAGED%22`
  const options ={
    method :'get',
    contentType: 'application/json',
    headers: {
      'Accept': 'application/json',
      'Authorization': `SSWS ${oktaToken}`
    },muteHttpExceptions: true
  }
  try{
    // try to get the users
    var response = UrlFetchApp.fetch(methodURL, options);
    const listOfUsers = JSON.parse(response.getContentText());
    if (response.getResponseCode() == 200 ){ //if the the response is OK
      //console.log(listOfUsers);
      return listOfUsers
    }
  }
  catch (e) {
    console.error(e.message)
    throw("Fatal error occured please check the details above")
    
  }
}

/**
 * This function will activate the user on Okta IF AND ONLY IF they are in staged state.
 * The activation of the user will trigger an activation email being sent to their personal email address and also trigger Okta workflow automations
 * URL https://developer.okta.com/docs/reference/api/users/#activate-user
 */
function activateUser(userID){
  //Defining initial constants
  const yourOktaDomain = PropertiesService.getScriptProperties().getProperty("okta_domain");
  const oktaToken = PropertiesService.getScriptProperties().getProperty("okta_token");
  const methodURL = `https://${yourOktaDomain}/api/v1/users/${userID}/lifecycle/activate?sendEmail=true`
  const options ={
    method :'post',
    contentType: 'application/json',
    headers: {
      'Accept': 'application/json',
      'Authorization': `SSWS ${oktaToken}`
    },muteHttpExceptions: true
  }

  //now we will attemp to activate the user
  try{
    var response = UrlFetchApp.fetch(methodURL , options);
    if (response.getResponseCode() == 200 ){
      return true;
    }
  } catch (e){
    console.error(e.message);
    throw("Fatal error occured");
  }
}

function main(){
  users = getAllStagedUsers();
  for (const user of users){
    try{
      var hireDate = user.profile.hireDate;
      var userID = user.id;
      if (hireDate == null){ //the user is probably some service account or a user that was created manually otherwise this is not null.
        continue;
      } else {
        // we get here only if we have the hire date in hand. It is in string form
        if(isTodayOrPast(hireDate)){
          if(activateUser(userID) == true){
            console.log(`Activated user ${userID} successfully`);
          } else {
            console.error(`Something went wrong with the activation of ${userID}`);
          }
        }
      }
    } catch (e){
      continue //the user is probably some service account or a user that was created manually.
    }
  }
}
