# This script will allow you to migrate from one directory to another in Kandji, given that you download the json files that Kandji provides.
# This code is not very "efficient" but it gets the job done.
'''
Pseudo code:
    For every device:
        IF device has attribute user:
            get the ID of the user (this is likely the Google workspace ID)
            Search that ID in the UsersWithDevices.json
            Get the user email from there.
            Search the email in the json but only on users with "integration" attribute == "name": "okta"
            get the userID of the Okta user
            update using the update device API.

'''
import json
import requests

#define some stuff
GOOGLE = 'gsuite'
SCIM = "scim"
OKTA = "Okta"
KANDJI_TOKEN = "REPLACE WITH YOUR TOKEN"

def updateDevice(device_id : str,api_token : str ,user_id ):
    url = f"https://bizzabo.api.kandji.io/api/v1/devices/{device_id}"
    payload = json.dumps({
    "user": user_id
    })
    headers = {
    'Authorization': f'Bearer {api_token}',
    'Content-Type': 'application/json'
    }

    response = requests.request("PATCH", url, headers=headers, data=payload)

    print(response.text)

if __name__ == "__main__":
    user=""
    email=""
    googleUserID =""
    deviceID=""
    oktaUserID =""
    with open("allDevices.json", "r") as file:
        computers = json.load(file)

    with open("usersWithDevices.json") as file2:
        users = json.load(file2)

    for computer in computers:
        user=""
        email=""
        googleUserID =""
        deviceID=""
        oktaUserID =""
        deviceID = computer["id"]
        if computer['user'] != None:
            googleUserID = computer['user']['id']
            for user in users:
                if googleUserID == user['id'] and user['integration']['type'] == GOOGLE:
                    email = user['email']
                    for user in users:
                        if email == user['email'] and (user['integration']['type'] == SCIM and user['integration']['name'] == OKTA):
                            #here we are standing on an okta user
                            oktaUserID = user['id']
                            print(f"Google user ID is {googleUserID}")
                            print(f"OKTA userID is {oktaUserID}")
                            print(f"email of that user ID is {email}")
                            print(deviceID)
                            updateDevice(deviceID , KANDJI_TOKEN , oktaUserID )
                            print("assigned the device to the okta user")
                            print("###########################")
                            
                   

        else : continue 

