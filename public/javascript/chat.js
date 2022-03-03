const socket = io();

let chatInput = document.getElementById('msg-input');
let chatForm = document.getElementById('chat-form');
let messageList = document.getElementById("message-list");

let nameInput = document.getElementById('name-input');
let logonForm = document.getElementById('logon-form');
let errMsg = document.getElementById('err-msg');

let colorBtns = document.querySelectorAll('.color-btn');
let userColor;

let logonView = document.getElementById('logon-form-wrapper');

let onlineUsersList = document.getElementById('online-users-list');

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (chatInput.value) {
        socket.emit('chat message', { chatInput: chatInput.value, sId: socket.id });
        chatInput.value = '';
    }
});

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
            userColor = '#227c9d';
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
                logonView.classList.add('hide')

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

    message.textContent = obj.chatInput;
    messageBy.textContent = obj.name;
    time.textContent = obj.time;

    messageBy.style.color = obj.color;

    messageContainer.appendChild(message);
    messageContainer.appendChild(messageBy);
    messageContainer.append(time);

    msgListItem.appendChild(messageContainer);

    messageList.appendChild(msgListItem);
});

socket.on('update user list', (users) => {
    console.log("list updated!!!");

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

});