/*global App */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

// ## App.DisplayedArticles
// The App.DisplayedArticles is used to keep track of articles that are to be
// displayed. It handles the loading of new articles from the data store and firing
// events that views can listen for.

App.DisplayedArticles = Backbone.Collection.extend({

  // Set the indexedDb database to use
  database:   App.articlesDatabase,
  storeName:  "articles",
  model:      App.Article,

  // ### initialize
  // Setup listeners for various events raised by the articles collection
  initialize: function(){

    // Set loading to false, use to track if the class is currently loading data
    this.loading = false;

    App.articles.on('allRemoved', this.allRemoved, this);
    App.articles.on('add', this.articleAdded, this);
    App.articles.on('articlesFromCategoryRemoved', this.removeWithCategory, this);
    App.settings.on('filterCategoryChanged', this.filterCategoryChanged, this);
  },

  // ### comparator
  // sort articles by the updatedTime field so that newest articles are first
  comparator: function(article) {
    return -article.get('updatedTime');
  },

  // ### articleAdded
  // handles new articles that have been added and decides if they should
  // be displayed. Articles that are newer than the oldest article currently displayed
  // are added. Older articles are also added if the number of articles currently
  // displayed is less than the value of App.perPage
  articleAdded: function(article){
    var oldestTime;

    // Work out the timestamp of the oldest article displayed or set to 0
    if(this.length > 0){
      oldestTime = this.last().get('updatedTime');
    }else{
      oldestTime = 0;
    }

    // Add the article to the collection if it's newer than the oldest article
    // or if there are less articles displayed than should be on a single page
    if(this.length < App.perPage || oldestTime < article.get('updatedTime')){
      this.add(article);
      this.trigger('articlesAdded');
    }
  },

  // ### removeWithCategory(category)
  // Removes all articles with the specified category then triggers the `articlesRemoved` event
  removeWithCategory: function(category){
    this.remove(this.where({ 'categoryEnglish': category }));
    this.trigger("articlesRemoved", category);
  },

  // ### allRemoved
  // Removes all articles form the collection
  allRemoved: function(){
    this.reset();
  },

  // ## filterCategoryChanged(category)
  // When the filter category is changed we need to remove all articles from the collection
  // and load in new articles
  filterCategoryChanged: function(category){
    this.reset();
    this.load();
    return;
  },

  // ### load
  // Load articles form indexedDb, articles will be loaded with a limit the same as the
  // number set in App.perPage to support pagination.
  load: function(){
    var length, articlesLength;

    // If there is a filter category then only include the category in the length comparisons
    var filterCategory = App.settings.getFilterCategory();
    if(filterCategory != 'allStories'){
      length          = this.where({ 'categoryEnglish': filterCategory }).length;
      articlesLength  = App.articles.where({ 'categoryEnglish': filterCategory }).length;
    }else{
      length = this.length;
      articlesLength = App.articles.length;
    }

    // Check if there are articles to load, or if articles are already being loaded
    if((length < articlesLength && !this.loading) || length === 0){
      var from, to;
      var self = this;

      // Set loading to be true so we don't load twice at the same time
      this.loading = true;

      // Set the to time to 0 so we can load articles up to the beginning of time
      to = 0;

      if(length > 0){

        // Set the from time the date of the last article we have and minus 1 off the value
        // as ranges in indexedDb load results between, but not including, the range limits
        from = this.last().get('updatedTime') + 1;
      }else{

        // If there are no articles in this collection set the time limit to the current time
        from = new Date().getTime() + 1;
      }

      var conditions = { 'updatedTime': [from, to] };

      if(filterCategory != 'allStories'){
        conditions.categoryEnglish = filterCategory;
      }

      // Fetch the articles, we pass add: true so that the articles are added to the current
      // collection and do not replacing  it. The success callback sets the loading variable
      // to false so load() can be called again and also triggers the articlesAdded event so
      // views know all the articles have been loaded.
      this.fetch({
        add: true,
        limit: App.perPage,
        conditions: conditions,
        success: function(){
          self.loading = false;
          self.trigger('articlesAdded');
        }
      });
    }
  }

});
