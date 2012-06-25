App.FullScreenView = Backbone.View.extend({
  initialize: function(){
    this.setElement("#fullscreen_trigger");
  },
  events: {
    click: function(){
      document.webkitRequestFullscreen();

      return false;
    }
  }
});