/*global App: false, news_browser: false */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

// ## Overview
// The article views handle displaying all of the articles in the app excluding the search results
// which is handles by search-results-view.js

// ### App.ArticleView
// handles rendering and events for individual articles
App.ArticleView = Backbone.View.extend({
  tagName: "li",

  // ### render
  // Renders the template with the model data and adds it to the views element
  render: function(){
    $(this.el).html(App.templates.article(this.model.toJSON()));
    return this;
  },
  events: {
    "click": "openLink"
  },

  // ### openLink
  // Opens the link of the article in the browser tag
  openLink: function(){
    // Set the article title as the browser heading text
    $(".browser_heading").text(this.model.get("title"));

    // Update the intent triggers hrefs for reference
    $(".save_trigger, .share_trigger").attr("href", this.model.get("link"));

    // Set the body class to trigger the article loaded state and styles
    $("body").toggleClass("news_loaded");

    // Empty the browser wrapper and append a new browser object
    $('#browser_container').empty().append(App.templates.browser(this.model.toJSON()));

    // Save the currently open article in the settings model so the app's state is saved
    App.settings.saveOpenArticleId(this.model.get('id'));
  }
});

// ### App.ArticlesView
// Handles rendering all articles
App.ArticlesView = Backbone.View.extend({

  // ### initialize
  // Sets up listeners for all relevant events, sets the element and initializes masonry
  initialize: function(){
    this.collection.on('reset', this.render, this);
    this.collection.on('add', this.add, this);
    this.collection.on('remove', this.remove, this);
    this.collection.on('reset', this.reset, this);
    this.collection.on('articlesRemoved', this.postRender, this);
    this.collection.on('articlesAdded', this.postRender, this);

    this.setElement("#news_container");

    this.$el.masonry({
      itemSelector: ".news_item:visible",
      isFitWidth: false,
      layoutPriorities: { shelfOrder: 1.21 }
    });
  },

  // ### add(article)
  // Accepts an article model object
  // This function is called whenever an article is added to the collection
  add: function(article){

    // Only render the article if its in a category we are interested in
    var currentCategory = App.settings.getFilterCategory();
    if(currentCategory == 'allStories' || currentCategory == article.get('categoryEnglish')){

      // Create a view for the article
      var articleView = this.createArtilceView(article);

      // prepend the article to the articles container
      this.$el.prepend(articleView.render().el);
    }
  },

  // ### remove(article)
  // Accepts an article model object
  // Removes an article from the DOM
  remove: function(article){
    $('#article-' + article.cid).remove();
  },

  // ### reset
  // Removes all articles from the DOM
  reset: function(){
    this.$el.empty();
  },

  // ### articlesRemoved
  // When articles are removed we need to call post render to sort the list correctly
  articlesRemoved: function(){
    this.postRender();
  },

  // ### render
  // Iterates through the collection and renders each article
  render: function(){
    var self = this;

    this.collection.each(function(article){
      self.add(article);
    });

    this.postRender();

    return this;
  },

  // ### postRender
  // Sorts the articles by when they were updated, adds a pretty time display and reloads masonry
  postRender: function(){
    $(".timeago").timeago();
    $('#news_container>li').tsort('.timeago', { 'data': 'sort_by', 'order': 'desc' });
    this.$el.masonry("reload");
  },

  // ### createArtilceView(article)
  // Accepts and article model object
  // This is a helper function to create new article views
  // **returns** a new article view object
  createArtilceView: function(article){
    return new App.ArticleView({
      model:      article,
      id:         "article-" + article.cid,
      className:  "news_item in_category_" + article.get("categoryEnglish").underscore()
    });
  }
});

App.CloseBrowserView = Backbone.View.extend({
  initialize: function(){
    // Fetch the close button from DOM
    this.setElement('.close_browser_trigger');
  },

  events: {
    click: function(){
      $("body").removeClass("news_loaded");

      $("#browser_container").html("");

      // Remove the currently open article from the settings model so the app's state is saved
      App.settings.saveOpenArticleId('');

      return false;
    }
  }
});
