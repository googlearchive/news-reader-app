/*global App */

// ### Authors
// Chris Garrett <http://abstraktion.co.uk>
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

// View for the category list
App.CategoriesListView = Backbone.View.extend({
  initialize: function(){

    // Store the list of category elements
    this.categoryViews = {};

    // Fetch categories dropdown from DOM
    this.setElement('.category_list');

    // Listen for the languageChanged event so that the local country name in the list can be changed
    App.settings.on('languageChanged', this.changeCountryName, this);

    // Listen for category added/removed events so the category list can be updated
    App.settings.on('categoryAdded', this.categoryAdded, this);
    App.settings.on('categoryRemoved', this.categoryRemoved, this);

    this.render();
  },
  render: function(){
    var self = this;

    // Ensure list is empty
    this.$el.empty();

    // Set default categories
    var categories = ["allStories"].concat(App.defaultCategories);

    // Load the list of current categories from the settings here so we only have to do it once
    var currentCategories = App.settings.get('categories');

    // Load the currently selected category from the settings
    var selectedCategory = App.settings.getFilterCategory();

    // Append categories
    _.each(categories, function(category){

      // Figure out if the category is currently selected
      var selected = category == selectedCategory ? true : false;

      // Add the view to the list of category views
      self.categoryViews[category] = self.create_category(category, selected);

      // Render the category
      self.$el.append(self.categoryViews[category].render().el);

      // If the category is not in the list of current categories from the settings then hide it
      if(!_.include(currentCategories, category) && category != 'allStories'){
        self.categoryViews[category].$el.hide();
      }
    });
  },

  changeCountryName: function(language){
    this.$('.countryName').text(language.name);
  },

  // ## categoryAdded
  categoryAdded: function(category){
    this.categoryViews[category].$el.show();
  },

  // ## categoryRemoved
  categoryRemoved: function(category){
    this.categoryViews[category].$el.hide();

    // If the category thats currently selected is removed activate the allStories category
    if(category == App.settings.get('filterCategory')){
      this.categoryViews.allStories.activate_category();
    }
  },

  create_category: function(category, selected){
    var category_label;
    var classNames = [];

    if(category == "nation"){
      category_label = App.settings.get('feedLanguage').name;
      // Add the 'countryName' class so the label can be changed when the feedLanguage setting is changed
      classNames.push('countryName');
    }else{
      // Get category label
      category_label = chrome.i18n.getMessage(category);
    }

    // If the item should be selected add the active class
    if(selected){
      classNames.push('active');
    }

    var options = {
      "category_label": category_label,
      "category":       category,
      "className":      classNames.join(' ')
    };

    // Pass to single category view
    return new App.CategoryView(options);
  }
});

// View for each category
App.CategoryView = Backbone.View.extend({
  tagName: "li",

  initialize: function(options){
    // Set properties
    this.category = options.category;
    this.category_label = options.category_label;
  },

  // Register click callback
  events: { click: "activate_category" },

  activate_category: function(){
    // Deactivate all categories
    $(this.el).siblings().removeClass("active");

    // And activate this one
    $(this.el).addClass("active");

    $(".news_item").show();

    // Hide irrelevant news items
    if(this.category != "allStories"){ $(".news_item:not(.in_category_" + this.category.underscore() + ")").hide(); }

    // Reload masonry
    $("#news_container").masonry("reload");

    // Save the current filter in the settings model
    App.settings.saveCurrentFilterCategory(this.category);
  },

  render: function(){
    // Set label + class
    $(this.el).html(this.category_label).addClass(this.category + "CategoryTrigger");
    return this;
  }
});
