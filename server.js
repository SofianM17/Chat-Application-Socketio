/* Author: Sofian Mustafa */
/* Reference: Nodemon and express were partly set up by following
this example by Traversy Media
https://www.youtube.com/watch?v=jD7FnbI76Hg&t=1605s*/

const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const luxon = require('luxon');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// static folder
app.use(express.static(path.join(__dirname, 'public')));

// list of names
let nicknames = [];

// class for creating user objects
class User {
    constructor(name, id, color, messages) {
        this.sId = id;
        this.name = name;
        this.color = color;
        // list of message objects
        this.messages = [];
    }
}

// class to create message objects
class Message {
    constructor(message, time) {
        this.message = message;
        this.time = time;
    }
}

// list of users
let users = [];
// list of all messages in the chatlog 
let chatlog = [];

// run server when a client connects
io.on('connection', (socket) => {

    // server side event handler for 'chat message'
    socket.on('chat message', (obj) => {
        // create a DateTime object
        let dateTime = luxon.DateTime;
        // get the current time and format it.
        let curTime = dateTime.now().toLocaleString(dateTime.TIME_WITH_SECONDS);
        let curName;
        let curColor;

        let newNickname;
        let newColor;


        // if the chat input matches with the change nickname command
        // '/nick <new nickname>'
        if ((/\/nick{1}\s<{1}[\w*\s*\W*\d*]*>{1}/gm).test(obj.chatInput)) {
            // slice the new nickname out of the string
            newNickname = obj.chatInput.slice(obj.chatInput.indexOf('<') + 1, obj.chatInput.indexOf('>'));

        }

        // if the chat input matches with the change nickcolor command
        // '/nickcolor <RRRGGGBBB>'
        if ((/\/nickcolor{1}\s<{1}\d{9}>{1}/gm).test(obj.chatInput)) {
            // slice the new color out of the string
            newColor = obj.chatInput.slice(obj.chatInput.indexOf('<') + 1, obj.chatInput.indexOf('>'));
            // form the string for the rgb style
            newColor = 'rgb(' + newColor[0] + newColor[1] + newColor[2] + ', ' + newColor[3] + newColor[4] +
                newColor[5] + ', ' + newColor[6] + newColor[7] + newColor[8] + ')';

        }

        // Find the name of the person with the matching socket id from the list of users.
        for (let user of users) {
            // if the socket id of the user matches the socket id of the emitted object
            if (user.sId == obj.sId) {
                curName = user.name;
                curColor = user.color;
                // if a new nickname was set, change it
                if (newNickname != null) {
                    // if new nickname is not in the list of current nicknames
                    if (nicknames.indexOf(newNickname) == -1) {
                        // update nickname is array of users
                        nicknames[nicknames.indexOf(user.name)] = newNickname;
                        // update nickname in user object
                        user.name = newNickname
                        newNickname = null;

                    } else {
                        // emit the error chat message only to the user that invoked the command
                        socket.emit('chat message', { chatInput: 'command error: that nickname is not unique!', name: curName, time: curTime, color: curColor, sId: socket.id });
                        newNickname = null;
                    }

                    // update list of online users with the new name
                    updateUserList();
                }
                // if a new color was set, change it
                if (newColor != null) {

                    // update color in user object
                    user.color = newColor;
                    newColor = null;

                    // update list of online users with the new color
                    updateUserList();
                }

                // store the user's message with its timestamp in the user object
                user.messages.push(new Message(obj.chatInput, curTime));
                // push the message to the chatlog
                chatlog.push(obj.chatInput);
            }
        }

        // emit required info for chat message to client side
        io.emit('chat message', { chatInput: obj.chatInput, name: curName, time: curTime, color: curColor, sId: socket.id });
    });

    socket.on('all messages', () => {
        // emit required info for populating chatlog to client side
        io.emit('all messages', { users: users, chatlog: chatlog, sId: socket.id });
    });

    socket.on('set-user-info', (obj, uniqueName) => {
        // if name is not already in nicknames
        if (nicknames.indexOf(obj.name) == -1) {
            // add the name to nicknames
            nicknames.push(obj.name);

            // create a new user object with provided info and socket id
            users.push(new User(obj.name, socket.id, obj.color));
            updateUserList();
            uniqueName(true);
        } else {
            uniqueName(false);
        }

    })

    //  emit an updated list of users to the client
    function updateUserList() {
        io.emit('update user interface', { users: users, nicknames: nicknames });
    }

    socket.on('disconnect', () => {

        // update the array of nickanames by removing
        // the name of the disconnected user
        for (let user of users) {
            // find the user with the same socket id as the disconnected socket
            if (user.sId === socket.id) {
                // Filter out the name of the disconnected user from nicknames
                nicknames = nicknames.filter((nName) => {
                    return nName !== user.name;
                })

            }
        }

        updateUserList();
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, console.log(`server running on port ${PORT}`));

// route the index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html')
})