/*global App: false, news_browser: false */

// ### Authors
// Chris Garrett <http://abstraktion.co.uk>
// ### Last changed
// 2012-06-26

// ### App.WindowView
// Handles general UI interactions, including scroll events
App.WindowView = Backbone.View.extend({
  // ### Initialize
  initialize: function(){
    this.setElement(window);
    // Set initial state on load
    this.set_ui();
  },
  
  events: {
    resize: "set_ui",
    scroll: "set_scroll_state",
    mousemove: "deactivate_keyboard_state",
    // Binding FPS directional nav as arrow keys are problematic
    "keyup[w a s d]": "activate_keyboard_state",
    "keyup[esc]": "remove_webview"
  },
  
  // ### set_ui
  // Deals with setting the UI state
  // Specifically around mobile/desktop views
  set_ui: function(){
    var nav_item = $(".category_list_trigger");
    var nav_item_link = $(".category_list_trigger > a");

    if($(window).width() > 480){
      // If mobile version, show text label for categories
      nav_item.removeClass("icon");
      nav_item_link.text("Categories");
    }else{
      // Otherwise show icon version
      nav_item.addClass("icon");
      nav_item_link.text("l");
    }
  },

  // ### set_scroll_state
  // Deals with changing the opacity of the main navigation bar
  set_scroll_state: function(){
    // Add or remove state class?
    var method = (($(this.el).scrollTop() > 0) ? "add" : "remove") + "Class";

    $("body")[method]("in_scroll");

    // setup infinite scroll to load articles
    if(this.$el.scrollTop() + $(window).height() + 400 > $(document).height()){ App.displayedArticles.load(); }
  },

  // ### deactivate_keyboard_state
  // We want to revert from the keyboard navigation state when the cursor position changes
  deactivate_keyboard_state: function(e){
    // Check the cursor position has changed from cached values
    // We do this to gauge whether the user has moved the cursor or just scrolled the window
    if(window.lastX !== e.clientX || window.lastY !== e.clientY){ $("body").removeClass("keyboard_navigation"); }

    // Cache the new cursor position
    window.lastX = e.clientX;
    window.lastY = e.clientY;
  },

  current_active_item: false,
  
  // ### activate_item
  // Sets an active class on the targetted item when navigating with keyboard
  activate_item: function(item){
    // Ditch active class from all elements
    item.siblings().removeClass("keyboard_activated");

    // And set it on the target
    item.addClass("keyboard_activated");

    // Cache it, to use for finding the next one
    this.current_active_item = item;
  },
  
  layout: {
    // ### layout.get_items_per_row
    // Calculates the number of news items we'll render per row
    get_items_per_row: function(){ return Math.ceil($("#news_container").width() / 160); },
    // ### layout.get_target_item_vertically
    // Find the immediate item above or below the active item
    get_target_item_vertically: function(direction, item, per_row){
      // Where are we in the list?
      var index = item.index();
      
      // Where do we want to go next?
      var target_index = (direction == "down") ? index + per_row - 1 : index - per_row + 1;

      // Get the next item as a jQuery object
      item = $(".news_item:eq(" + target_index + ")");

      // Return it for manipulation
      return item;
    }
  },

  // ### activate_keyboard_state
  activate_keyboard_state: function(e){
    // Set keyboard navigable state
    $("body").addClass("keyboard_navigation");

    var target_item = false;
    
    // Has the user previously used the keyboard for navigation?
    if(this.current_active_item){
      switch(e.which){
        case 68: target_item = this.current_active_item.next(); break;
        case 65: target_item = this.current_active_item.prev(); break;
        case 87: target_item = this.layout.get_target_item_vertically("up", this.current_active_item, this.layout.get_items_per_row()); break;
        case 83: target_item = this.layout.get_target_item_vertically("down", this.current_active_item, this.layout.get_items_per_row()); break;
      }

      // Set active on the target item
      if(target_item){ this.activate_item(target_item); }else{ this.activate_item($(".news_item:first")); }
    }else{
      // Or assume this is the first interaction and set active on the first child
      this.activate_item($(".news_item:first"));
    }

    return false;
  },

  // ###
  remove_webview: function(e) {
    $("body").removeClass("news_loaded");
    $("#browser_container").html("");
    // Remove the currently open article from the settings model so the app's state is saved
    App.settings.saveOpenArticleId('');
    return false;
  }
});
