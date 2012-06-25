/*global App */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

// ## Overview
// Settings panel views

// ### App.SettingsView
// Handles the display of the settings menu
App.SettingsView = Backbone.View.extend({

  // ### initialize
  // Sets the DOM element to work with and renders immediately
  initialize: function(){
    this.setElement('.settings_dropdown');
    // Immediately render on initialization
    this.render();
  },

  // ### render
  // Renders the categories and languages sub views
  render: function(){
    this.categories = new App.SettingCategoriesView();
    this.categories.setElement(this.$('#settings_categories')).render();

    this.languages = new App.SettingsLanguagesView();
    this.languages.setElement(this.$('#settings_languages')).render();
  }
});

// ### App.SettingCategoriesView
// Handles the categories view withing the settings menu
App.SettingCategoriesView = Backbone.View.extend({

  // ### initialize
  // Setup a handler for when the language changes
  initialize: function(){
    App.settings.on('languageChanged', this.changeCountryName, this);
  },

  // ### render
  // Render the category sub view for each category in `App.defaultCategories`
  render: function(){
    var self = this;
    this.$el.empty();
    _.each(App.defaultCategories, function(category){
      self.$el.append(self.createCategorySetting(category).render().el);
    });
  },

  // ### changeCountryName(language)
  // Accepts a language string
  // When the language setting changes the category name for the local country needs to be updated
  changeCountryName: function(language){
    this.$('.countryName').text(language.name);
  },

  // ### createCategorySetting(category)
  // Accepts a category string
  // Builds the options and creates a new `App.SettingsCategoryView` for the passed category
  createCategorySetting: function(category){
    var categoryName;
    var classNames = [];

    // If the category is "nation" we want to display the actual country name rather than "nation"
    if(category == "nation"){
      categoryName = App.settings.get('feedLanguage').name;

      // Add the 'countryName' class so it can be changed when the language setting is changed
      classNames.push('countryName');
    }else{

      // Get the category name from i18n
      categoryName = chrome.i18n.getMessage(category);
    }

    var options = {
      'displayCategory':  categoryName,
      'category':         category
    };

    // If the category is in the settings array of categories mark it as active
    if($.inArray(category, App.settings.get('categories')) > -1){
      classNames.push('active');
    }

    // Join the class names together
    options.className = classNames.join(' ');

    // Create the view
    return new App.SettingsCategoryView(options);
  }
});

// ### App.SettingsCategoryView
// View for each category in the settings menu
App.SettingsCategoryView = Backbone.View.extend({
  tagName:    "li",

  // ### initialize
  // Accepts an options object
  // Store the category and the category display name for future use
  initialize: function(options){
    this.category         = options.category;
    this.displayCategory  = options.displayCategory;
  },

  // Setup the click event handler
  events: {
    "click": "updateSettings"
  },

  // ### updateSettings
  // When the category is clicked the setting is saved
  updateSettings: function(){
    // toggle the active class
    this.$el.toggleClass('active');

    // save the settings
    if(this.$el.hasClass('active')){

      // the category has been added
      App.settings.addCategory(this.category);
    }else{

      // the category has been removed
      App.settings.removeCategory(this.category);
    }
  },

  // ### render
  // Renders the category
  render: function(){
    $(this.el).html(this.displayCategory);
    return this;
  }
});

// ### App.SettingsLanguagesView
// Handles the language settings menu
App.SettingsLanguagesView = Backbone.View.extend({

  // ### render
  // Iterates through each supported language and creates an option for each one
  render: function(){
    this.$el.empty();
    var self = this;
    _.each(App.supportedLanguages, function(language){
      language.attributes = { 'value': language.code };
      if(App.settings.get('feedLanguage').code == language.code){

        // This is the current language and should be selected
        language.attributes.selected = "selected";
      }
      self.$el.append(self.createLanguage(language).render().el);
    });
    return this;
  },

  // Setup the change event handler
  events: {
    "change": "updateSettings"
  },

  // ### updateSettings
  // Saves the new setting in the settings model
  updateSettings: function(){
    App.settings.changeLanguage(this.$el.val());
  },

  // ### createLanguage(options)
  // Accepts an options object
  // Helper function for creating a language
  createLanguage: function(options){
    return new App.SettingsLanguageView(options);
  }
});

// ### App.SettingsLanguageView
// Handles rendering each language option
App.SettingsLanguageView = Backbone.View.extend({
  tagName:    "option",

  initialize: function(options){
    this.name = options.name;
  },

  render: function(){
    $(this.el).html(this.name);
    return this;
  }
});
