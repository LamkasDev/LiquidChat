module.exports = {
    addServer(db, server) {
        if(db.DEBUG) {
            console.log(" - [db] Adding Server(id: " + server.id + ") into the database..."); 
        }

        var query = "INSERT IGNORE INTO servers (id, name, createdAt, authorID, avatar, channels, members) VALUES" + db.contructQuestionMarks(7);
        db.sqlConn.promise().execute(query, [ server.id, server.name, server.createdAt,  server.author.id, server.avatar, server.channels.join(","), server.members.join(",") ])
        .then((result, err) => {
            if(err) { throw err; }
        });
    },
    
    addUser(db, user) {
        if(db.DEBUG) {
            console.log(" - [db] Adding User(id: " + user.id + ") into the database..."); 
        }

        var query = "INSERT IGNORE INTO users (id, username, createdAt, avatar, password, friends, dmChannels, servers, status) VALUES" + db.contructQuestionMarks(9);
        db.sqlConn.promise().execute(query, [ user.id, user.username, user.createdAt, user.avatar, user.password, user.friends.join(","), user.dmChannels.join(","), user.servers.join(","), user.status ])
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    addChannel(db, channel) {
        if(db.DEBUG) {
            console.log(" - [db] Adding Channel(id: " + channel.id + ") into the database..."); 
        }

        var query0 = "(id, name, type, createdAt, authorID" + (channel.members == null ? "" : ", members") + (channel.server == null ? ")" : ", serverID)")
        var query1 = [ channel.id, channel.name, channel.type, channel.createdAt, channel.author.id ]
        if(channel.members != null) { query1.push(channel.members.join(",")) }
        if(channel.server != null) { query1.push(channel.server.id) }

        var query = "INSERT IGNORE INTO channels " + query0 + " VALUES" + db.contructQuestionMarks(query1.length);
        db.sqlConn.promise().execute(query, query1)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    addMessage(db, message) {
        if(db.DEBUG) {
            console.log(" - [db] Adding Message(id: " + message.id + ") into the database..."); 
        }

        var query0 = "(id, createdAt, authorID, channelID, edited" + (message.text == null ? "" : ", text") + (message.file == null ? ")" : ", fileName, fileSize)")
        var query1 = [ message.id, message.createdAt, message.author.id, message.channel.id, message.edited ]
        if(message.text != null) { query1.push(message.text) }
        if(message.file != null) { query1.push(message.file.name, message.file.size) }
        
        var query = "INSERT IGNORE INTO messages " + query0 + " VALUES" + db.contructQuestionMarks(query1.length);
        db.sqlConn.promise().execute(query)
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