/*global App: false, webkitNotifications: false */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

// ## Overview
// Handles notifying the user of new articles when the application is not running.

App.NotificationsView = Backbone.View.extend({

  // ### initialize
  // Reset the view, add event listeners and setup the view to render every 30 seconds
  initialize: function(){
    var self = this;
    this.clearCounts();

    // Add a handler for the collections add event
    this.collection.on('add', this.add, this);

    // Check to see if we need to display a notification every 30 seconds
    setInterval(function() {
      self.render();
    }, 30000);
  },

  // ### clearCounts
  // Reset the unread article counts
  clearCounts: function(){
    this.unreadArticles       = 0;
    this.previousUnreadCount  = 0;
  },

  // ### add
  // increment the unread article count by 1
  add: function(){
    this.unreadArticles++;
  },

  // ### render
  // Display a notification to the user if required
  render: function(){

    // If background processing is not allowed to run simply return and do nothing
    if(!App.canBackgroundProcess){ return; }

    var self = this;

    // Check if there are unread articles to notify the user about
    if(this.unreadArticles > 0 && this.previousUnreadCount != this.unreadArticles){

      this.previousUnreadCount = this.unreadArticles;

      // If a notification window is already being displayed then close it so only 1
      // is ever displayed to the user
      if(this.notification){ this.close(); }

      // build the notification object
      this.notification = webkitNotifications.createNotification(
        '48.png',
        'You have ' + this.unreadArticles + ' new ' + App.pluralize('article', this.unreadArticles) + ' in the Google News App',
        'Click to launch the app'
      );

      // Handle notification click events
      this.notification.onclick = function(){

        // Reset the unread counts
        self.clearCounts();

        // Launch the application
        chrome.management.launchApp(chrome.i18n.getMessage("@@extension_id"));

        // Close the notification
        self.close();
      };

      // Display the notification window
      this.notification.show();
    }
  },

  // ### close
  // Closes the notification window
  close: function(){
    this.notification.close();
  }
});
