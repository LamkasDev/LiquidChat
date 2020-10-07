class Endpoint {
    constructor(app) {
        this.app = app;
    }

    addServer(db, server) {
        if(db.DEBUG) {
            console.log(" - [db] Adding Server(id: " + server.id + ") into the database..."); 
        }

        var query = "INSERT IGNORE INTO servers (id, name, createdAt, authorID, avatar, channelList) VALUES('" + server.id + "', '" + server.name + "', " + server.createdAt + ", '" + server.author.id + "', '" + server.avatar + "', '" + server.channelList.join(",") + "')";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },
    
    addUser(db, user) {
        if(db.DEBUG) {
            console.log(" - [db] Adding User(id: " + user.id + ") into the database..."); 
        }

        var query = "INSERT IGNORE INTO users (id, username, createdAt, avatar, password, friendList, dmChannelList, serverList, status) VALUES('" + user.id + "', '" + user.username + "', " + user.createdAt + ", '" + user.avatar + "', '" + user.password + "', '" + user.friendList.join(",") + "', '" + user.dmChannelList.join(",") + "', '" + user.serverList.join(",") + "', " + user.status + ")";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    addChannel(db, channel) {
        if(db.DEBUG) {
            console.log(" - [db] Adding Channel(id: " + channel.id + ") into the database..."); 
        }

        var query0 = "(id, name, type, createdAt, authorID" + (channel.members == null ? "" : ", members") + (channel.server == null ? ")" : ", serverID)")
        var query1 = "('" + channel.id + "', '" + channel.name + "', "+ channel.type + ", " + channel.createdAt + ", '" + channel.author.id + "'" + (channel.members == null ? "" : ", '" + channel.members.join(",") + "'") + (channel.server == null ? ")" : ", '" + channel.server.id + "')")
        var query = "INSERT IGNORE INTO channels " + query0 + " VALUES" + query1;
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    addMessage(db, message) {
        if(db.DEBUG) {
            console.log(" - [db] Adding Message(id: " + message.id + ") into the database..."); 
        }

        var query0 = "(id" + (message.text == null ? "" : ", text") + ", createdAt, authorID, channelID, edited" + (message.file == null ? ")" : ", fileName, fileSize)")
        var query1 = "('" + message.id + "'" + (message.text == null ? "" : ", '" + message.text + "'") + ", " + message.createdAt + ", '" + message.author.id + "', '" + message.channel.id + "', " + message.edited + (message.file == null ? ")" : ", '" + message.file.name + "', " + message.file.size + ")")
        var query = "INSERT IGNORE INTO messages " + query0 + " VALUES" + query1;
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    addFriendRequest(db, friendRequest) {
        if(db.DEBUG) {
            console.log(" - [db] Adding FriendRequest(id: " + friendRequest.id + ") into the database..."); 
        }
        
        var query = "INSERT IGNORE INTO friendRequests (id, authorID, targetID, createdAt) VALUES('" + friendRequest.id + "', '" + friendRequest.author.id + "', '" + friendRequest.target.id + "', " + friendRequest.createdAt + ")";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    }
}