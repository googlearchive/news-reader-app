/*global App: false */

App.WindowView = Backbone.View.extend({
  initialize: function(){
    this.setElement(window);
    this.set_ui();
  },

  events: {
    resize: "set_ui",
    scroll: "set_scroll_state",
    mousemove: "deactivate_keyboard_state",
    // Binding FPS directional nav as arrow keys are problematic
    "keyup[w a s d]": "activate_keyboard_state"
  },

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

  set_scroll_state: function(){
    // Add or remove state class?
    var method = (($(this.el).scrollTop() > 0) ? "add" : "remove") + "Class";

    $("body")[method]("in_scroll");

    // setup infinite scroll to load articles
    if(this.$el.scrollTop() + $(window).height() + 400 > $(document).height()){
      App.displayedArticles.load();
    }
  },

  deactivate_keyboard_state: function(e){
    // Check the cursor position has changed from cached values
    // We do this to gauge whether the user has moved the cursor or just scrolled the window
    if(window.lastX !== e.clientX || window.lastY !== e.clientY){ $("body").removeClass("keyboard_navigation"); }

    // Cache the new cursor position
    window.lastX = e.clientX;
    window.lastY = e.clientY;
  },

  current_active_item: false,

  activate_item: function(item){
    item.siblings().removeClass("keyboard_activated");

    item.addClass("keyboard_activated");

    this.current_active_item = item;
  },

  layout: {
    get_items_per_row: function(){ return Math.ceil($("#news_container").width() / 160); },
    get_target_item_vertically: function(direction, item, per_row){
      var index = item.index();

      var target_index = (direction == "down") ? index + per_row - 1 : index - per_row + 1;

      item = $(".news_item:eq(" + target_index + ")");

      return item;
    }
  },

  activate_keyboard_state: function(e){
    // Set keyboard navigable state
    $("body").addClass("keyboard_navigation");

    var target_item = false;

    if(this.current_active_item){
      switch(e.which){
        case 68: target_item = this.current_active_item.next(); break; // Go to the next item
        case 65: target_item = this.current_active_item.prev(); break; // Go to the previous item
        case 87: target_item = this.layout.get_target_item_vertically("up", this.current_active_item, this.layout.get_items_per_row()); break;
        case 83: target_item = this.layout.get_target_item_vertically("down", this.current_active_item, this.layout.get_items_per_row()); break;
      }

      if(target_item){ this.activate_item(target_item); }else{ this.activate_item($(".news_item:first")); }
    }else{
      this.activate_item($(".news_item:first"));
    }

    return false;
  }
});
