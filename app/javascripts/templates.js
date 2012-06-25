App.templates = {"article": function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='';
 if (image) { 
;__p+='\n  <img src="'+
( image )+
'" />\n';
 } 
;__p+='\n<p class="news_category">'+
( category )+
'</p>\n<div class="news_meta">\n  <h1 class="primary_header">'+
( title )+
'</h1>\n  <p class="news_meta_item">'+
( source )+
'</p>\n  <p class="news_meta_item timeago" data-sort_by="'+
( updatedTime )+
'" title="'+
( new Date(updated).toISOString() )+
'">'+
( updated )+
'</p>\n</div>\n';
}
return __p;
},"browser": function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<object id="news_browser" src="'+
( link )+
'" type="application/browser-plugin"></object>\n';
}
return __p;
}};