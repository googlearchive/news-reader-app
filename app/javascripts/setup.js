/*global App: false, Filer: false */

// ## Overview
// This file sets up the backbone application and initializes all classes required for the application
// to run, this includes loading initial data where required.

// Call `App.resumeProcessing()` immediately so processes know they can run
App.resumeProcessing();

// Create a setup object for all the setup code
App.setup = {};

// ### App.setup.initializeAndLoadSettings
// Initializes the settings model and loads the settings data either from Google sync
// storage or from settings files
App.setup.initializeAndLoadSettings = function(){

  // Create a new settings model
  App.settings = new App.Settings();

  // Fetch the settings from the sync storage
  App.settings.fetch({
    success: function(){

      $.getJSON('javascripts/settings.json', function(data) {

        // Store the default list of categories so it can be used throughout the application
        App.defaultCategories   = data.defaultCategories;

        // Store the languages supported by the application
        App.supportedLanguages  = data.languages;

        // If no categories have been previously stored set the default categories
        if(!App.settings.get('categories')){
          // Save the categories in the settings model
          App.settings.save({ "categories" : App.defaultCategories });
        }

        // If not feed language has been set create one
        if(!App.settings.get('feedLanguage')){
          App.settings.save({
            "feedLanguage" : {
              "code": chrome.i18n.getMessage("languageCode"),
              "name": chrome.i18n.getMessage("nation")
          }});
        }

        App.dispatcher.trigger('settingsLoaded');
      });
    }
  });
};

// ### App.setup.initializeArticles
// Handles all initialization to do with the articles collections and model
App.setup.initializeArticles = function(){

  // Filer is now initialized, the articles collection can be initialized
  App.articles = new App.Articles();

  // Trigger the `articlesInitialized` event
  App.dispatcher.trigger('articlesInitialized');

  // Load articles from storage
  App.articles.fetch({
    success: function(){

      // Tell the articles model to start pulling data from the Google news feeds
      App.articles.startProcessing();

      // Trigger the `articlesLoaded` event
      App.dispatcher.trigger('articlesLoaded');
    }
  });
};

// Trigger the `appLoaded` event when everything is loaded
$(function() {
  RAL.debug = true;
  RAL.Queue.start();
  App.dispatcher.trigger('appLoaded');
});

// Register event handlers
App.dispatcher.on('appLoaded',      App.setup.initializeAndLoadSettings );
App.dispatcher.on('settingsLoaded', App.setup.initializeArticles        );
