const socket = io();

let chatInput = document.getElementById('msg-input');
let chatForm = document.getElementById('chat-form');
let messageList = document.getElementById("message-list");
let messageWrap = document.getElementById('message-wrap');
let messageListHtml;
let messagingView = document.getElementById('messaging-interface-wrapper');

let chatInterface = document.getElementById('chat-interface-wrap')

let nameInput = document.getElementById('name-input');
let logonForm = document.getElementById('logon-form');
let errMsg = document.getElementById('err-msg');

let colorBtns = document.querySelectorAll('.color-btn');
let showOnlineUsersBtn = document.getElementById('show-users');
let userColor;

let logonView = document.getElementById('logon-form-wrapper');

let onlineUsersList = document.getElementById('online-users-list');

// flag for the button that shows the online users
let showUsersFlag = false;

// array of colors possible for users to select
let colorArr = ['#fe6d73', '#ffcb77', '#ffcb77', '#cd61f8'];

// some default nicknames for random selection if a name is not inputted
let defaultNamesArr = ['Moana', 'Olaf', 'Flynn', 'Jafar', 'Winnie', 'Mickey', 'Stitch', 'Simba', 'Dory', 'Nemo', 'Buzz', 'Woody', 'McQueen']

// listen for a submit event on the chat form
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // if a value was submitted for the message
    if (chatInput.value) {
        // emit the message and user's socket id to the server
        socket.emit('chat message', { chatInput: chatInput.value, sId: socket.id });
        // reset the chat input
        chatInput.value = '';
    }
});

// listen for a click from the 'online users' icon button
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

// listen for button click to set name color
// set the userColor based on the button clicked
colorBtns.forEach((button) => {
    button.addEventListener('click', element => {
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
    }

    // Emit the user's name and color to the server with a callback function checking for the 
    // name's uniqueness
    socket.emit('set-user-info', { name: curName, color: userColor }, (uniqueName) => {
        if (!uniqueName) {
            errMsg.textContent = "This nickname is in use, please choose a different name.";
        } else {
            // empty the error message
            errMsg.textContent = '';
            // switch views
            logonView.classList.add('hide');
            chatInterface.classList.remove('hide');

        }
    });
    // reset the name input's value
    nameInput.value = '';

});

socket.on('chat message', (obj) => {
    let msgListItem = document.createElement('li');
    let messageContainer = document.createElement('div');
    messageContainer.className = 'message-cont';

    let message = document.createElement('p'),
        messageBy = document.createElement('p'),
        time = document.createElement('p');

    msgListItem.id = 'msg-list-item';



    message.textContent = obj.chatInput;
    messageBy.textContent = obj.name;
    time.textContent = obj.time;

    messageBy.style.color = obj.color;

    time.id = "time";
    messageBy.id = "name";

    // append the message to the message container
    messageContainer.appendChild(message);

    // append the message container, timestamp, and nickname to a list item
    msgListItem.appendChild(messageBy);
    msgListItem.appendChild(messageContainer);
    msgListItem.appendChild(time);

    // append the list item to the ul
    messageList.appendChild(msgListItem);

    // bold the message for the connection it was sent from
    if (obj.sId === socket.id) {
        msgListItem.classList.add('msg-sender');
    } else {
        msgListItem.classList.remove('msg-sender');
    }

    console.log(messageList.innerHTML);

    //messageListHtml = messageList.innerHTML;

});

socket.on('all messages', (allMessagesHtml) => {
    messageWrap.innerHTML = allMessagesHtml;
})

socket.on('update user interface', (users) => {

    // remove original list items
    while (onlineUsersList.firstChild) {
        onlineUsersList.removeChild(onlineUsersList.firstChild);
    }

    // update the list with users from the updated users list.
    for (let user of users) {
        let userItem = document.createElement('li');
        userItem.textContent = user.name;
        userItem.style.color = user.color;
        onlineUsersList.appendChild(userItem);
    }

    //socket.emit('all messages', messageListHtml);

});