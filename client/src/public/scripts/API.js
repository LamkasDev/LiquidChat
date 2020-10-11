import axios from 'axios';
import io from "socket.io-client";

class API {
    constructor(_main) {
        this.mainClass = _main;
        this.socket = -1;
        this.wrtc = -1;

        this.queuedServers = [];
        this.queuedInvites = [];
    }

    async API_initWebsockets(userID) {
        //Setups the websocket client
        const socket = io(this.mainClass.state.APIEndpoint, {
            transports: ['websocket']
        });

        socket.on('connect', async() => {
            console.log("> socket.io connected!");
            await this.API_fetchUser(userID, true);
            this.API_fetchUsersForFriends(userID);
        });
        
        socket.on('message', (messageData) => {
            var message = JSON.parse(messageData);
            var channel = this.mainClass.state.channels.get(message.channel.id);
            channel.messages.push(message);

            var newChannels = this.mainClass.state.channels.set(channel.id, channel);
            this.mainClass.setState({
                channels: newChannels
            });

            this.API_fetchUsersForMessages([ message ])
        });
        socket.on('editMessage', (messageData) => {
            var message = JSON.parse(messageData);
            var channel = this.mainClass.state.channels.get(message.channel.id);

            var i = -1;
            channel.messages.forEach((m, _i) => {
                if(m.id === message.id) {
                    i = _i
                }
            });
            channel.messages[i] = message

            var newChannels = this.mainClass.state.channels.set(channel.id, channel);
            this.mainClass.setState({
                channels: newChannels
            });
        });
        socket.on('deleteMessage', (messageData) => {
            var message = JSON.parse(messageData);
            var channel = this.mainClass.state.channels.get(message.channel.id);

            var i = -1;
            channel.messages.forEach((m, _i) => {
                if(m.id === message.id) {
                    i = _i
                }
            });
            channel.messages.splice(i, 1)

            var newChannels = this.mainClass.state.channels.set(channel.id, channel);
            this.mainClass.setState({
                channels: newChannels
            });
        });

        socket.on('createServer', (serverData) => {
            var server = JSON.parse(serverData);
            var newServers = this.mainClass.state.servers.set(server.id, server);
            this.mainClass.setState({
                servers: newServers
            });
        });
        socket.on('updateServer', (serverData) => {
            var _server = JSON.parse(serverData);

            var newServers = new Map(this.mainClass.state.servers)
            var server = newServers.get(_server.id);
            server.name = _server.name;
            server.avatar = _server.avatar;
            server.members = _server.members;
            server.channels = _server.channels;
            server.invites = _server.invites;
            newServers.set(server.id, server);
            this.mainClass.setState({
                servers: newServers
            });
        });
        socket.on('deleteServer', (serverData) => {
            var server = JSON.parse(serverData);

            var newServers = new Map(this.mainClass.state.servers)
            newServers.delete(server.id);
            this.mainClass.setState({
                servers: newServers
            });
        });

        socket.on('createChannel', (channelData) => {
            var channel = JSON.parse(channelData);
            channel.messages = [];
            var newChannels = this.mainClass.state.channels.set(channel.id, channel);
            this.mainClass.setState({
                channels: newChannels
            });
        });
        socket.on('updateChannel', (channelData) => {
            var _channel = JSON.parse(channelData);

            var newChannels = new Map(this.mainClass.state.channels)
            var channel = newChannels.get(_channel.id);
            channel.name = _channel.name;
            channel.members = _channel.members;
            newChannels.set(channel.id, channel);
            this.mainClass.setState({
                channels: newChannels
            });
        });
        socket.on('deleteChannel', (channelData) => {
            var channel = JSON.parse(channelData);

            var newChannels = new Map(this.mainClass.state.channels)
            newChannels.delete(channel.id);
            this.mainClass.setState({
                channels: newChannels
            });
        });

        socket.on('uploadStart', (fileID, fileName) => {
            console.log("> upload start")
            this.mainClass.setState({
                uploadFileID: fileID,
                uploadFileName: fileName,
                uploadFailed: false
            });
        });
        socket.on('uploadProgress', (fileID, fileName, bytesReceived, bytesExpected) => {
            console.log("> upload progress")
            this.mainClass.setState({
                uploadReceived: bytesReceived,
                uploadExpected: bytesExpected
            });
        });
        socket.on('uploadFail', (fileID, fileName, fileSize) => {
            console.log("> upload fail")
            this.mainClass.setState({
                uploadFailed: true,
                uploadReceived: 0,
                uploadExpected: fileSize
            });
        });
        socket.on('uploadFinish', (fileID, fileName) => {
            console.log("> upload finish")
        });

        socket.on('updateUser', (userData) => {
            var user = JSON.parse(userData);
            if(this.mainClass.state.users.has(user.id)) {
                var newUsers = this.mainClass.state.users.set(user.id, user);
                this.mainClass.setState({
                    users: newUsers
                });
            }
        });
        socket.on('updateVoiceGroup', (voiceGroupData) => {
            var voiceGroup = JSON.parse(voiceGroupData);
            this.mainClass.setState({
                currentVoiceGroup: voiceGroup
            });
        });
        socket.on('updateFriendRequests', (friendRequestsData) => {
            var friendRequests = JSON.parse(friendRequestsData);
            this.API_fetchUsersForFriendRequests(friendRequests);
            this.mainClass.setState({
                friendRequests: friendRequests
            });
        });
        
        //Setups the WebRTC Client
        const wrtc = require('electron-webrtc')()
        wrtc.on('error', function (err) { console.log(err) })

        const config = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
        var pc = new wrtc.RTCPeerConnection(config)
        pc.onconnectionstatechange = function(event) {
            switch(pc.connectionState) {
                case "connected":
                    console.log("> WebRTC connected!")
                    break;

                case "closed":
                    console.log("> WebRTC closed-")
                    break;
            }
        }

        this.socket = socket;
        this.wrtc = wrtc;
        this.pc = pc;
    }
    
    //#region Fetching
    async API_fetchUser(id, containSensitive) {
        if(this.mainClass.state.users.has(id)) {
          return this.mainClass.state.users.get(id)
        } else {
          //Fetch user
          const reply = await axios.get(this.mainClass.state.APIEndpoint + '/fetchUser?id=' + id + (containSensitive === true ? "&containSensitive=true" : ""), { withCredentials: true });
          var user = reply.data
    
          //Cache user
          var newUsers = this.mainClass.state.users.set(user.id, user);
          this.mainClass.setState({
            users: newUsers
          });

          return user;
        }
    }

    async API_fetchServer(id) {
        if(this.mainClass.state.servers.has(id)) {
            return this.mainClass.state.servers.get(id)
        } else {
            //Fetch user
            const reply = await axios.get(this.mainClass.state.APIEndpoint + '/fetchServer?id=' + id, { withCredentials: true });
            var server = reply.data
      
            //Cache user
            var newServers = this.mainClass.state.servers.set(server.id, server);
            this.mainClass.setState({
                servers: newServers
            });
  
            return server;
        }
    }

    API_fetchServerSync(id) {
        if(this.mainClass.state.servers.has(id)) {
            return this.mainClass.state.servers.get(id)
        } else {
            if(this.queuedServers.includes(id)) {
                return -1;
            } else {
                this.API_fetchServer(id);
                return -1
            }
        }
    }

    async API_fetchFriendRequests() {
        const reply = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchFriendRequests', { withCredentials: true }));
        var friendRequests = reply.data

        this.API_fetchUsersForFriendRequests(friendRequests)
        this.mainClass.setState({
            friendRequests: friendRequests
        });
    }

    async API_fetchInvite(id) {
        if(this.mainClass.state.invites.has(id)) {
            return this.mainClass.state.invites.get(id)
        } else {
            //Fetch user
            const reply = await axios.get(this.mainClass.state.APIEndpoint + '/fetchInvite?id=' + id, { withCredentials: true });
            var invite = reply.data
      
            //Cache user
            var newInvites = this.mainClass.state.invites.set(invite.id, invite);
            this.API_fetchAllForInvites([ invite ])
            this.mainClass.setState({
                invites: newInvites
            });
  
            return invite;
        }
    }

    API_fetchInviteSync(id) {
        if(this.mainClass.state.invites.has(id)) {
            return this.mainClass.state.invites.get(id)
        } else {
            if(this.queuedInvites.includes(id)) {
                return -1;
            } else {
                this.API_fetchInvite(id);
                return -1
            }
        }
    }
    //#endregion

    //#region Fetching Utils
    async API_fetchUsersForFriendRequests(friendRequests) {
        friendRequests.forEach(friendRequest => {
            var id = friendRequest.author.id === this.mainClass.state.session.userID ? friendRequest.target.id : friendRequest.author.id;
            this.API_fetchUser(id)
        })
    }

    async API_fetchUsersForFriends(userID) {
        var user = this.mainClass.getUser(userID);
        user.friends.forEach(friendID => {
            this.API_fetchUser(friendID);
        });
    }

    async API_fetchUsersForMessages(messages) {
        const queue = new Map();
        messages.forEach(message => {
          if(!queue.has(message.author.id)) {
            this.API_fetchUser(message.author.id)
            queue.set(message.author.id, 1)
          }
        })
    }

    async API_fetchUsersForIDs(obj) {
        const queue = new Map();
        obj.forEach(userID => {
            if(!queue.has(userID)) {
                this.API_fetchUser(userID);
                queue.set(userID, 1);
            }
        });
    }

    async API_fetchAllForInvites(invites) {
        const queue = new Map();
        invites.forEach(invite => {
          if(!queue.has(invite.server.id)) {
            this.API_fetchServer(invite.server.id)
            queue.set(invite.server.id, 1)
          }

          if(!queue.has(invite.author.id)) {
            this.API_fetchUser(invite.author.id)
            queue.set(invite.author.id, 1)
          }
        })
    }
    //#endregion

    //#region User Actions
    async API_updateAvatar(file) {
        var data = new FormData();
        data.append("fileUploaded", file)

        const reply = await axios({
            method: 'post',
            url: this.mainClass.state.APIEndpoint + '/updateAvatar?fileName=' + file.name,
            processData: false,
            contentType: false,
            cache: false,
            enctype: 'multipart/form-data',
            data: data,
            withCredentials: true
        });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_editUser(email) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/editUser', {
            email: email
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_sendFriendRequest(userID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/sendFriendRequest', {
            target: {
                id: userID
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_removeFriend(userID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/removeFriend', {
            target: {
                id: userID
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_sendFriendRequestByUsername(username) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/sendFriendRequest', {
            target: {
                username: username
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_acceptFriendRequest(id) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/acceptFriendRequest', {
            id: id
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_declineFriendRequest(id) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/declineFriendRequest', {
            id: id
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }
    //#endregion

    //#region Authorization
    async API_login(_username, _password, _type) {
        this.mainClass.setState({
          waitingForSession: true
        })
    
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/login', {
          authType: _type,
          username: _username,
          password: _password
        }, { withCredentials: true });
    
        if(reply.data.status !== undefined) {
          return reply.data.status;
        } else {
          this.mainClass.setState({
            session: reply.data
          })
    
          setTimeout(() => {
            this.mainClass.setState({
              waitingForSession: false
            })
          }, 3000)

          this.API_initWebsockets(reply.data.userID);
          return reply.data;
        }
    }

    async API_register(_username, _password, _password2) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/register', {
            username: _username,
            password: _password,
            password2: _password2
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            this.mainClass.setState({
                session: reply.data
            });

            setTimeout(() => {
                this.mainClass.setState({
                  waitingForSession: false
                })
            }, 3000)

            this.API_initWebsockets(reply.data.userID);
            return reply.data;
        }
    }

    async API_logout() {
        await axios.post(this.mainClass.state.APIEndpoint + '/logout', {}, { withCredentials: true });
        window.location.reload(false);
        return true;
    }
    //#endregion

    //#region Messages
    async API_getSuitableDMChannel(userID) {
        var suitableChannels = Array.from(this.mainClass.state.channels.values()).filter(channel => { return channel.members !== undefined && channel.members.length === 2 && channel.members.includes(this.mainClass.state.session.userID) && channel.members.includes(userID); });
        var channel = -1;
        if(suitableChannels.length < 1) {
            channel = await this.API_createChannelDM("autogenerated DM", [ this.mainClass.state.session.userID, userID ])
            if(isNaN(channel) === false) {
                return undefined;
            } else {
                suitableChannels = [ channel ]
            }
        }

        return suitableChannels[0];
    }

    async API_sendMessage(message) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/message', {
            text: message,
            channel: {
                id: this.mainClass.state.currentChannel
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_sendDM(userID, message) {
        var channel = await this.API_getSuitableDMChannel(userID)
        if(channel === undefined) { return false; }

        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/message', {
            text: message,
            channel: {
                id: channel.id
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_sendFile(file, message) {
        var data = new FormData();
        data.append("fileUploaded", file)
        data.append("text", message)
        data.append("channel.id", this.mainClass.state.currentChannel)

        const reply = await axios({
            method: 'post',
            url: this.mainClass.state.APIEndpoint + '/upload?fileName=' + file.name,
            processData: false,
            contentType: false,
            cache: false,
            enctype: 'multipart/form-data',
            data: data,
            withCredentials: true
        });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_editMessage(originalMessage, newText) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/editMessage', {
            id: originalMessage.id,
            text: newText,
            channel: {
                id: this.mainClass.state.currentChannel
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_deleteMessage(message) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/deleteMessage', {
            id: message.id,
            channel: {
                id: message.channel.id
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_joinVoiceChannel(channel) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/joinVoiceChannel', {
            channel: {
                id: channel.id
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_leaveVoiceChannel(channel) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/leaveVoiceChannel', {
            channel: {
                id: channel.id
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }
    //#endregion

    //#region Servers
    async API_createServer(serverName) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/createServer', {
            name: serverName
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_updateServerAvatar(serverID, file) {
        var data = new FormData();
        data.append("fileUploaded", file)

        const reply = await axios({
            method: 'post',
            url: this.mainClass.state.APIEndpoint + '/updateServerAvatar?serverID=' + serverID + '&fileName=' + file.name,
            processData: false,
            contentType: false,
            cache: false,
            enctype: 'multipart/form-data',
            data: data,
            withCredentials: true
        });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_editServer(serverID, serverName) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/editServer', {
            id: serverID, name: serverName
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_deleteServer(serverID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/deleteServer', {
            id: serverID
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_leaveServer(serverID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/leaveServer', {
            id: serverID
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_joinServer(serverID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/joinServer', {
            id: serverID
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_kickFromServer(serverID, userID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/kickFromServer', {
            server: { id: serverID }, user: { id: userID }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }
    //#endregion

    //#region Channels
    async API_createChannel(serverID, channelName, channelType) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/createChannel', {
            server: { id: serverID }, name: channelName, type: channelType
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_createChannelDM(channelName, channelMembers) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/createChannel', {
            name: channelName, type: 2, members: channelMembers
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_removeFromDMChannel(channelID, userID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/removeFromDMChannel', {
            channel: { id: channelID }, user: { id: userID }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_addToDMChannel(channelID, userID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/addToDMChannel', {
            channel: { id: channelID }, user: { id: userID }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_editChannel(channelID, channelName) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/editChannel', {
            id: channelID, name: channelName
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_deleteChannel(channelID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/deleteChannel', {
            id: channelID
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_fetchDMChannels() {
        const reply = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchDMChannels', { withCredentials: true }));
        var newChannels = reply.data;
        newChannels = new Map(newChannels.map(obj => [obj.id, obj]));

        newChannels.forEach(async(channel) => {
            const reply2 = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchChannelMessages?id=' + channel.id, { withCredentials: true }));
            var messages = reply2.data;
            channel.messages = messages;
            var currentChannels = this.mainClass.state.channels;
            currentChannels.set(channel.id, channel);

            if(channel.members !== undefined) { this.API_fetchUsersForIDs(channel.members); }
            this.API_fetchUsersForMessages(messages)
            this.mainClass.setState({
                channels: currentChannels
            }, () => { console.log("set dm channels"); });
        });
    }

    async API_fetchServers() {
        const reply0 = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchServers', { withCredentials: true }));
        var newServers = reply0.data;
        newServers = new Map(newServers.map(obj => [obj.id, obj]));

        newServers.forEach(async(server) => {
            const reply = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchChannels?id=' + server.id, { withCredentials: true }));
            var newChannels = reply.data;
            newChannels = new Map(newChannels.map(obj => [obj.id, obj]));

            newChannels.forEach(async(channel) => {
                const reply2 = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchChannelMessages?id=' + channel.id, { withCredentials: true }));
                var messages = reply2.data;

                var newChannel = newChannels.get(channel.id)
                newChannel.messages = messages;
                newChannels.set(channel.id, newChannel)

                this.API_fetchUsersForMessages(messages)
                this.mainClass.setState({
                    channels: newChannels
                }, () => { console.log("set server channels"); });
            });

            if(server.members !== undefined) { this.API_fetchUsersForIDs(server.members); }
            this.mainClass.setState({
                servers: newServers
            });
        });
    }
    //#endregion

    //#region Invites
    async API_createInvite(serverID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/createInvite', {
            server: { id: serverID }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }
    //#endregion
}

export { API }