// This code relies on AdminDirectory library in google apps scripts.
function createOUs(parentOrgUnitPath, ouList) {
  ouList.forEach(function(ouName) {
    var ou = {
      name: ouName,
      parentOrgUnitPath: parentOrgUnitPath,
      description: "Created by Script"
    };

    try {
      var result = AdminDirectory.Orgunits.insert(ou, 'my_customer');
      Logger.log("Created OU: " + result.orgUnitPath);
    } catch (e) {
      Logger.log("Error in creating OU '" + ouName + "': " + e.message);
    }
  });
}

function updateOUDescriptions(parentOrgUnitPath, newDescription) {
  try {
    // List all OUs under the specified parent OU
    var ous = AdminDirectory.Orgunits.list('my_customer', {
      type: 'all',
      orgUnitPath: parentOrgUnitPath
    });

    if (ous.organizationUnits && ous.organizationUnits.length > 0) {
      for (var i = 0; i < ous.organizationUnits.length; i++) {
        var ou = ous.organizationUnits[i];

        // Create an updated OU object with only the fields you want to change
        ou.description=newDescription;

        // Update the description of each OU
        AdminDirectory.Orgunits.update(ou, 'my_customer', ou.orgUnitPath);
        Logger.log('Updated OU: ' + ou.orgUnitPath + ' with new description.');
      }
    } else {
      Logger.log('No OUs found under the specified path.');
    }
  } catch (e) {
    Logger.log('Error updating OU descriptions: ' + e.message);
  }
}


function mainCreateOUs() {
  var parentOrgUnitPath = "/ParentOU"; // Change this to your parent OU path
  var ouList = ["Executive",
  "HR (Human Resources)",
  "IT (Information Technology)",
  "Engineering", "Sales and Marketing",
  "Operations",
  "Finance" ,
  "Legal" ,
  "Temporary" ,
  "Interns",
  "Project-Specific OUs"]; // List of OUs to create
}
