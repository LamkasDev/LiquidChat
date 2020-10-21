import React from 'react';
import { List } from 'react-movable';

export default class ChannelSelector extends React.Component {
  componentDidUpdate() {
    if(this.firstChannel !== this.previousFirstChannel && this.refs.firstChannelElement !== undefined) {
      this.props.setFirstChannel(this.refs.firstChannelElement, this.firstChannel)
    }
  }

  acceptFriendRequest(id) {
    this.props.API.API_acceptFriendRequest(id);
  }

  declineFriendRequest(id) {
    this.props.API.API_declineFriendRequest(id);
  }

  render() {
    let channels = Array.from(this.props.channels.values());
    let friendRequests = Array.from(this.props.friendRequests.values());
    let voiceGroup = this.props.currentVoiceGroup;
    let loggedUser = this.props.getUser(this.props.session.userID);
    channels = channels.filter(channel => { return ((channel.type === 0 || channel.type === 1) && this.props.channelTypes === 2 && channel.server.id === this.props.selectedServer) || (channel.type === 2 && this.props.channelTypes === 1); })
    channels = channels.sort((a, b) => a.position - b.position)

    const friendRequestsList = friendRequests.map((friendRequest, i) => {
      const author = this.props.getUser(friendRequest.author.id)
      const target = this.props.getUser(friendRequest.target.id)
      if(author === undefined || target === undefined) { return null; }
      var user = author.id === loggedUser.id ? target : author;

      return (
        <div key={i} className="friendRequestEntry selectedColor" style={{ height: author.id === this.props.session.userID ? 117 : 81}}>
          <div className="flex">
            <img alt="" className="avatar marginleft2 margintop1" src={this.props.fileEndpoint + "/" + user.avatar} onContextMenu={(e) => { this.props.setSelectedUser(user, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }/>
            <div className="white marginleft2 margintop1b">
              {user.username}
            </div>
          </div>
          {author.id === this.props.session.userID ? 
          <div>
            <div className="flex">
              <div className="white channel pendingColor">
                Pending
              </div>
            </div>
            <div className="flex">
            <div className="white channel declineColor" onClick={() => { this.declineFriendRequest(friendRequest.id); }}>
                Cancel
              </div>
            </div>
          </div>
          :
          <div className="flex">
            <div className="white channel acceptColor" onClick={() => { this.acceptFriendRequest(friendRequest.id); }}>
              Accept
            </div>
            <div className="white channel declineColor" onClick={() => { this.declineFriendRequest(friendRequest.id); }}>
              Decline
            </div>
          </div>}
        </div>
      )
    });

    const friendList = loggedUser.friends.map((friendID, i) => {
      const friend = this.props.getUser(friendID);
      if(friend === undefined) {
        return null;
      }

      return (
        <div key={i} className="friendEntry selectedColor" style={{ marginBottom: (i === 0 ? 2 : 1) }} onContextMenu={(e) => { this.props.setSelectedUser(friend, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }>
          <div className="aligny fullheight">
            <img alt="" className="avatar marginleft2" src={this.props.fileEndpoint + "/" + friend.avatar}/>
            <div className="white marginleft2">
              {friend.username}
            </div>
          </div>
        </div>
      )
    });

    const serverList = Array.from(this.props.getOwnServers().values()).map((server, i) => {
      let serverName = server.name.length < 12 ? server.name : server.name.substring(0, 9) + "..."
      return (
        <div key={i}>
          <div className={this.props.selectedServer === server.id ? "white headerColor server selectedColor" : "white headerColor server"} onClick={() => { this.props.setSelectedServer(server.id); }} onContextMenu={(e) => { this.props.setSelectedServer(server.id); this.props.setBox(e.pageX, e.pageY); this.props.switchDialogState(17); e.preventDefault(); e.stopPropagation(); } }>
            <img alt="" className="avatar4 marginright2" src={this.props.fileEndpoint + "/" + server.avatar}/>
            <div className="white text8">
              {serverName}
            </div>
          </div>
        </div>
      )
    });

    let voiceGroupChannel = voiceGroup !== -1 ? this.props.getChannel(voiceGroup.id) : undefined;
    let voiceGroupServer = voiceGroupChannel !== undefined ? this.props.getServer(voiceGroupChannel.server.id) : undefined;

    return (
      <div className="flex">
        <div className="servers headerColor" style={{ height: this.props.pageHeight - 78 - this.props.pageHeightOffset }}>
          <div className={this.props.channelTypes === 3 ? "white headerColor server2 selectedColor" : "white headerColor server2"} onClick={() => { this.props.switchChannelTypes(3) }}>
            Friends
          </div>
          <div className={this.props.channelTypes === 1 ? "white headerColor server2 selectedColor" : "white headerColor server2"} onClick={() => { this.props.switchChannelTypes(1) }}>
            DMs
          </div>
          {serverList}
          <div className="white headerColor server2" onClick={() => { this.props.switchDialogState(16) }}>
            + Server
          </div>
        </div>
        {this.props.channelTypes === 1 || this.props.channelTypes === 2 ?
        <div>
          <div className="channels headerColor" style={{ height: this.props.pageHeight - 78 - this.props.pageHeightOffset - (voiceGroup !== -1 ? 78 : 0) }}>
            <List
            onChange={({ oldIndex, newIndex }) =>
              this.props.moveChannel(channels, oldIndex, newIndex)
            }
            values={channels}
            beforeDrag={({ index }) =>
              this.props.switchChannel(channels[index].id)
            }
            renderList={({ children, props }) => <div {...props}>{children}</div>}
            renderItem={({ value, index, props }) => {
              if(index === 0) { this.previousFirstChannel = this.firstChannel; this.firstChannel = value.id; }
              let channelName = value.name.length < 12 ? value.name : value.name.substring(0, 9) + "..."

              switch(value.type) {
                case 1:
                  let userList = null;
                  if(voiceGroup !== -1 && voiceGroupChannel !== undefined && voiceGroupChannel.id === value.id) {
                    userList = voiceGroup.users.map((userID, i) => {
                      const user = this.props.getUser(userID)
          
                      return (
                        <div key={i} className="voiceUserEntry aligny">
                          <img alt="" className="avatar marginleft1" src={this.props.fileEndpoint + "/" + user.avatar} onContextMenu={(e) => { this.props.setSelectedUser(user, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }/>
                          <div className="white headerColor marginleft2">
                            {user.username}
                          </div>
                        </div>
                      )
                    });
                  }

                  return (
                    <div key={index}>
                      <div {...props} className="white headerColor channel" style={{ backgroundColor: (voiceGroup !== -1 && voiceGroupChannel.id === value.id ? "#67b167" : "var(--color4)") }} onContextMenu={(e) => { this.props.setSelectedChannel(value.id); this.props.setBox(e.pageX, e.pageY); this.props.switchDialogState(10); e.preventDefault(); e.stopPropagation(); } }>
                        .{channelName}
                      </div>
                      {userList}
                    </div>
                  )
              }

              return (
                <div {...props} key={index} className={this.props.currentChannel === value.id ? "white headerColor channel selectedColor" : "white headerColor channel"} onContextMenu={(e) => { this.props.setSelectedChannel(value.id); this.props.setBox(e.pageX, e.pageY); this.props.switchDialogState(10); e.preventDefault(); e.stopPropagation(); } }>
                  #{channelName}
                </div>
              )
              }}>
            </List>
            {this.props.channelTypes === 2 ?
              <div className="white headerColor channel" onClick={() => { this.props.switchDialogState(1) }}>
              + Channel
              </div>
            : null}
          </div>
          {
            voiceGroup !== -1 && voiceGroupChannel !== undefined ?
            <div className="white chatColor vcInfo">
              <div className="white chatColor vcInfo2 prspace">
                <div className="flex vcInfo3 aligny">
                  <p className="white text1 margin0 marginleft2">Connected to </p>
                  <p className="tooltipColor text1 margin0">.{voiceGroupChannel.name}</p>
                </div>
                {
                  voiceGroupServer !== undefined ?
                  <div className="flex vcInfo3 aligny">
                    <p className="white text1 margin0 marginleft2">in </p>
                    <p className="tooltipColor text1 margin0">{voiceGroupServer.name}</p>
                  </div> :
                  <div className="flex vcInfo3 aligny">
                    <p className="white text1 margin0 marginleft2">??</p>
                  </div>
                }
              </div>
              <div className="white chatColor channel alignmiddle" onClick={() => { this.props.API.API_leaveVoiceChannel(voiceGroupChannel); }}>
                <p className="white declineColor text1">> Disconnect</p>
              </div>
            </div> : null
          }
          </div>
        :
        <div className="channels headerColor" style={{ height: this.props.pageHeight - 78 - this.props.pageHeightOffset }}>
          {friendList}
          {friendRequestsList}
          <div className="white headerColor channel" onClick={() => { this.props.switchDialogState(7) }}>
            Add Friend
          </div>
        </div>}
        <div className="accountSettings chatColor aligny">
            <div className="account">
              <img alt="" className="marginleft2 avatar pointer" src={this.props.fileEndpoint + "/" + loggedUser.avatar} onContextMenu={(e) => { this.props.switchDialogState(4); this.props.setBox(e.pageX, e.pageY); e.preventDefault(); }} onClick={(e) => { this.props.switchDialogState(22); this.props.setBox(e.pageX, e.pageY); e.preventDefault(); }}/>
              <div className="flex marginleft2">
                <div className="text2" style={{color: "white"}}>{loggedUser !== undefined ? loggedUser.username : "Loading"}</div>
              </div>
            </div>
            <div className="button settingsButton marginleft2" style={{ width: 28, height: 28, position: "relative", transform: "scale(0.85)" }} onClick={() => { this.props.switchDialogState(13) }}>
              <svg aria-hidden="false" width="28" height="28" viewBox="0 0 24 24"><path fill="currentColor" d="M19.738 10H22V14H19.739C19.498 14.931 19.1 15.798 18.565 16.564L20 18L18 20L16.565 18.564C15.797 19.099 14.932 19.498 14 19.738V22H10V19.738C9.069 19.498 8.203 19.099 7.436 18.564L6 20L4 18L5.436 16.564C4.901 15.799 4.502 14.932 4.262 14H2V10H4.262C4.502 9.068 4.9 8.202 5.436 7.436L4 6L6 4L7.436 5.436C8.202 4.9 9.068 4.502 10 4.262V2H14V4.261C14.932 4.502 15.797 4.9 16.565 5.435L18 3.999L20 5.999L18.564 7.436C19.099 8.202 19.498 9.069 19.738 10ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"></path></svg>
            </div>
        </div>
      </div>
    );
  }
}