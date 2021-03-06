/* jshint expr:true */
"use strict";

process.env.NO_LOCAL_CONFIG = true;
process.env.PORT = 3000;
var PORT = 3000;

var chai = require("chai");
var expect = chai.expect;
var path = require("path");
var sinon = require("sinon");

chai.Assertion.includeStack = true;

var api = require("../../server/server").api;
var middlewares = require("../../server/server").middlewares;
var merge = require("../../server/config").merge;
var config = require("../../server/config");

describe("Server", function() {

  describe("general configuration functions", function() {

    it("should merge two configuration objects", function() {
      expect(merge({}, {})).to.deep.equal({});
      expect(merge({}, {b: 2})).to.deep.equal({b: 2});
      expect(merge({a: 1}, {})).to.deep.equal({a: 1});
      expect(merge({a: 1}, {b: 2})).to.deep.equal({a: 1, b: 2});
      expect(merge({a: 1}, {a: 2})).to.deep.equal({a: 2});
    });

    describe("#getConfigFromFile", function() {
      var testConfigRoot = path.join('..', 'test', 'data');
      var publicUrl = 'https://example.com';
      // This should match public url, save for the scheme

      afterEach(function() {
        delete process.env.PUBLIC_URL;
      });

      it("getConfigFromFile should parse a JSON configuration file and " +
         "return an object", function() {
        // Use the test configurations
        var testConfig = config.getConfigFromFile(path.join(testConfigRoot,
                                                            'test1.json'));
        expect(testConfig).to.have.property('DEBUG');
        expect(testConfig.DEBUG).to.be.ok;

        testConfig = config.getConfigFromFile(path.join(testConfigRoot,
                                                        'test2.json'));
        expect(testConfig).to.have.property('DEBUG');
        expect(testConfig.DEBUG).to.be.not.ok;
      });

      it("should default to localhost", function() {
        var testConfig =
          config.getConfigFromFile(path.join(testConfigRoot,
                                             'test3.json'), PORT);

        expect(testConfig).to.have.property('ROOTURL');
        expect(testConfig.ROOTURL).to.be.equal('http://localhost:' + PORT);
      });

      it("should use the public url from the environment if defined",
        function() {
          process.env.PUBLIC_URL = publicUrl;

          var testConfig =
            config.getConfigFromFile(path.join(testConfigRoot,
                                               'test3.json'), PORT);

          expect(testConfig).to.have.property('ROOTURL');
          expect(testConfig.ROOTURL).to.be.equal(publicUrl);
        });

      it("should use the root url from the configuration if defined",
        function() {
          var testConfig =
            config.getConfigFromFile(path.join(testConfigRoot,
                                               'test4.json'), PORT);

          expect(testConfig).to.have.property('ROOTURL');
          expect(testConfig.ROOTURL).to.be.equal('http://example2.com');
        });
    });
  });

  describe("api", function() {
    var sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    describe("#config", function() {

      it("should return the config in a js file", function() {
        var req = {};
        var res = {header: sinon.spy(), send: sinon.spy()};
        api.config(req, res);

        sinon.assert.calledOnce(res.header);
        sinon.assert.calledWithExactly(
          res.header, "Content-Type", "application/javascript");
        sinon.assert.calledOnce(res.send);
        sinon.assert.calledWithExactly(res.send, 200,
                                       'function loadConfig() { return ' +
                                       JSON.stringify(config.config) +
                                       '; }');
      });

    });

  });

  describe("middlewares", function(){
    var sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    describe("#trustProxy", function() {
      it("should trust secure proxy when using SSL", function() {
        var req = {secure: true, connection: {}};
        var resp = {};
        var next = sinon.spy();
        middlewares.trustProxy(true)(req, resp, next);

        expect(req.connection.proxySecure).to.be.equal(true);
        sinon.assert.calledOnce(next);
      });

      it("should trust unsecure proxy when using SSL", function() {
        var req = {secure: false, connection: {}};
        var resp = {};
        var next = sinon.spy();
        middlewares.trustProxy(true)(req, resp, next);

        expect(req.connection.proxySecure).to.be.equal(false);
        sinon.assert.calledOnce(next);
      });

      it("should not set connection.proxySecure when no SSL", function() {
        var req = {secure: true, connection: {}};
        var resp = {};
        var next = sinon.spy();
        middlewares.trustProxy(false)(req, resp, next);

        expect(req.connection).not.to.have.property('proxySecure');
        sinon.assert.calledOnce(next);
      });
    });
  });
});
