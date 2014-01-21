/**
 * Social API Worker Port wrapper & message events listener/dispatcher.
 */
(function(exports, Backbone, _) {
  "use strict";

  function AppPort() {
    if (navigator.mozSocial)
      this._port = navigator.mozSocial.getWorker().port;
    else
      this._port = new Worker("/js/tabWorker.js");

    this._port.onmessage = function(event) {
      this.trigger(event.data.topic, event.data.data);
    }.bind(this);
  }
  exports.AppPort = AppPort;

  AppPort.prototype.post = function(topic, data) {
    this._port.postMessage({topic: topic, data: data});
  };

  _.extend(AppPort.prototype, Backbone.Events);
})(this, Backbone, _);
