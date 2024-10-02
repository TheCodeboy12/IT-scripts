import requests
import os , sys
import json
from dotenv import load_dotenv
load_dotenv()
okta_domain = os.environ.get('OKTA_DOMAIN')  # Use environment variables for secrets
okta_token = os.environ.get('OKTA_TOKEN')
_globalURL = f'https://{okta_domain}/api/v1/'
headers = {
    'Accept': "application/json" ,
    'Authorization' : 'SSWS' + okta_token 
}

@staticmethod
def getUserID(email:str) -> str:
    url = _globalURL + 'users/' + email
    response = requests.get(url=url , headers=headers)
    if response.status_code != 200 :
        print('Cant find one of the users in Okta')
        exit(1)
    r = json.loads(response.text)
    return r['id']

@staticmethod
def getUserApps(email :str) -> requests.Response:
    url = _globalURL + 'users/' + email + '/appLinks'
    response = requests.get(url=url ,headers=headers)
    return response

@staticmethod
def getGroups(email:str) -> requests.Response:
    url = _globalURL + 'users/' + email + '/groups'
    response = requests.get(url=url ,headers=headers)
    return response

@staticmethod
def addToGroup(userEmail : str , groupID : str) -> requests.Response:
    url = _globalURL + 'groups/' + groupID + '/users/' + userEmail
    response = requests.put(url= url , headers=headers)
    return response

def mirror(source:str , dest:str) -> bool:
    '''
    Mirrors two users groups on Okta. 
    args: 
        source : email address of the user we want to copy from.
        dest : email address of the user we copy permissions to from the source user.
    returns : True if successfull , fasle otherwise.
    '''
    ret = True
    destID = getUserID(dest)
    groups = getGroups(source)
    apps = getUserApps(source)
    if (groups.status_code != 200 or apps.status_code != 200):
        print("Error : Could not get groups or apps of the source user for some reason. ")
        return False 
    groups= json.loads(groups.text)
    for group in groups :
        if group['type'] != 'OKTA_GROUP':
            continue
        #else we can add them
        #print({group['id'] : group['profile']['name']})
        r = addToGroup(destID ,group['id'])
        if (r.status_code == 204): #Assigned successfully according to the API https://developer.okta.com/docs/reference/api/groups/#response-example-13
            print(f'user {dest} has been added to {group['profile']['name']} group.')
            ret = ret and True
        else :
            print(f'An error occured while trying to assign {group['profile']['name']} to {dest}')
            ret = ret and False
    return ret

#main function
if __name__ == "__main__":
    try :
        source = sys.argv[1]
        dest = sys.argv[2]
    except IndexError:
        print("Error: Missing email1 argument")
        sys.exit(1)  # Exit with an error code
    print(source)
    print(dest)
    r= mirror(source=source, dest=dest)
    if r == False :
        exit(1)
