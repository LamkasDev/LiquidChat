import React from 'react';
import Button from '@material-ui/core/Button';
import { formatDuration } from './public/scripts/DateFormatter';

export class Account extends React.Component {
  render() {
    const user = this.props.getUser(this.props.session.userID)

    return (
      <div className="panel2 headerColor">
        <img className=" marginleft2 avatar" src={this.props.fileEndpoint + "/" + user.avatar} onContextMenu={(e) => { this.props.switchDialogState(4); this.props.setSelectedMessage(undefined, e.pageX, e.pageY); e.preventDefault(); }}/>
        <div className="flex marginleft3">
          <div className="text2" style={{color: "white"}}>Username: {user !== -1 ? user.username : "Loading"}</div>
        </div>
      </div>
    );
  }
}

export class ChannelHeader extends React.Component {
  render() {
    let channel = this.props.channels.get(this.props.currentChannel)
    if(channel === undefined) { return null; }

    let tip = -1;
    switch(channel.type) {
      case 0:
      case 2:
        const messages = channel.messages === undefined ? [] : channel.messages;
        tip = messages.length;
        break;

      case 1:
        tip = this.props.currentVoiceGroup !== -1 ? this.props.currentVoiceGroup.users.length : "Connecting...";
        break;
    }

    return (
      <div className="chatColor fullwidth channelHeader">
        <div className="flex marginleft3">
          <div className="text2" style={{color: "white"}}>#{channel.name} ({tip})</div>
        </div>
      </div>
    );
  }
}

export class ChannelSelector extends React.Component {
  componentDidUpdate() {
    if(this.firstChannel !== this.previousFirstChannel && this.refs.firstChannelElement !== undefined) {
      this.props.setFirstChannel(this.refs.firstChannelElement, this.firstChannel)
    }
  }

  render() {
    let channels = Array.from(this.props.channels.values());
    let voiceGroup = this.props.currentVoiceGroup;
    
    channels = channels.filter(channel => { return ((channel.type === 0 || channel.type === 1) && this.props.channelTypes === 2) || (channel.type === 2 && this.props.channelTypes === 1); })
    const channelList = channels.map((channel, i) => {
      if(i === 0) { this.previousFirstChannel = this.firstChannel; this.firstChannel = channel.id; }

      switch(channel.type) {
        case 1:
          if(voiceGroup !== -1) {
            const userList = voiceGroup.users.map((userID, i) => {
              const user = this.props.getUser(userID)
  
              return (
                <div className="voiceUserEntry flex">
                  <img className="avatar" src={this.props.fileEndpoint + "/" + user.avatar} key={i} onContextMenu={(e) => { this.props.setSelectedUser(user, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }/>
                  <div className="white headerColor">
                    {user.username}
                  </div>
                </div>
              )
            });

            return (
              <div>
                <div className="white headerColor channel" onClick={(e) => { this.props.switchChannel(e.currentTarget, channel.id) }} key={i} ref={i === 0 ? "firstChannelElement" : undefined}>
                  {channel.type === 0 ? "#" : "."}{channel.name}
                </div>
                {userList}
              </div>
            )
          }
      }

      return (
        <div className="white headerColor channel" onClick={(e) => { this.props.switchChannel(e.currentTarget, channel.id) }} key={i} ref={i === 0 ? "firstChannelElement" : undefined}>
          {channel.type === 0 ? "#" : "."}{channel.name}
        </div>
      )
    });

    return (
      <div className="channels headerColor">
        <div className={this.props.channelTypes === 1 ? "white headerColor channel selectedChannelColor" : "white headerColor channel"} onClick={() => { this.props.switchChannelTypes(1) }}>
          DMs
        </div>
        <div className={this.props.channelTypes === 2 ? "white headerColor channel selectedChannelColor" : "white headerColor channel"} onClick={() => { this.props.switchChannelTypes(2) }}>
          Global
        </div>
        <div className="white headerColor channel">
          -
        </div>
        {channelList}
        {voiceGroup !== -1 ? 
          <div className="white headerColor vcInfo selectedChannelColor">
            <div className="button2 alignmiddle chatColor" onClick={(e) => { this.handleEdit(e); }}>
              <p className="white text1">> Disconnect</p>
            </div>
          </div>
        : null}
        <div className="white headerColor channel" onClick={() => { this.props.switchDialogState(1) }}>
          +
        </div>
      </div>
    );
  }
}

export class DialogManager extends React.Component {
  state = {
    copiedID: -1
  };

  copyID = (id) => {
    navigator.clipboard.writeText(id);
    this.setState({
      copiedID: id
    }, () => { this.props.switchDialogState(3); });
  };

  render() {
    switch(this.props.dialogState) {
      case 1:
        return <CreateChannelDialog API={this.props.API} switchDialogState={this.props.switchDialogState} />

      case 2:
        return <MessageOptionsBox API={this.props.API} switchDialogState={this.props.switchDialogState} startEditingMessage={this.props.startEditingMessage}
        boxX={this.props.boxX} boxY={this.props.boxY} selectedMessage={this.props.selectedMessage} session={this.props.session} copyID={this.copyID} fileEndpoint={this.props.fileEndpoint} setEditedMessage={this.props.setEditedMessage}/>

      case 3:
        return <CopiedIDBox switchDialogState={this.props.switchDialogState} boxX={this.props.boxX} boxY={this.props.boxY} copiedID={this.state.copiedID}/>

      case 4:
        return <AccountOptionsBox API={this.props.API} getUser={this.props.getUser} switchDialogState={this.props.switchDialogState} boxX={this.props.boxX} boxY={this.props.boxY} session={this.props.session} copyID={this.copyID} setSelectedUser={this.props.setSelectedUser}/>
        
      case 5:
        return <ProfileBox API={this.props.API} fileEndpoint={this.props.fileEndpoint} switchDialogState={this.props.switchDialogState} session={this.props.session} selectedUser={this.props.selectedUser}/>

      case 6:
        return <ProfileOptionsBox copyID={this.copyID} switchDialogState={this.props.switchDialogState} selectedUser={this.props.selectedUser} boxX={this.props.boxX} boxY={this.props.boxY}/>

      default:
        return null;
    }
  }
}

export class CreateChannelDialog extends React.Component {
  state = {
    channelName: "",
    channelType: 0,
    channelCreationResult: 0
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleChangeType = val => {
    this.setState({
      channelType: val,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    const res = await this.props.API.API_createChannel(this.state.channelName, this.state.channelType);
    this.setState({
      channelCreationResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  getErrorText(code) {
    switch(code) {
      case -1:
        return "Channel name is too short-";

      default:
        return "";
    }
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2 margintop1a">> Create new channel-</div>
          <form onSubmit={this.handleSubmit}>
            <input className="inputfield1 marginleft2" name="channelName" type="text" placeholder="Name..." required={true} onChange={this.handleChange} /><br />
          </form>
          <div className="flex">
            <div className={this.state.channelType === 0 ? "button2 alignmiddle chatColor" : "button2 alignmiddle"} onClick={(e) => { this.handleChangeType(0); }}>
              <p className="white text1">Text</p>
            </div>
            <div className={this.state.channelType === 1 ? "button2 alignmiddle chatColor" : "button2 alignmiddle"} onClick={(e) => { this.handleChangeType(1); }}>
              <p className="white text1">Voice</p>
            </div>
          </div>
          <Button
              variant="contained" 
              color="primary" 
              onClick={this.handleSubmit}
              className="button1" style={{ marginTop: 15, marginLeft: 10 }}>Create!</Button>
              {
                (this.getErrorText(this.state.channelCreationResult).length > 0 ?
                <div className="marginleft2 margintop1 errorColor">
                  {this.getErrorText(this.state.channelCreationResult)}
                </div>
                : "")
              }
        </div>
      </div>
    );
  }
}

export class MessageOptionsBox extends React.Component {
  state = {
    messageDeletionResult: 0
  };

  handleDelete = async e => {
    e.preventDefault();
    const res = await this.props.API.API_deleteMessage(this.props.selectedMessage);
    this.state.setState({
      messageDeletionResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  handleEdit = async e => {
    e.preventDefault();
    const res = 1
    this.props.setEditedMessage(this.props.selectedMessage.text == null ? "" : this.props.selectedMessage.text);
    this.props.startEditingMessage(this.props.selectedMessage);
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: this.props.selectedMessage.author.id === this.props.session.userID ? 90 : 30 }}>
          {
            this.props.selectedMessage.author.id === this.props.session.userID ?
            <div className="button2 alignmiddle chatColor" onClick={(e) => { this.handleDelete(e); }}>
              <p className="white text1">> Delete</p>
            </div> :
            ""
          }
          {
            this.props.selectedMessage.author.id === this.props.session.userID ?
            <div className="button2 alignmiddle chatColor" onClick={(e) => { this.handleEdit(e); }}>
              <p className="white text1">> Edit</p>
            </div> :
            ""
          }
          {
            this.props.selectedMessage.file == null ? "" :
            <div className="button2 alignmiddle chatColor" onClick={(e) => { this.props.copyID(this.props.fileEndpoint + "/" + this.props.selectedMessage.file.name); }}>
              <p className="white text1">> Copy link to file</p>
            </div>
          }
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.copyID(this.props.selectedMessage.id); }}>
            <p className="white text1">> Copy ID</p>
          </div>
        </div>
      </div>
    );
  }
}

export class ProfileOptionsBox extends React.Component {
  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: 30 }}>
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.switchDialogState(5); }}>
            <p className="white text1">> Profile</p>
          </div>
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.copyID(this.props.selectedUser.id); }}>
            <p className="white text1">> Copy ID</p>
          </div>
        </div>
      </div>
    );
  }
}

export class AccountOptionsBox extends React.Component {
  state = {
    avatarChangeResult: 0
  };

  handleAvatar = async e => {
    if(e.target.files.length < 1) { return; }
    
    var file = e.target.files[0];
    e.target.value = ""
    const res = await this.props.API.API_updateAvatar(file)
    this.state.setState({
      avatarChangeResult: res,
    });

    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  render() {
    const user = this.props.getUser(this.props.session.userID)

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: 80 }}>
        <div className="button2 alignmiddle chatColor" onClick={(e) => { this.props.setSelectedUser(user, 0, 0); this.props.switchDialogState(5); }}>
            <p className="white text1">> Profile</p>
          </div>
          <label for="avatar-input">
            <div className="button2 alignmiddle chatColor">
              <p className="white text1">> Change Avatar</p>
            </div>
          </label>
          <input id="avatar-input" className="hide" onChange={this.handleAvatar} type='file' name="fileUploaded"/>
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.copyID(this.props.session.userID); }}>
            <p className="white text1">> Copy ID</p>
          </div>
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.API.API_logout(); }}>
            <p className="white text1">> Logout</p>
          </div>
        </div>
      </div>
    );
  }
}

export class ProfileBox extends React.Component {
  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox3">
            <div className="section chatColor">
              <div className="flex marginleft3 paddingtop3">
                <img className="avatar2" src={this.props.fileEndpoint + "/" + this.props.selectedUser.avatar}/>
                <div>
                  <div className="flex margintop1">
                    <p className="profileTooltipColor text5 marginleft2 margintop0 marginbot0">> Username: </p>
                    <p className="white text5 marginleft1 margintop0 marginbot0">{this.props.selectedUser.username}</p>
                  </div>
                  <div className="flex margintop1">
                    <p className="profileTooltipColor text5 marginleft2 margintop0 marginbot0">> Created: </p>
                    <p className="white text5 marginleft1 margintop0 marginbot0">{formatDuration(this.props.selectedUser.createdAt, Date.now())} ago</p>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  }
}

export class CopiedIDBox extends React.Component {
  componentDidMount() {
    setTimeout(() => { this.props.switchDialogState(-1); }, 3000)
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: 30, width: 180 + (this.props.copiedID.length * 5) }}>
          <div className="button2 alignmiddle chatColor">
            <p className="white text1">Copied {this.props.copiedID}!</p>
          </div>
        </div>
      </div>
    );
  }
}

export default { ChannelHeader, Account, ChannelSelector, CreateChannelDialog };