/*global App: false */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// Chris Garrett <http://abstraktion.co.uk>
// ### Last changed
// 2012-06-23

// ## Overview
// This file is loaded when teh foreground application runs and sets up the backbone application and initializes all classes required for the application
// to run, this includes loading initial data where required.

// ### App.setup.initializeMessaging
// Send a message to the background process to stop working every 60 seconds currently there
// is no event for when the app window is closed so we get the main app to send a message to
// the background process every 60 seconds telling it to stay paused. There should be an
// onSuspend event at some point which can be used instead of this code

App.setup.initializeMessaging = function(){
  chrome.runtime.onSuspend.addListener( function() {
    App.pauseProcessing(90000);
  });
};

// ### view initalization functions
App.setup.initializeSettingsView        = function(){ new App.SettingsView();                             };
App.setup.initializeWindowView          = function(){ new App.WindowView(); 
                                                      new App.CloseWindowView();
                                                      new App.FullScreenView();                           };
App.setup.initializeCategoriesListView  = function(){ new App.CategoriesListView();                       };
App.setup.initializeCloseBrowserView    = function(){ new App.CloseBrowserView();                         };

// ### App.setup.initializeAndLoadDisplayedArticles
// Initialises the `DisplayedArticles` collection and then loads records into memory
App.setup.initializeAndLoadDisplayedArticles = function(){
  // The DisplayedArticles collection stores only the articles displayed on the screen
  App.displayedArticles = new App.DisplayedArticles();

  // Initialize the articles view and pass it the DisplayedArticles collection
  App.articles_view = new App.ArticlesView({ collection: App.displayedArticles });

  // Fetch articles to display
  App.displayedArticles.load();
};

// ### App.setup.initializeSearch
// Initialize the search collections and views
App.setup.initializeSearch = function(){
  // Search initialization
  App.searchResults = new App.SearchResults();
  new App.SearchResultsView({ collection: App.searchResults });
  new App.SearchView();
};

// ### App.setup.restoreState
// Restore the state of the application on load, settings are loaded from the
App.setup.restoreState = function(){
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

// Register event handlers
App.dispatcher.on('appLoaded',       App.setup.initializeMessaging               );
App.dispatcher.on('appLoaded',       App.setup.initializeWindowView              );
App.dispatcher.on('appLoaded',       App.setup.initializeSearch                  );
App.dispatcher.on('appLoaded',       App.setup.initializeCloseBrowserView        );
App.dispatcher.on('settingsLoaded',  App.setup.initializeSettingsView            );
App.dispatcher.on('settingsLoaded',  App.setup.initializeCategoriesListView      );
App.dispatcher.on('articlesLoaded',  App.setup.initializeAndLoadDisplayedArticles);
App.dispatcher.on('articlesLoaded',  App.setup.restoreState                      );

