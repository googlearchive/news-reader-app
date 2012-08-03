/*global App */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

// ## Overview
// Stores the settings used throughout the application. Settings are stored in Chrome sync storage which
// handles syncing data across multiple computers. If the user is logged into another computer all their
// settings will be preserved.

App.Settings = Backbone.Model.extend({

  // ### initialize
  // Setup the sync store and add a listener so we know when data has been changed
  initialize: function(){
    var self = this;
    this.syncStore = chrome.storage.sync;
    chrome.storage.onChanged.addListener(function(changes, namespace){ self.onSyncDataChange(changes, namespace); });
  },

  // ### addCategory(category)
  // Accepts a category string
  // Adds a category to the categories array and saves it to the sync store
  addCategory: function(category){
    var categories = this.get('categories');
    categories.push(category);

    // Save the categories and call uniq on the array to make sure there are no duplicates
    this.save({ "categories" : _.uniq(categories) });

    // When a category is added we need need to load up new articles from the category
    App.articles.getFromFeed(App.googleFeed, category);

    // Trigger the `categoryAdded` event
    this.trigger("categoryAdded", category);
  },

  // ### removeCategory(category)
  // Accepts a category string
  // Removes a category from the categories array and saves it to the sync store
  removeCategory: function(category){
    // Remove the category from the array and save it
    var categories = _.without(this.get('categories'), category);
    this.save({ "categories" : categories });

    // remove the articles from the category that is no longer displayed
    App.articles.removeWithCategory(category);

    // Trigger the `categoryRemoved` event
    this.trigger("categoryRemoved", category);
  },

  // ### saveOpenArticleId(id)
  // Accepts an id string
  // Saves the id of the currently open article so that the app's state can be restored
  saveOpenArticleId: function(id){
    this.save({ "openArticleId" : id });
  },

  // ## saveCurrentFilterCategory(category)
  // Accepts a category string
  // Saves the current category filter and raises the `filterCategoryChanged` event
  saveCurrentFilterCategory: function(category){
    this.save({ "filterCategory": category });
    this.trigger('filterCategoryChanged', category);
  },

  // ### changeLanguage(languageCode)
  // Accepts a languageCode string
  // Changes the language of the Google news feeds to load and saves to the sync store
  changeLanguage: function(languageCode){

    // Get the name of the language from the code
    var name = _.find(App.supportedLanguages, function(obj){ return obj.code == languageCode; }).name;
    var feedLanguage = { "code": languageCode, "name": name };
    this.save({ "feedLanguage": feedLanguage });

    // Remove all articles as they are no longer needed
    App.articles.removeAll();

    // Download articles in the new language
    App.articles.getFromFeed(App.googleFeed);

    // Trigger the `languageChanged` event
    this.trigger("languageChanged", feedLanguage);
  },

  // ## getFilterCategory
  // Returns the current filter category or 'allStories' if none is stored
  getFilterCategory: function(){
    var category = App.settings.get('filterCategory');
    return category ? category : 'allStories';
  },

  // ### onSyncDataChange(changes, namespace)
  // Accepts a changes object and a namespace sting
  // Handles sync events raised by Chrome sync storage and updates the models data accordingly
  onSyncDataChange: function(changes, namespace){

    // We are only interested in sync events
    if (namespace == 'sync') {
      // set the new values into the backbone model

      // categories
      if(changes.categories && this.get('categories') != changes.categories.newValue){
        // set the changes but no need to save them as they are already in the sync storage
        this.set({ 'categories': changes.categories.newValue });
      }

      // feedLanguage
      if(changes.feedLanguage && this.get('feedLanguage') != changes.feedLanguage.newValue){
        // set the changes but no need to save them as they are already in the sync storage
        this.set({ 'feedLanguage': changes.feedLanguage.newValue });
      }

      // openArticleId
      if(changes.openArticleId && this.get('openArticleId') != changes.openArticleId.newValue){
        // set the changes but no need to save them as they are already in the sync storage
        this.set({ 'openArticleId': changes.openArticleId.newValue });
      }

      // filterCategory
      if(changes.filterCategory && this.get('filterCategory') != changes.filterCategory.newValue){
        // set the changes but no need to save them as they are already in the sync storage
        this.set({ 'filterCategory': changes.filterCategory.newValue });
      }
    }
  },

  // ### sync(method, model, options)
  // Accepts a method string, model object, and options object
  // This function overrides the backbone functions normal sync behavior. As we are using the
  // Chrome sync storage as our backend we need to read and write data to it when sync is called.
  sync: function(method, model, options){
    var self = this;

    switch (method) {
      case "read":

        // Get a record from the sync store
        this.syncStore.get(null, function(items){
          if(chrome.runtime.lastError){

            // If there was an error pass it to the error callback
            options.error(chrome.runtime.lastError.message);
          }else{

            // On success store the records in the model
            self.set(items);

            // invoke the success callback
            options.success();
          }
        });
        break;
      case "create":
      case "update":

        // Save data to the sync store
        this.syncStore.set(model.attributes, function(){
          if(chrome.runtime.lastError){

            // If there was an error pass it to the error callback
            options.error(chrome.runtime.lastError.message);
          }else{

            // invoke the success callback
            options.success();
          }
        });
    }
  }

});
