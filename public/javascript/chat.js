const socket = io();

let chatInput = document.getElementById('msg-input');
let chatForm = document.getElementById('chat-form');
let messageList = document.getElementById("message-list");
let messageWrap = document.getElementById('message-wrap');
let messageListHtml;
let messagingView = document.getElementById('messaging-interface-wrapper');
let onlineUsersWrap = document.getElementById('online-users-wrap');

let chatInterface = document.getElementById('chat-interface-wrap')

let nameInput = document.getElementById('name-input');
let logonForm = document.getElementById('logon-form');
let errMsg = document.getElementById('err-msg');

let colorBtns = document.querySelectorAll('.color-btn');
let showOnlineUsersBtn = document.getElementById('show-users');
let userColor;

let logonView = document.getElementById('logon-form-wrapper');

let onlineUsersList = document.getElementById('online-users-list');

let showUsersFlag = false;

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (chatInput.value) {
        socket.emit('chat message', { chatInput: chatInput.value, sId: socket.id });
        chatInput.value = '';
    }
});

showOnlineUsersBtn.addEventListener('click', () => {
    if (!showUsersFlag) {
        messagingView.classList.add('hide');
        showUsersFlag = true;
    } else {
        messagingView.classList.remove('hide');
        showUsersFlag = false;
    }

})

// listen for button click to set name color
// set the userColor based on the button clicked
colorBtns.forEach((button) => {
    button.addEventListener('click', element => {
        if (button.id == 'c1') {
            userColor = '#fe6d73';
        } else if (button.id == 'c2') {
            userColor = '#ffcb77';
        } else if (button.id == 'c3') {
            userColor = '#17c3b2'
        } else if (button.id == 'c4') {
            userColor = '#cd61f8';
        }
    });
});

logonForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (nameInput.value && userColor != null) {
        socket.emit('set-user-info', { name: nameInput.value, color: userColor }, (uniqueName) => {
            if (!uniqueName) {
                errMsg.textContent = "This nickname is in use, please try again";
            } else {
                errMsg.textContent = '';
                logonView.classList.add('hide');
                chatInterface.classList.remove('hide');

            }
        });
        nameInput.value = '';
    } else if (nameInput.value && userColor == null) {
        errMsg.textContent = 'You have not selected a color';
    } else if (!nameInput.value && userColor != null) {
        errMsg.textContent = 'You have not entered a nickname';
    } else {
        errMsg.textContent = 'Please enter a nickname and select a color';
    }
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