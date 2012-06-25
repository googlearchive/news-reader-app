$(document).ready(function(){
  $(".save_trigger, .share_trigger").click(function(){
    var action = ($(this).hasClass("share_trigger")) ? "share" : "save";
    
    var intent = new WebKitIntent("http://webintents.org/" + action, "text/uri-list", $(this).attr("href"));

    window.navigator.webkitStartActivity(intent);
    
    return false;
  });
});