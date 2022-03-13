/* Author: Sofian Mustafa */
const socket = io();

////// Html Element Selections //////

//// Chat ////
let chatInput = document.getElementById('msg-input');
let chatForm = document.getElementById('chat-form');
let messageList = document.getElementById("message-list");
let messageWrap = document.getElementById('message-wrap');
let messageListHtml;
let messagingView = document.getElementById('messaging-interface-wrapper');
let chatInterface = document.getElementById('chat-interface-wrap')

//// Logon form ////
let nameInput = document.getElementById('name-input');
let logonForm = document.getElementById('logon-form');
let errMsg = document.getElementById('err-msg');
let colorBtns = document.querySelectorAll('.color-btn');
let logonView = document.getElementById('logon-form-wrapper');
// array of colors possible for users to select
let colorArr = ['#fe6d73', '#ffcb77', '#17c3b2', '#cd61f8'];
// some default nicknames for random selection if a name is not inputted
let defaultNamesArr = ['Moana', 'Olaf', 'Flynn', 'Jafar', 'Winnie', 'Mickey', 'Stitch', 'Simba', 'Dory', 'Nemo', 'Buzz', 'Woody', 'McQueen']

//// Online user view ////
let onlineUsersList = document.getElementById('online-users-list');
let showOnlineUsersBtn = document.getElementById('show-users');
let userColor;
// flag for toggling view of online users
let showUsersFlag = false;


// listen for a submit event on the chat form
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // if a value is submitted for the message
    if (chatInput.value) {
        // emit the message and user's socket id to the server
        socket.emit('chat message', { chatInput: chatInput.value, sId: socket.id });
        // reset the chat input
        chatInput.value = '';
    }
});

// listen for a click even for the 'online users' icon button
showOnlineUsersBtn.addEventListener('click', () => {
    // if the flag is unset, show the list of online users
    // and hide the messages
    if (!showUsersFlag) {
        messagingView.classList.add('hide');
        onlineUsersList.classList.remove('hide');
        // switch the flag
        showUsersFlag = true;
    }
    // if the flag is set, hide the list of online users
    // and display the messages
    else {
        messagingView.classList.remove('hide');
        onlineUsersList.classList.add('hide');
        showUsersFlag = false;
    }

})

// listen for button click to set nickname color
// set the userColor based on the button clicked
colorBtns.forEach((button) => {
    button.addEventListener('click', () => {
        if (button.id == 'c1') {
            userColor = colorArr[0];
        } else if (button.id == 'c2') {
            userColor = colorArr[1];
        } else if (button.id == 'c3') {
            userColor = colorArr[2]
        } else if (button.id == 'c4') {
            userColor = colorArr[3];
        }
    });
});

// listen for a submit event on the login form
logonForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let curName = nameInput.value;

    // If the user did not select a color
    if (userColor == null) {
        // set a random, default color
        userColor = _.sample(colorArr);
    }

    // if the user did not set a name
    if (curName == '') {
        // set a default, random name
        curName = _.sample(defaultNamesArr);
        // remove the selected name from the array - it is no longer available
        defaultNamesArr.splice(defaultNamesArr.indexOf(curName), 1);

    }

    // Emit the user's name and color to the server with a callback function checking for the 
    // name's uniqueness
    socket.emit('set-user-info', { name: curName, color: userColor }, (uniqueName) => {
        if (!uniqueName) {
            errMsg.textContent = "This nickname is in use, please choose a different name.";
        } else {
            // empty the error message
            errMsg.textContent = '';
            // render the chat log for the new connection
            socket.emit('all messages');
            // switch views
            logonView.classList.add('hide');
            chatInterface.classList.remove('hide');

        }
    });
    // reset the name input's value
    nameInput.value = '';

});

// renders messages into the chat log
function renderMessage(message, author, time, color, sId) {
    let messageContainer = document.createElement('div');
    messageContainer.className = 'message-cont';
    let msgListItem = document.createElement('li');
    msgListItem.id = 'msg-list-item';

    let messageElement = document.createElement('p'),
        messageBy = document.createElement('p'),
        timeElement = document.createElement('p');

    // set content of a chat message, its timestamp, and author
    messageElement.textContent = message;
    messageBy.textContent = author;
    timeElement.textContent = time;

    // set the author's nickname color to their selected color
    messageBy.style.color = color;

    // outline the message of the sender with the sender's color for all messages except the current user's sent messages
    messageContainer.style.border = "1px solid " + color;


    timeElement.id = "time";
    messageBy.id = "name";

    // append the message to the message container
    messageContainer.appendChild(messageElement);

    // append the message container, timestamp, and nickname to a list item
    msgListItem.appendChild(messageBy);
    msgListItem.appendChild(messageContainer);
    msgListItem.appendChild(timeElement);

    // append the list item to the ul
    messageList.appendChild(msgListItem);

    // style the message based on the connection it was sent from
    if (sId === socket.id) {
        msgListItem.classList.add('msg-sender');
        // remove the colored border from the current user's sent messages
        for (let childNode of msgListItem.childNodes) {
            childNode.style.border = null;
        }
    } else {
        msgListItem.classList.remove('msg-sender');
    }

}

// adds a new message to the log
socket.on('chat message', (obj) => {
    // render messages that are sent only for those who can see the chat interface
    /* 'all messages' event handles message rendering for new connections & connections
    that connected before messages were sent in the chat but did not log in*/
    if (!chatInterface.classList.contains('hide')) {
        renderMessage(obj.chatInput, obj.name, obj.time, obj.color, obj.sId);
    }
});

// renders all messages that are in the log for newly connected users
socket.on('all messages', (userMessages) => {
    let users = userMessages.users;
    let chatlog = userMessages.chatlog;

    // if this is the newest connection
    if (socket.id == userMessages.sId) {
        // for every message in the chatlog
        for (let message of chatlog) {
            // for every user
            for (let user of users) {
                // for every message stored in the user's object
                for (userMessage of user.messages) {
                    // if the chatlog message matches the message in the user's object
                    if (userMessage.message == message) {
                        // render the message with these parameters
                        renderMessage(message, user.name, userMessage.time, user.color, user.sId);
                    }
                }
            }
        }
    }
});

// updates list of online users
socket.on('update user interface', (users) => {

    // remove original list items
    while (onlineUsersList.firstChild) {
        onlineUsersList.removeChild(onlineUsersList.firstChild);
    }

    // update the list with users from the updated users list.
    for (let nick of users.nicknames) {
        let userItem = document.createElement('li');
        // set the nickname of the user
        userItem.textContent = nick;
        // set the color of the nickname
        for (user of users.users) {
            if (user.name == nick) {
                userItem.style.color = user.color;
            }
        }
        onlineUsersList.appendChild(userItem);
    }

});