import React from 'react';

export default class EditChannelDialog extends React.Component {
  state = {
    channelName: "",
    channelEditResult: 0
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    const res = await this.props.API.API_editChannel(this.props.selectedChannel.id, this.state.channelName);
    this.setState({
      channelEditResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  getErrorText(code) {
    switch(code) {
      case -2:
        return "You're not this channel's author-";

      case -3:
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
          <div className="white text3 marginleft2 margintop1a">> Edit channel-</div>
          <form onSubmit={this.handleSubmit} className="flex margintop1">
            <input className="inputfield1 marginleft2" name="channelName" type="text" placeholder="Name..." required={true} value={this.state.channelName} onChange={this.handleChange} /><br />
          </form>
          <div className="alignmiddle margintop1" style={{ height: 40 }}>
            <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }} value="vsvsd">Edit!</div>
          </div>
          {
            (this.getErrorText(this.state.channelEditResult).length > 0 ?
            <div className="marginleft2 margintop1 errorColor">
              {this.getErrorText(this.state.channelEditResult)}
            </div>
            : "")
          }
        </div>
      </div>
    );
  }
}