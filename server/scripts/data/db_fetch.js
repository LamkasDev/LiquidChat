module.exports = {
    async fetchUser(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading User(id: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM users WHERE id='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatUser(result[0][0]);
    },

    async fetchUserByUsername(db, username) {
        if(db.DEBUG) {
            console.log(" - [db] Loading User(username: " + username + ") from the database..."); 
        }

        var query0 = "SELECT * FROM users WHERE username='" + username + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatUser(result[0][0]);
    },

    async fetchChannel(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading Channel(id: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM channels WHERE id='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatChannel(result[0][0])
    },

    async fetchChannels(db) {
        if(db.DEBUG) {
            console.log(" - [db] Loading Channels from the database..."); 
        }

        var query0 = "SELECT * FROM channels";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return [];
        }

        var res = result[0]
        res.forEach(_res => {
            _res = this.formatChannel(_res)
        });
    
        return res
    },

    async fetchMessage(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading Message(id: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM messages WHERE id='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatMessage(result[0][0])
    },

    async fetchMessages(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading Messages from Channel(id: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM messages WHERE channelID='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return [];
        }

        var res = result[0]
        res.forEach(_res => {
            _res = this.formatMessage(_res)
        });
    
        return res
    },

    async fetchFriendRequest(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading FriendRequest(id: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM friendRequests WHERE id='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatFriendRequest(result[0][0])
    },

    async fetchFriendRequestByTarget(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading FriendRequest(target: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM friendRequests WHERE targetID='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatFriendRequest(result[0][0])
    },

    async fetchFriendRequests(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading FriendRequests from User(id: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM friendRequests WHERE authorID='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return [];
        }

        var res = result[0]
        res.forEach(_res => {
            _res = this.formatFriendRequest(_res)
        });
    
        return res
    },

    formatUser(user) {
        console.log(user);
        user.friendList = user.friendList.split(",")

        return user;
    },

    formatMessage(message) {
        message.author = { id: message.authorID }
        delete message.authorID
        message.channel = { id: message.channelID }
        delete message.channelID
        message.file = message.fileName == null ? undefined : { name: message.fileName, size: message.fileSize }
        delete message.fileName
        delete message.fileSize

        return message;
    },

    formatChannel(channel) {
        channel.author = { id: channel.authorID }
        delete channel.authorID

        return channel;
    },

    formatFriendRequest(friendRequest) {
        friendRequest.author = { id: friendRequest.authorID }
        delete friendRequest.authorID
        friendRequest.target = { id: friendRequest.targetID }
        delete friendRequest.targetID

        return friendRequest;
    }
}