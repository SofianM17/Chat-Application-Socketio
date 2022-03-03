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

// class for user
class User {
    constructor(name, id, color) {
        this.sId = id;
        this.name = name;
        this.color = color;
    }
}

// list of users
let users = [];

// run server when a client connects
io.on('connection', (socket) => {

    socket.on('chat message', (obj) => {
        // create a DateTime object
        let dateTime = luxon.DateTime;
        // get the current time and format it.
        let curTime = dateTime.now().toLocaleString(dateTime.TIME_SIMPLE);
        let curName;
        let curColor;
        // Find the name of the person with the matching socket id from the list of users.
        for (let user of users) {
            // if the socket id of the user matches the socket id of the emitted object
            if (user.sId == obj.sId) {
                curName = user.name;
                curColor = user.color;
            }
        }
        io.emit('chat message', { chatInput: obj.chatInput, name: curName, time: curTime, color: curColor });
    });

    socket.on('set-user-info', (obj, uniqueName) => {
        if (nicknames.indexOf(obj.name) == -1) {
            nicknames.push(obj.name);

            users.push(new User(obj.name, socket.id, obj.color));
            updateUserList();
            console.log(users);
            uniqueName(true);
        } else {
            uniqueName(false);
        }

    })

    //  emit an updated list of users to the client
    function updateUserList() {
        io.emit('update user list', users);
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