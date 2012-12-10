App.FullScreenView = Backbone.View.extend({
  initialize: function(){
    this.setElement("#fullscreen_trigger");
  },
  events: {
    click: function(){
      document.body.webkitRequestFullscreen();

      return false;
    }
  }
});
