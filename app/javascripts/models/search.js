/*global App */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

// ## Overview
// This model and collection handles getting search results from google. The results are stored in memory
// only as they do not need to persist across application restarts or be available offline.

App.SearchResult = Backbone.Model.extend({});

App.SearchResults = Backbone.Collection.extend({

  model: App.SearchResult,

  // ### initialize
  // Setup handlers for saving articles
  initialize: function(){
    this.on('articleGrabbedWithImage',  this.storeImage,  this);
    this.on('articleGrabbed',           this.saveItem,    this);
    this.on('imageGrabbed',             this.saveItem,    this);
  },

  // ### getFromFeed(feed, query)
  // Accepts a feed object that processes the feed and a search query
  getFromFeed: function(feed, query){
    // clear the collection of any previous results
    this.reset();
    var self = this;

    // Get the language to use from the settings model.
    var language = App.settings.get('feedLanguage');

    // Get the uri from the feed object passed in as a parameter.
    var feedUri = feed.uri({ 'query': query, 'language': language.code });
    console.log('getting news from: ' + feedUri);

    // Use the jFeed plugin to get and parse the feed for us.
    jQuery.getFeed({
      url: feedUri,
      success: function(result) {

        // Iterate through each item in the feed
        $.each(result.items, function(i, item){

          // parse the feed using the supplied feed parser
          var parsedItem = feed.parseItem(item);

          // Only store the image and save the article if it not already in the database
          if(!self.get(item.id)){
            self.trigger('articleGrabbed', parsedItem);
          }
        });
      }
    });
  },

  // ### saveItem(item)
  // Accepts and item object
  // Saves the item in as an article record and adds it to this collection
  saveItem: function(item){
    var searchResult = new App.SearchResult(item);
    this.add(searchResult);
  },
});
