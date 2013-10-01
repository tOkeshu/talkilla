/* jshint unused:false */

var TalkillaSPA = (function(globalScope) {
  function TalkillaSPA(server) {
    this.server = server;

    globalScope.onmessage = function(event) {
      switch (event.topic) {
      case "connect":
        this._onConnect(event.data);
        break;
      case "autoconnect":
        this._onAutoconnect(event.data);
        break;
      case "signin":
        this._onSignin(event.data);
        break;
      case "signout":
        this._onSignout(event.data);
        break;
      case "call:offer":
        this._onCallOffer(event.data);
        break;
      case "call:accepted":
        this._onCallAccepted(event.data);
        break;
      case "call:hangup":
        this._onCallHangup(event.data);
        break;
      case "presence:request":
        this._onPresenceRequest(event.data);
        break;
      };
    }.bind(this);

    this.server.on("connected", this._onServerEvent.bind(this, "connected"));
    this.server.on("disconnected",
                   this._onServerEvent.bind(this, "disconnected"));
    this.server.on("message", this._onServerMessage.bind(this));
  }

  TalkillaSPA.prototype = {
    post: function(topic, data) {
      globalScope.postMessage({topic: topic, data: data});
    },

    _onServerEvent: function(type, event) {
      this.post(type, event);
    },

    _onServerMessage: function(type, event) {
      this.post("message", [type, event]);
    },

    _onConnect: function(data) {
      this.server.connect(data.nick);
    },

    _onAutoconnect: function(data) {
      this.server.autoconnect(data.nick);
    },

    _onSignin: function(data) {
      this.server.signin(data.assertion, function(err, response) {
        this.port.post("signin-callback", {err: err, response: response});
      }.bind(this));
    },

    _onSignout: function(data) {
      this.server.signout(data.nick, function(err, response) {
        this.port.post("signout-callback", {err: err, response: response});
      }.bind(this));
    },

    _onCallOffer: function(data) {
      this.server.callOffer(data.data, data.nick, function(err, response) {
        this.port.post("call:offer-callback", {err: err, response: response});
      }.bind(this));
    },

    _onCallAccepted: function(data) {
      this.server.callAccepted(data.data, data.nick, function(err, response) {
        this.port.post("call:accepted-callback",
                       {err: err, response: response});
      }.bind(this));
    },

    _onCallHangup: function(data) {
      this.server.callHangup(data.data, data.nick, function(err, response) {
        this.port.post("call:hangup-callback", {err: err, response: response});
      }.bind(this));
    },

    _onPresenceRequest: function(data) {
      this.server.presenceRequest(data.nick);
    }
  };

  return TalkillaSPA;
}(this));