App.CloseWindowView = Backbone.View.extend({
  initialize: function(){
    this.setElement("#close_trigger");
  },
  events: {
    click: function(){
      window.close();
      return false;
    }
  }
});
