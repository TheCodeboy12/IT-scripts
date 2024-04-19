/*
Here you will find functions that help the other functions in this branch.
*/

/**
 * Returns today's date formatted 
 */
function getTodaysDateFormatted_() {
  var today = new Date();
  var year = today.getFullYear();
  var month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  var day = today.getDate().toString().padStart(2, '0');

  return year + '-' + month + '-' + day;
}

/**
 * Generated a random password and returns it
 */
function generateRandomPassword_() {
  var length = 16; // You can change the length of the password
  var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}


/**
 * Checks if a given date is today or before today
 * @return true if it is , false otherwise
 * @param dateStr - a date in the following format yyyy-mm-dd {string}
 */
function isTodayOrPast(dateStr) {
  var givenDate = new Date(dateStr);
  if(isNaN(givenDate)){
    console.error("Invalid date given.")
    return false;
  }
  var today = new Date();

  // Set time to 00:00:00 for both dates to compare only the date part
  givenDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Check if the given date is today or in the past
  return givenDate.getTime() <= today.getTime();
}
