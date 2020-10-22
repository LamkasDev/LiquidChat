import React from 'react';

export default class InviteFriendsDialog extends React.Component {
  state = {
    invitationResult: 0
  };

  inviteUser = async (id, userID, type) => {
    let res = -1;
    switch(type) {
      case 0:
        res = await this.props.API.API_addToDMChannel(id, userID);
        break;

      case 1:
        res = await this.props.API.API_createInvite(id);
        if(isNaN(res)) {
          res = await this.props.API.API_sendDM(userID, 'http://nekonetwork.net/invite/' + res.id);
          this.setState({
            invitationResult: res,
          });
        }

        if(isNaN(res)) {
          return true;
        } else {
          this.setState({
            invitationResult: res,
          });
        }
        break;
    }
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  render() {
    let loggedUser = this.props.getUser(this.props.session.userID);
    let server = this.props.getServer(this.props.selectedServer);
    let channel = this.props.getChannel(this.props.selectedChannel);
    let target = channel === undefined || channel.members === undefined ? server : channel;
    let type = channel === undefined || channel.members === undefined ? 1 : 0;

    const friendList = loggedUser.friends.map((friendID, i) => {
    const friend = this.props.getUser(friendID);
      if(friend === undefined) {
        return null;
      }

      return (
        <div key={i} className="friendEntry selectedColor" onContextMenu={(e) => { this.props.setSelectedUser(friend, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }>
          <div className="flex">
            <div className="aligny" style={{ height: 55 }}>
              <img alt="" className="avatar marginleft2" src={this.props.fileEndpoint + "/" + friend.avatar}/>
              <div className="white marginleft2">
                {friend.username}
              </div>
              {
                target.members.includes(friend.id) ?
                  <div className="button inviteButton" style={{ textDecoration: "none", right: 0, color: "#b3b3b3", border: "1px solid #b3b3b3", cursor: "default" }}>Joined!</div>
                : <div className="button inviteButton" style={{ textDecoration: "none", right: 0 }} onClick={(e) => { this.inviteUser(target.id, friend.id, type); e.preventDefault(); } }>Invite</div>
              }
            </div>
          </div>
        </div>
      )
    });

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2 margintop1a">{type === 0 ? "> Add Friends-" : "> Invite Friends-"}</div>
          {friendList}
        </div>
      </div>
    );
  }
}