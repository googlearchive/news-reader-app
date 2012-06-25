// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

// ## Overview
// Setup the applications namespace. Also includes the pluralize helper function that is
// available to the entire application.

window.App = {

  // The perPage setting tells the applications how many articles to display per page
  perPage: 30,

  // ### pluralize
  // Accepts a singular word and a count
  // Helper function that wraps the inflection library's `pluralize` function for ease of use.
  // Usage `App.pluralize('article', 1)` will return 'article', `App.pluralize('article', 5)`
  // will return 'articles'
  pluralize: function(singular, count) {
    if (count == 1) {
      return singular;
    } else {
      return singular.pluralize();
    }
  }

};
