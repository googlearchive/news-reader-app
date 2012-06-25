/*global App */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

// ## Overview
// Handles the display of the search menu item

App.SearchView = Backbone.View.extend({

  // ### initialize
  // Sets the DOM element to work with and binds to the "f" key event
  initialize: function(){
    var self = this;

    this.setElement('#search_menu');

    // Trigger search on cmd+f
    $(window).bind("keyup", "f", function(){ self.toggleSearch(); });
    
    // Register click on sibling close search icon
    $("#close_search").click(function(){ self.closeSearch(); });
  },

  // Set handlers for the click and submit events
  events: {
    "click #search_trigger": "toggleSearch",
    "submit #search_form":   "performSearch"
  },

  exit_method: "close",

  // ###toggleSearch
  // Shows and hides the search menu
  toggleSearch: function(){

    // Toggle body class to hide/show search
    $("body").toggleClass("search_triggered");

    // If the search has been triggered, focus on the input
    if($("body").hasClass("search_triggered")){
      $("#search_term").focus();
    }else{
      // when the search is closed show the main display again
      this.closeSearch();
    }
  },

  // ### performSearch
  // Performs a search via the Google news feed
  performSearch: function(){
    // Hide search form on execution
    $("body").removeClass("search_triggered").addClass("search_performed");
    
    // Hide the main news container DOM element
    $('#news_container').hide();

    // Empty and show the search results DOM element
    $('#search_container').empty().show();

    // Perform the search with the value taken from the search form field
    App.searchResults.getFromFeed(App.googleFeed, this.$('#search_term').val());
    return false;
  },

  // ### closeSearch
  closeSearch: function(){
    // Remove class, hiding search specific UI elements
    $("body").removeClass("search_performed");
    
    // Show the main news container DOM element
    $('#news_container').show();

    // Hide the search results DOM element
    $('#search_container').hide();
  }
});
