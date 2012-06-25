/*global App */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

// ## Overview
// The article model and collection are responsible for requesting, processing, and storing articles
// in an indexedDB database. Associated images are stored in the HTML5 Filesystem so they can be used
// offline.

// ### App.articlesDatabase
// This object stores the configuration options for the indexedDB backbone adapter
App.articlesDatabase = {

  // This ID and description of the database
  id: "google-news-database",
  description: "News articles",

  // Migrations to run in order to create the database
  migrations : [{
    version: 1,
    migrate: function (transaction, next) {
      var store = transaction.db.createObjectStore("articles");

      // Add an index on categoryEnglish
      store.createIndex("categoryEnglish", "categoryEnglish", { unique: false });

      // Add an index on updatedTime
      store.createIndex("updatedTime", "updatedTime", { unique: false });
      next();
    }
  }]
};

// ### App.Article
// Setup the article backbone model, this doesn't need to do much apart from clean up stored
// image files when a record is destroyed.
App.Article = Backbone.Model.extend({

  // Let the model know we are using the indexedDB database defined in `App.articlesDatabase`
  database:   App.articlesDatabase,
  storeName:  "articles",

  // ### initialize
  // Setup a handler to listen for when a record is destroyed.
  initialize: function(){
    this.on('destroy', this.destroyFile, this);
  },

  // ### destroyFile(article)
  // When the record is destroyed remove the image from the HTML5 Filesystem.
  destroyFile: function(article){
    App.filer.rm(article.get('image'), function(){});
  }
});

// ### App.Articles
// Setup the articles backbone collection that manages all articles.
App.Articles = Backbone.Collection.extend({
  database:   App.articlesDatabase,
  storeName:  "articles",
  model:      App.Article,

  // ### initialize
  // Setup handlers for events that are raised by the collection, these are used when
  // processing new articles.
  initialize: function(){
    this.on('articleGrabbedWithImage',  this.storeImage,  this);
    this.on('articleGrabbed',           this.saveItem,    this);
    this.on('imageGrabbed',             this.saveItem,    this);
  },

  // ### comparator(article)
  // Sort articles by the updatedTime field so that newest articles are first
  comparator: function(article) {
    return -article.get('updatedTime');
  },

  // ### startProcessing(interval)
  // Accepts an optional interval parameter for how often to process feeds. if omitted
  // the default of 60 seconds will be used
  // Called when we want the collection to start loading and processing articles.
  startProcessing: function(interval){
    var self = this;

    // Call `getFromFeed` immediately so new articles are pulled down straight away.
    this.getFromFeed(App.googleFeed);

    // Set the default interval to 60 seconds if the parameter is omitted.
    if(!interval){ interval = 60000; }

    // Clear any old intervals so we never have two processes running at the same time.
    if(this.intervalId){
      clearInterval(this.intervalId);
    }

    // Setup the interval can store it so it can be cleared later
    this.intervalId = setInterval(function() {
      self.getFromFeed(App.googleFeed);
    }, interval);
  },

  // ### getFromFeed(feed, category)
  // Accepts a feed object parameter and an optional category string
  getFromFeed: function(feed, category){

    // If background processing is not allowed to run simply return and do nothing
    if(!App.canBackgroundProcess){ return; }
    var self = this;

    // If the category parameter is not present load the list of categories from the settings model.
    var categories = category !== undefined ? [category] : App.settings.get('categories');

    // Get the language to use from the settings model.
    var language = App.settings.get('feedLanguage');

    // Iterate through each category and load it's RSS feed.
    _.each(categories, function(category){

      // Get the uri from the feed object passed in as a parameter.
      var feedUri = feed.uri({ 'category': category, 'language': language.code });
      console.log('getting news from: ' + feedUri);

      // Use the jFeed plugin to get and parse the feed for us.
      jQuery.getFeed({
        url: feedUri,
        success: function(result) {

          // Iterate through each item in the feed
          $.each(result.items, function(i, item){

            // parse the feed using the supplied feed parser object
            var parsedItem = feed.parseItem(item);

            // Save the English category name so we can use it pragmatically
            parsedItem.categoryEnglish = category;

            // instead of storing "nation" store the real country name
            if(category == "nation"){
              parsedItem.category = App.settings.get('feedLanguage').name;
            }

            // Only store the image and save the article if it not already in the database
            if(!self.get(item.id)){

              if(parsedItem.image){

                // If we were able to extract an image from the item raise the `articleGrabbedWithImage` event
                self.trigger('articleGrabbedWithImage', parsedItem);
              }else{

                // Otherwise raise the `articleGrabbed` event
                self.trigger('articleGrabbed', parsedItem);
              }
            }
          });
        }
      });
    });
  },

  // ### saveItem(item)
  // Accepts and item object
  // Saves the item in as an article record and adds it to this collection
  saveItem: function(item){
    var article = new App.Article(item);
    article.save();
    this.add(article);
  },

  // ### storeImage(item)
  // Accepts an item object
  // Grabs the remote image for the article and saves it to the HTML5 Filesystem usinf filer.js
  storeImage: function(item, callback){
    var xhr = new XMLHttpRequest();
    var self = this;
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
      var d = xhr.response;
      var newUrl = encodeURIComponent(item.image);
      var contentType = xhr.getResponseHeader('Content-Type');
      App.filer.write(
        newUrl,
        {data: d, type: contentType},
        function(fileEntry, fileWriter) {
          item.image = fileEntry.toURL();
          self.trigger('imageGrabbed', item);
        },
        function(e) {console.warn(e);}
      );
    };
    xhr.open("GET", item.image);
    xhr.send();
  },

  // ### removeWithCategory(category)
  // Accepts a category string
  // Removes all articles from the collection that match the category parameter, each article model
  // is destroyed. It then raises the `articlesFromCategoryRemoved` to inform other parts of the system
  // a categories articles have been removed.
  removeWithCategory: function(category){
    var articles = this.where({ 'categoryEnglish': category });
    _.each(articles, function(article){
      article.destroy();
    });
    this.trigger("articlesFromCategoryRemoved", category);
  },

  // ### removeAll
  // Helper function to remove all articles from the collection and database. After completion it triggers
  // the `allRemoved` event.
  removeAll: function(){
    _.chain(App.articles.models).clone().each(function(model){
      model.destroy();
    });
    this.trigger("allRemoved");
  }
});
