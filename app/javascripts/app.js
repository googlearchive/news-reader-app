// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

// ## Overview
// Setup the applications namespace. Also includes the pluralize helper function that is
// available to the entire application.

window.App = {

  // The perPage setting tells the applications how many articles to display per page
  perPage: 100,

  dispatcher: _.clone(Backbone.Events),

  // ### pluralize
  // Accepts a singular word and a count
  // Helper function that wraps the inflection library's `pluralize` function for ease of use.
  // Usage `App.pluralize('article', 1)` will return 'article', `App.pluralize('article', 5)`
  // will return 'articles'
  pluralize: function(singular, count) {
    if (count == 1) {
      return singular;
    } else {
      return singular.pluralize();
    }
  },

  // ### pauseProcessing
  // Accepts the `interval` parameter, if passed it will call `App.resumeProcessing()` after the specified amount
  // of time.
  // This function pauses the processing of the news feeds by setting the `App.canBackgroundProcess` variable to
  // `false`. Other classes look at this variable to know if they should run their code.
  pauseProcessing: function(interval){
    var self = this;
    this.canBackgroundProcess = false;
    clearInterval(this.pauseProcessingIntervalId);
    if(interval){
      this.pauseProcessingIntervalId = setTimeout(function(){
        self.resumeProcessing();
      }, interval);
    }
  },

  // ### App.resumeProcessing
  // Simply sets `App.canBackgroundProcess` to `true` so that other classes will know they are allowed to run their code
  resumeProcessing: function(){
    this.canBackgroundProcess = true;
  }

};
