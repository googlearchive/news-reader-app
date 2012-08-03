/*global App: false */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

// ## Overview
// This library file is responsible for building the correct url's for each feed using the
// internationalization support in Google Chrome apps. It's also responsible for taking each
// item from the RSS feed and parsing it into an object useful to the backbone model

App.googleFeed = {

  // ### uri(options)
  // Accepts an options object that can contain the following keys
  //
  //     {
  //       // 'category' Required (unless a query is used):
  //       // The category to load from
  //       category:  'world',
  //
  //       // 'language' Optional:
  //       // The language to use, if not present defaults to i18n
  //       language:  'en',
  //
  //       // Optional 'query':
  //       // A search query string
  //       query:     'apple computers'
  //     }
  //
  // **returns** a uri string
  uri: function(options){

    // load the base uri from i18n
    var uri  = chrome.i18n.getMessage("baseFeedUri");

    if(options.language){

      // If a language option is present us it
      uri += "&ned=" + options.language;
    }else{

      // Otherwise load from i18n
      uri += "&ned=" + chrome.i18n.getMessage("languageCode");
    }

    // Work out the correct url parameter for the category if present
    switch(options.category){
      case "topStories":
        uri += "&topic=h";
        break;
      case "newsNearYou":
        uri += "&geo=detect_metro_area";
        break;
      case "world":
        uri += "&topic=w";
        break;
      case "business":
        uri += "&topic=b";
        break;
      case "nation":
        uri += "&topic=n";
        break;
      case "technology":
        uri += "&topic=tc";
        break;
      case "entertainment":
        uri += "&topic=e";
        break;
      case "sports":
        uri += "&topic=s";
        break;
      case "science":
        uri += "&topic=snc";
        break;
      case "health":
        uri += "&topic=m";
        break;
      case "spotlight":
        uri += "&topic=ir";
        break;
    }

    // If a query string is present encode the string and add it to the uri
    if(options.query){
      uri += "&q=" + encodeURIComponent(options.query);

      // Get 50 search results when searching
      options.num = 50;
    }

    // If the num option is present return the requested number of results
    if(options.num) {
      uri += "&num=" + options.num;
    }

    // Return the built uri
    return uri;
  },

  // ### parseItem(item)
  // Accepts an RSS item jFeed object
  // Takes a jFeed object and parses the information needed to save an article
  //
  // **returns** an object suitable for the Article backbone model
  parseItem: function(item){
    var imageUrl, image, arr, len, title, source;

    // extract the image uri from the description and use a larger version
    imageUrl = $('img', item.description).eq(0).attr('src');
    if (imageUrl) {
      image = imageUrl.replace(/\/0\.jpg$/, '/11.jpg').replace(/^\/\//, 'http://');
    }else{
      image = "";
    }

    // split the source from the title
    arr = item.title.split(/ - ([^\-]+)$/);

    // make sure we set a title and source even if the split fails
    len = arr.length;

    if (len < 1) {
      title   = item.title;
      source  = '';
    }
    if (len == 1) {
      title   = arr[0];
      source  = '';
    }
    if (len >= 2) {
      title   = arr[0];
      source  = arr[1];
    }

    // return an object suitable for storing in the article model
    return {
      "image"       : image,
      "title"       : title,
      "source"      : source,
      "id"          : item.id,
      "category"    : item.category,
      "link"        : item.link,
      "updated"     : item.updated,
      // set an updated time field so it can be used for sorting, we set this here rather than
      // calculating it in the comparator method for efficiency
      "updatedTime" : new Date(item.updated).getTime(),
      "description" : item.description
    };
  }
};
