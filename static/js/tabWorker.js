/* global indexedDB, importScripts, SPA, HTTP, ContactsDB, SPADB,
   CurrentUsers, loadConfig, payloads, Conversation, dump */
/* jshint unused:false */
"use strict";

// XXX: Try to import Backbone only in files that need it (and check
// if multiple imports cause problems).
importScripts(
  '../vendor/backbone-events-standalone-0.1.5.js',
  '/js/payloads.js',
  '/js/http.js',
  '/spa/port.js',
  '/spa/talkilla/js/server.js',
  '/js/worker/users.js',
  '/js/worker/conversation.js',
  '/js/tabWorker/tabWorker.js'
);

var port = new SPAPort();
var server = new Server();
var worker = new TabWorker(port, server);
