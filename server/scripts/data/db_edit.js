module.exports = {
    editUser(db, user) {
        if(db.DEBUG) {
            console.log(" - [db] Editing User(id: " + user.id + ") in the database..."); 
        }

        var query = "UPDATE users SET username='" + user.username + "', avatar='" + user.avatar + "', password='" + user.password + "' WHERE id='" + user.id + "'";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },
    
    editMessage(db, message) {
        if(db.DEBUG) {
            console.log(" - [db] Editing Message(id: " + message.id + ") in the database..."); 
        }

        var query0 = "text='" + message.text + "', edited=" + message.edited + (message.file == null ? "" : ", fileName='" + message.file.name + "', fileSize=" + message.file.size)
        console.log(query0)
        var query = "UPDATE messages SET " + query0 + " WHERE id='" + message.id + "'";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    }
}