![Untitled design](https://github.com/user-attachments/assets/f2c322c2-06bd-49c5-bc03-33be0401dc2a)

# Find Common Groups App

This Google Apps Script web app allows you to easily find the common Google Groups that two or more users are members of. Simply enter the email addresses of the users (comma-separated) and click "Find Groups". The app will display a list of the common groups.

## Features:

*   **User-friendly interface:** A simple and intuitive web app interface for easy input and output.
*   **Dynamic results:** The results area updates dynamically as you change the input.
*   **Loading indicator:** Provides visual feedback while the app is processing the request.
*   **Authorization:** Restricts access to authorized users only (configurable in the script).
*   **Embedded logo:** Displays a custom logo (configurable via script properties).

## How to use:

1.  Deploy the web app as described in the code comments.
2.  Enter the email addresses of the users in the text area.
3.  Click "Find Groups".
4.  The app will display a list of common groups for the specified users.

## Script Properties:

This app uses script properties for configuration. You'll need to set the following properties:

*   **LOGO_URL:** The URL of the logo image to display.
*   optional - **domain:** Your company's domain - Used in the google groups you want to allow access to in the doGet function.

To set script properties:

1.  In the Apps Script editor, go to **Project Settings > Script properties**.
2.  Click **Add script property**.
3.  Enter the property name and value.
4.  Click **Save script properties**.

## Customization:

*   **Authorized Groups:** Modify the `authorizedGroups` array in the `doGet()` function to control user access.
*   **Styling:** Customize the appearance by modifying the CSS in the HTML file.

## This project is a great example of how to:

*   Use Google Apps Script to interact with Google Workspace services (Admin Directory API).
*   Create a web app using HTML Service.
*   Implement user authorization.
*   Use script properties for configuration.
*   Embed the web app in a Google Site.

Feel free to fork and modify this project to suit your needs!
