/* author: Sofian Mustafa */
/* reference: The server's code was partly set up by following
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

// class for creating user obects
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
//
let messages = [];

// run server when a client connects
io.on('connection', (socket) => {

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
                        socket.emit('chat message', { chatInput: 'command error: that nickname is not unique!', name: curName, time: curTime, color: curColor, sId: socket.id });
                        newNickname = null;
                    }

                    // update list of online users with the new name
                    updateUserList();
                }
                // if a new color was set, change it
                if (newColor != null) {

                    // update nickname in user object
                    user.color = newColor;
                    newColor = null;

                    // update list of online users with the new color
                    updateUserList();
                }

                curName = user.name;
                curColor = user.color;
                // store the user's message with its timestamp in the user object
                user.messages.push(new Message(obj.chatInput, curTime));
                // push the message to the messages array to maintain ordering of messages
                messages.push(obj.chatInput);
                console.log(user);
            }
        }

        io.emit('chat message', { chatInput: obj.chatInput, name: curName, time: curTime, color: curColor, sId: socket.id });
    });

    socket.on('all messages', (messageListHtml) => {
        io.emit('all messages', messageListHtml);
    });

    socket.on('set-user-info', (obj, uniqueName) => {
        if (nicknames.indexOf(obj.name) == -1) {
            nicknames.push(obj.name);

            users.push(new User(obj.name, socket.id, obj.color));
            updateUserList();
            uniqueName(true);
        } else {
            uniqueName(false);
        }

    })

    //  emit an updated list of users to the client
    function updateUserList() {
        io.emit('update user interface', users);
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

        // filter out the disconnected user from the list of users
        users = users.filter((user) => {
            return user.sId !== socket.id;
        });

        updateUserList();
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, console.log(`server running on port ${PORT}`));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html')
})

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/html/chat.html')
})