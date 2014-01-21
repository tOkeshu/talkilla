var TabWorker = (function() {
  function TabWorker(port, server) {
    var users = new CurrentUsers();
    users.set("tOkeshu@monkeypatch.me", {
      username: "tOkeshu@monkeypatch.me",
      presence: "connected"
    });

    this.port = port;
    this.server = server;
    this.conversation = new Conversation({
      capabilities: ["call"],
      peer: users.get("tOkeshu@monkeypatch.me"),
      browserPort: {postEvent: function() {}},
      users: users,
      user: {name: "foo"}
    });

    this.port.on("talkilla.chat-window-ready", this._onChatWindowReady, this);
    this.port.on("talkilla.call-offer", this._onCallOffer, this);
    this.port.on("talkilla.call-answer", this._onCallAnswer, this);
    this.port.on("talkilla.call-hangup", this._onCallHangup, this);
    this.port.on("talkilla.ice-candidate", this._onIceCandidate, this);

    this.server.on("message", this._onServerMessage, this);

    this.server.connect();
  }

  TabWorker.prototype = {
    _onChatWindowReady: function() {
      this.conversation.windowOpened(this.port);
      this.conversation.startCall();
    },

    _onCallOffer: function(offerData) {
      var offerMsg = new payloads.Offer(offerData);
      this.server.callOffer(offerMsg);
    },

    _onCallAnswer: function(answerData) {
      var answerMsg = new payloads.Answer(answerData);
      this.server.callAccepted(answerMsg);
    },

    _onCallHangup: function(hangupData) {
      var hangupMsg = new payloads.Hangup(hangupData);
      this.server.callHangup(hangupMsg);
    },

    _onIceCandidate: function(iceCandidateData) {
      var iceCandidateMsg = new payloads.IceCandidate(iceCandidateData);
      this.server.iceCandidate(iceCandidateMsg);
    },

    _onServerMessage: function(type, event) {
      if (type === "offer")
        this.conversation.handleIncomingCall(new payloads.Offer(event));
      else if (type === "answer")
        this.conversation.callAccepted(new payloads.Answer(event));
      else if (type === "hangup")
        this.conversation.callHangup(new payloads.Hangup(event));
      else if (type === "ice:candidate")
        this.currentConversation
          .iceCandidate(new payloads.IceCandidate(event));
      else
        this.port.post(type, event);
    }

  };

  return TabWorker
}())