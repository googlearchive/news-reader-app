/*global App: false */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

// ## Overview
// This file is loaded when the background process runs and is used to setup the application.
// The background process handles loading articles when the app is not running and notifying the
// user when new articles have been downloaded.

// ### App.setup.initializeMessageHandlers
// This function sets up the handlers for inter-process communications. When the app is launched
// it sends a message to the background process so it can stop processing the news feeds. The main
// app handles news feed processing when it's running
App.setup.initializeMessageHandlers = function(){

  // ### Temporary message listening code
  // currently there is no event for when the app window is closed so we get the main app to send a message to
  // the background process every 60 seconds telling it to stay paused. There should be an onSuspend event at
  // some point which can be used, we can then tell the background process to resume when the main app window
  // is closed
  chrome.runtime.onSuspend.addListener( function() {
    App.pauseProcessing(90000);
  });
};

// ### App.setup.initializeNotifications
// Handle notification initialization
App.setup.initializeNotifications = function(){
  App.notificationsView = new App.NotificationsView({ collection: App.articles });
};

// Register event handlers
App.dispatcher.on('appLoaded',           App.setup.initializeMessageHandlers );
App.dispatcher.on('articlesInitialized', App.setup.initializeNotifications   );
