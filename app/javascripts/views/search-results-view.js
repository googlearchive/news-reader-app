/*global App */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

// ## Overview
// Deals with displaying search results

App.SearchResultsView = App.ArticleView.extend({

  // ### initialize
  // Sets the DOM element to work with, initializes masonry and listens for the `add event`
  initialize: function(){
    this.setElement('#search_container');

    this.$el.masonry({
      itemSelector: ".news_item:visible",
      isFitWidth: false,
      layoutPriorities: { shelfOrder: 1.21 }
    });

    this.collection.on('add', this.add, this);
  },

  // ### add(article)
  // Accepts an article model object
  // Adds an article to the view, sets the pretty time and relaods masonry
  add: function(article){
    this.$el.prepend(this.createArtilceView(article).render().el);
    $(".timeago").timeago();
    this.$el.masonry("reload");
  },

  // ### createArtilceView(article)
  // Accepts an article model object
  // Helper function to create an article view
  createArtilceView: function(article){
    return new App.ArticleView({
      model:      article,
      id:         "article-" + article.cid,
      className:  "news_item in_category_" + article.get("category").toLowerCase().split(' ').join('_')
    });
  }
});
