/*global App: false, news_browser: false */

// ### Authors
// Chris Garrett <http://abstraktion.co.uk>
// ### Last changed
// 2012-06-26

// ## Overview
// Intents allow for the standardisation of social interactions at the platform level

// ### App.IntentView
// handles user intent actions
App.IntentView = Backbone.View.extend({
  initialize: function(){ this.setElement(".intent_trigger"); },
  events: { click: "triggerIntent" },
  // ### triggerIntent
  // Fired on click of UI element
  triggerIntent: function(){
    // Which action has the user selected?
    var action = ($(this).hasClass("share_trigger")) ? "share" : "save";
    
    // Create new intent object
    // Using the href set on the link as the source
    var intent = new WebKitIntent("http://webintents.org/" + action, "text/uri-list", $(this).attr("href"));

    // Start the intent
    window.navigator.webkitStartActivity(intent);
    
    // Prevent the link from following
    return false;
  }
});