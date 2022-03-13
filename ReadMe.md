
# To run the application:
1. navigate to the root directory where 'server.js' is located
2. run "npm install" to ensure all dependencies are installed
3. run "npm start" to start the server
4. navigate to the server at the url http://localhost:3000/

# To use the application:
1. Enter a nickname into the input field or leave it blank to be automatically assigned a name. If a nickname that is currently in use is entered, an error message will be displayed.
2. Select one of the color options. If no color option is selected, a random color will be assigned to you.
3. Once the chat interface is visible, type a message into the input field labelled'Type a message...'.
	
To view the list of all users who are online, click on the people icon button in the top left of the interface. This list is automatically updated as users join and leave the chatroom. The list is also updated when users change their nickname or nickname color.

# Commands:
- To change your color, enter the following command into the message input field:

		/nickcolor <RRRGGGBBB>

	such that all symbols shown above are included, including "/", "<", and ">".
	'RRR', 'GGG', and 'BBB' are replaced with custom 3-digit RGB values.
	If the value is 1 digit long or 2 digits long for any color, use '0' for 
	all preceding digits, i.e. '045' or '005'.

	Example:  ```/nickcolor <000255085>```

- To change your nickname, enter the following command into the message input field:
		
		/nick <nickname>

	such that all symbols shown above are included, with nickname replaced with the name you would like to change to.

	If a non-unique nickname is entered, an error message is returned that is only visible to you and to no other user who is currently online.

	Example: ```/nick <George>```

# Additional information:
- A menu icon was included at the top right of the interface to visually balance the header and provide a way to change nicknames and colors without using commands. Since this could not be implement in the given time constraints, functionality will be added to this button in the future.

# Reference:
- Nodemon and express were partly set up by following this example by Traversy Media https://www.youtube.com/watch?v=jD7FnbI76Hg&t=1605s
