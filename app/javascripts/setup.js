/*global App: false, Filer: false */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// Chris Garrett <http://abstraktion.co.uk>
// ### Last changed
// 2012-06-23

// ## Overview
// This file sets up the backbone application and initializes all classes required for the application
// to run, this includes loading initial data where required.

$(function() {
  // ### Initialize settings

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

        // Settings have been fetched so we can initialize the articles and settings view
        App.initializeArticles();
        App.initializeSettingsView();

        // Initialize categories list
        new App.CategoriesListView();
      });
    }
  });

  // Send a message to the background process to stop working every 60 seconds currently there
  // is no event for when the app window is closed so we get the main app to send a message to
  // the background process every 60 seconds telling it to stay paused. There should be an
  // onSuspend event at some point which can be used instead of this code
  chrome.extension.sendMessage('pause');
  setInterval(function() {
    chrome.extension.sendMessage('pause');
  }, 60000);

  // Send a message to the background app to say the main app has been opened
  chrome.extension.sendMessage('appOpened');

});

// This setting is used to control the background processing of feeds
App.canBackgroundProcess = true;

App.initializeSettingsView = function(){ new App.SettingsView(); };

App.initialize_window_view = function(){ new App.WindowView(); };

// ### App.restoreState
// Restore the state of the application on load, settings are loaded from the
App.restoreState = function(){
  // Restore the state of an open article if needed
  var articleId = App.settings.get('openArticleId');
  if(articleId !== ""){

    // Load the article from storage
    var article = App.articles.get(articleId);

    if(article){
      // If the article is found restore the viewing state using the article view
      var articleView = new App.ArticleView({ model: article });
      articleView.openLink();
    }else{
      // If the article can't be found remove the setting from storage
      App.settings.saveOpenArticleId('');
    }
  }
};

// ### App.initializeArticles
// Handles all initialization to do with the articles collections and model
App.initializeArticles = function(){
  // initialize filer
  App.filer = new Filer();
  App.filer.init({persistent: true, size: 1024 * 1024}, function(fs) {
    App.filer.size = 10485760; // set the file size limit to 10 mb

    // The Articles collection keeps track of all known articles
    App.articles = new App.Articles();

    // The DisplayedArticles collection stores only the articles displayed on the screen
    App.displayedArticles = new App.DisplayedArticles();

    // Initialize the articles view and pass it the DisplayedArticles collection
    App.articles_view = new App.ArticlesView({ collection: App.displayedArticles });

    // Fetch articles to display
    App.displayedArticles.load();

    App.articles.fetch({
      success: function(){

        // Load new articles from the feed on initialization
        App.articles.getFromFeed(App.googleFeed);

        // Load new articles every minute
        setInterval(function() {
          App.articles.getFromFeed(App.googleFeed);
        }, 60000);

        // Restore the applications state once the articles have been loaded
        App.restoreState();
      }
    });

    // Search initialization
    App.searchResults = new App.SearchResults();
    new App.SearchResultsView({ collection: App.searchResults });
    new App.SearchView();


  }, function(e){
    console.warn('error: ', e);
  });

  new App.CloseBrowserView();
};

App.initialize_window_view();
