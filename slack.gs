function getSlackUserByEmail_(email)
{
  var methodURL = "https://slack.com/api/users.lookupByEmail";
  var headers = {
    "Authorization": slackApiKey
  };
  var params = {
    "email": email
  };
  var options = {
    'method': 'get',
    'headers': headers
  };
  var fullURL = methodURL + '?' + makeParams_(params);

  var response = UrlFetchApp.fetch(fullURL, options);
  return response.getContentText();


}

function getSlackUserList_(limit, cursor) {
  var methodURL = "https://slack.com/api/users.list";
  var headers = {
    "Authorization": slackApiKey
  };

  var params = {
    "limit": limit,
    "cursor": cursor

  };

  var fullURL = methodURL + '?' + makeParams_(params);
  var options = {
    'method': 'get',
    'headers': headers
  };
  response = UrlFetchApp.fetch(fullURL, options);
  if (response.getResponseCode() == SUCCESS) {
    var data = JSON.parse(response.getContentText());
    return data;
  } else {
    Logger.log("BAD RESPONSE");
  }

}
function getMembersFromSlackList_(slackList)
{
  return slackList.members;
}


function setSlackJobTitle_(slackUserID,oktaJobTitle)
{
  var methodURL= "https://slack.com/api/users.profile.set";
  var headers = {
        "Authorization":slackApiKey
    };
  
  var body={
        "user":slackUserID,
        "name":"Xf03UK26D4BX",
        "value":oktaJobTitle
    };
  var options = {
    'method': 'post',
    'headers': headers,
    'payload' : body
  };
  var response = UrlFetchApp.fetch(methodURL,options);
  return response.getResponseCode();
  
}

function setSlackRealName_(slackUserID,name)
{
  var methodURL= "https://slack.com/api/users.profile.set";
  var headers = {
        "Authorization":slackApiKey
    };
  
  var body={
        "user":slackUserID,
        "name":"real_name",
        "value":name
    };
  var options = {
    'method': 'post',
    'headers': headers,
    'payload' : body
  };
  var response = UrlFetchApp.fetch(methodURL,options);
  return response.getResponseCode();
  
}


function updateJobTitles()
{
  //The following here will get all the users from Google directory, filter them by relevence and update everyone's job titles!
  var userList = listAllUsers();
  var email;
  var slackID;
  var title;
  var slackUser;
  var count = 0;
  for (var i =0 ; i<userList.length; i++){
    email = userList[i]["primaryEmail"]
    title = userList[i]["title"]
    try {
      slackUser = JSON.parse(getSlackUserByEmail_(email));
      slackID = slackUser['user'].id;
    } catch(e){
      //console.log("Couldnt find %s in Slack" , email);
      continue;
    }
    
    setSlackJobTitle_(slackID,title)
    count++;
    console.log("Updated name %s\n email : %s\n %s google title : %s" , userList[i]["fullName"],email , slackID ,title);

  }
  console.log("number of active users on Slack is : %n", count);

}

function checkIfSlackDeleted(email)
{
  user = JSON.parse(getSlackUserByEmail(email));
  var ret;
  try {
    ret = user.user.deleted;
  }
  catch(e){
    Logger.log("User does not exist or the user is temporary");
  }
  finally {
    return ret;
  }
}

function setSlackManager_(slackUserID,slackManagerID)
{
  var methodURL= "https://slack.com/api/users.profile.set";
  var headers = {
        "Authorization":slackApiKey
    };
  
  var body={
        "user":slackUserID,
        "name":"Xf03VBMVMM4Y",
        "value":slackManagerID
    };
  var options = {
    'method': 'post',
    'headers': headers,
    'payload' : body
  };
  try{
    var response = UrlFetchApp.fetch(methodURL,options);
    return response.getResponseCode();
  }
  catch(e){
    console.error("did not set up manager on Slack for " +slackUserID)
    return;
  }
  
}

function setSlackCountry_(slackUserID,country)
{
  var methodURL= "https://slack.com/api/users.profile.set";
  var headers = {
        "Authorization":slackApiKey
    };
  
  var body={
        "user":slackUserID,
        "name":"Xf03UFCWTZN2",
        "value":country
    };
  var options = {
    'method': 'post',
    'headers': headers,
    'payload' : body
  };
  var response = UrlFetchApp.fetch(methodURL,options);
  return response.getResponseCode();
  
}

function setSlackDepartment_(slackUserID,department)
{
  var methodURL= "https://slack.com/api/users.profile.set";
  var headers = {
        "Authorization":slackApiKey
    };
  
  var body={
        "user":slackUserID,
        "name":"Xf03V0KUFNMP",
        "value":department
    };
  var options = {
    'method': 'post',
    'headers': headers,
    'payload' : body
  };
  var response = UrlFetchApp.fetch(methodURL,options);
  return response.getResponseCode();
  
}


function updateSlackProfiles()
{
  //The following here will get all the users from Google directory, filter them by relevence and update everyone's job titles!
  var userList = listUsers_No_restrictions_();
  var email;
  var userManager;
  var slackID;
  var slackIDManager;
  var title;
  var country;
  var slackUser;
  var slackManager;
  var department;
  
  var count = 0;
  for (var i =0 ; i<userList.length; i++){
    country = ""
    slackIDManager = ""
    userManager = ""
    department = "";
    slackID=""


    var googUser = userList[i];
    email = googUser['primaryEmail'];
    try {
      slackUser = JSON.parse(getSlackUserByEmail_(email));
      slackID = slackUser['user'].id;
      userManager = googUser['relations'][0].value;
      slackManager = JSON.parse(getSlackUserByEmail_(userManager));
      slackIDManager = slackManager['user'].id;
      department = googUser['organizations'][0]['department']
      country = googUser['customSchemas']['Basic_information']['Country'];
      title = googUser['organizations'][0]['title']
      console.log(email);
      console.log("\t manager is " + userManager);
      console.log("\t manager ID is " + slackIDManager);
      console.log("\t country is "+ country);
      console.log("\t title is "+title )
      
    } catch(e){
      //console.log("Couldnt find %s in Slack" , email);
      continue;
    }

    //setSlackManager_(slackID,slackIDManager);
    //setSlackDepartment_(slackID,department);
    //setSlackCountry_(slackID,country);
    //setSlackJobTitle_(slackID,title)
    //setSlackJobTitle_(slackID,title)
    setSlackProfile2(slackID,title,department,country,slackIDManager) // this function replaces all of the above
    count++;
    console.log(count);
    if (count % 30 == 0){ //bypass the API rate limit
      Utilities.sleep(63*1000) // its actually 60 but adding 4 seconds just to make sure we dont get detected
    }
    
    //count++;
    //console.log("Updated name %s\n email : %s\n %s google title : %s" , userList[i]["fullName"],email , slackID ,title);

  }
  //console.log("number of active users on Slack is : %n", count);

}

/**
 * This function checks if a user is found by its email
 * @param email - a string
 */
function checkIfSlackUserExists(email){
  const user_ = JSON.parse(getSlackUserByEmail(email));
  if( user_.ok == false && user_.error == 'users_not_found'){
    return false;
  }
  else return true;
}


function setSlackProfile2(slackUserID,title,department,country,managerID)
{
  var methodURL= "https://slack.com/api/users.profile.set";
  var headers = {
        "Authorization":slackApiKey,
        //"x-slack-user": slackUserID // Adding the x-slack-user header
    };
  
  var body = {
    "user": slackUserID,
    profile: JSON.stringify({
      "fields": {
        "Xf03UK26D4BX": { //title
          "value": title,
        },
        "Xf03V0KUFNMP": { //department
          "value": department,
        },
        "Xf03UFCWTZN2": { //country
          "value": country,
        },
        "Xf03VBMVMM4Y": { //managerSlackID
          "value": managerID,
        }
      }
    })
  }

  var options = {
    'method': 'post',
    'headers': headers,
    "contentType": "application/json",
    'payload' : JSON.stringify(body)
  };
  var response = UrlFetchApp.fetch(methodURL,options);
  return response.getContentText();
  
}
