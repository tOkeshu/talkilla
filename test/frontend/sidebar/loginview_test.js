/*global app, chai, sinon */
"use strict";

var expect = chai.expect;

describe("LoginView", function() {
  var sandbox;

  beforeEach(function() {
    // BrowserId "mock"
    window.navigator.id = {
      watch: sinon.spy(),
      request: sinon.spy(),
      logout: sinon.spy()
    };

    sandbox = sinon.sandbox.create();
    $('body').append([
      '<div id="login">',
      '  <p></p>',
      '  <form id="signout" class="hide"></form>',
      '</div>'
    ].join(''));
  });

  afterEach(function() {
    sandbox.restore();
    $('#login').remove();
  });

  describe("#initialize", function() {
    var loginView;

    beforeEach(function() {
      sandbox.stub(app.views.LoginView.prototype, "render");
      loginView = new app.views.LoginView({
        user: new app.models.CurrentUser(),
        spaLoginURL: "http://talkilla/",
        appStatus: new app.models.AppStatus()
      });
    });

    it("should render the view when the user signs in", function() {
      loginView.render.reset();

      loginView.user.trigger("signin");

      sinon.assert.calledOnce(loginView.render);
    });

    it("should render the view when the user signs out", function() {
      loginView.render.reset();

      loginView.user.trigger("signout");

      sinon.assert.calledOnce(loginView.render);
    });

    it("should render the view when the user is cleared", function() {
      loginView.user.set({'username': 'mark', 'presence': 'connected'});

      loginView.render.reset();

      loginView.user.clear();

      sinon.assert.calledOnce(loginView.render);
    });

    it("should render the view when the worker is initialized", function() {
      loginView.render.reset();

      loginView.appStatus.set("workerInitialized", true);

      sinon.assert.calledOnce(loginView.render);
    });
  });

  describe("#render", function() {
    var loginView, user, appStatus;

    beforeEach(function() {
      appStatus = new app.models.AppStatus();
      user = new app.models.CurrentUser();
      loginView = new app.views.LoginView({
        user: user,
        spaLoginURL: "http://talkilla/",
        appStatus: appStatus
      });
    });

    it("should hide signin and signout where the worker is not initialized",
      function() {
        loginView.render();

        expect(loginView.$('#signin').length).to.equal(0);
        expect(loginView.$('#signout').is(':visible')).to.equal(false);
      });

    it("should display signin and hide signout when there is not a username",
      function() {
        appStatus.set("workerInitialized", true);
        loginView.render();

        expect(loginView.$('#signin').length).to.equal(1);
        expect(loginView.$('#signin').is(':visible')).to.equal(true);
        expect(loginView.$('#signout').is(':visible')).to.equal(false);
      });

    it("should only ever display one sign-in iframe at a time", function() {
      appStatus.set("workerInitialized", true);
      loginView.render();
      loginView.render();

      expect(loginView.$('iframe').length).to.equal(1);
    });

    it("should hide signin and display signout when there is not a username",
      function() {
        appStatus.set("workerInitialized", true);
        user.set("username", "james");
        loginView.render();

        expect(loginView.$('#signin').is(':visible')).to.equal(false);
        expect(loginView.$('#signout').is(':visible')).to.equal(true);
      });

    it("should render the link-share view", function() {
      sandbox.stub(loginView._linkShareView, "render");

      loginView.render();

      sinon.assert.calledOnce(loginView._linkShareView.render);
      sinon.assert.calledWithExactly(loginView._linkShareView.render);
    });
  });

  describe("signing in and out", function() {
    var loginView;
    var clickEvent = {preventDefault: function() {}};

    beforeEach(function() {
      window.sidebarApp = {
        login: sandbox.spy(),
        logout: sandbox.spy()
      };
      loginView = new app.views.LoginView({
        user: new app.models.CurrentUser(),
        spaLoginURL: "http://talkilla/",
        appStatus: new app.models.AppStatus()
      });
    });

    afterEach(function() {
      window.sidebarApp = undefined;
    });

    describe("#signout", function() {

      it("should call sign out on the user model", function() {
        sandbox.stub(loginView.user, "signout");

        loginView.signout(clickEvent);

        sinon.assert.calledOnce(loginView.user.signout);
      });

    });
  });
});
