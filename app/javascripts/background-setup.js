/*global App: false, Filer: false, webkitNotifications: false */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

// ## Overview
// This file is loaded when the background process runs and is used to setup the application.
// The background process handles loading articles when the app is not running and notifying the
// user when new articles have been downloaded.

$(function() {

  // Initialize the settings model
  App.settings = new App.Settings();

  // Fetch settings from the Google sync storage
  App.settings.fetch({
    success: function(){

      // If no categories have been previously stored load the defaults from the json file
      if(!App.settings.get('categories')){
        $.getJSON('javascripts/settings.json', function(data) {

          // Save the categories in the settings model
          App.settings.save({ "categories" : data.defaultCategories });

          // Now we have the settings loaded we can initialize the articles
          App.initializeArticles();
        });
      }else{

        // Settings have been fetched so we can initialize the articles
        App.initializeArticles();
      }
    }
  });
});

// ### App.initializeMessageHandlers
// This function sets up the handlers for inter-process communications. When the app is launched
// it sends a message to the background process so it can stop processing the news feeds. The main
// app handles news feed processing when it's running
App.initializeMessageHandlers = function(){

  // ### Temporary message listening code
  // currently there is no event for when the app window is closed so we get the main app to send a message to
  // the background process every 60 seconds telling it to stay paused. There should be an onSuspend event at
  // some point which can be used, we can then tell the background process to resume when the main app window
  // is closed
  chrome.extension.onMessage.addListener(
    function(message, sender, sendResponse) {
      switch(message){
        case 'pause':
          // Stop processing new articles, but set to automatically resume in 70 seconds
          App.pauseProcessing(90000);
          break;
        case 'appOpened':
          // When the main app is opened clear any unread notification counts as we assume everything is now read
          App.notificationsView.clearCounts();
          break;
      }
  });
};

// ### App.pauseProcessing
// Accepts the `interval` parameter, if passed it will call `App.resumeProcessing()` after the specified amount
// of time.
// This function pauses the processing of the news feeds by setting the `App.canBackgroundProcess` variable to
// `false`. Other classes look at this variable to know if they should run their code.
App.pauseProcessing = function(interval){
  App.canBackgroundProcess = false;
  clearInterval(App.pauseProcessingIntervalId);
  if(interval){
    App.pauseProcessingIntervalId = setTimeout(function(){
      App.resumeProcessing();
    }, interval);
  }
};

// ### App.resumeProcessing
// Simply sets `App.canBackgroundProcess` to `true` so that other classes will know they are allowed to run their code
App.resumeProcessing = function(){
  App.canBackgroundProcess = true;
};

// Call `App.resumeProcessing()` immediately so processes know they can run
App.resumeProcessing();
App.initializeMessageHandlers();

// ### App.initializeArticles
// Handles all initialization to do with the articles collections and model
App.initializeArticles = function(){

  // Initialize filer, this is a wrapper library for the HTML5 Filesystem API
  App.filer = new Filer();
  App.filer.init({persistent: true, size: 1024 * 1024}, function(fs) {
    App.filer.size = 10485760; // set the file size limit to 10 mb

    // Filer is now initialized, the articles collection can be initialized
    App.articles = new App.Articles();

    // Now that the articles collection exists we can initialize notifications
    App.initializeNotifications();

    // Load up articles from storage
    App.articles.fetch({
      success: function(){

        // Tell the articles model to start pulling data from the Google news feeds
        App.articles.startProcessing();
      }
    });
  }, function(e){

    // Log any filer errors to the console for debugging
    console.error('error: ', e);
  });
};

// ### App.initializeNotifications
// Handle notification initialization
App.initializeNotifications = function(){
  App.notificationsView = new App.NotificationsView({ collection: App.articles });
};
