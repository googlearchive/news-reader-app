/*global namespace: false, desc: false, task: false, jake: false, complete: false */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

var fs          = require('fs');
var template    = require('./tasks/compileTemplate');
var compressor  = require('node-minify');

var templatesDir          = 'app/javascripts/templates';
var compiledTemplatesFile = 'app/javascripts/templates.js';

var foregroundJavascriptFiles = [
  "app/javascripts/vendor/jquery-1.7.2.min.js",
  "app/javascripts/vendor/underscore.min.js",
  "app/javascripts/vendor/backbone.min.js",
  "app/javascripts/vendor/backbone.eventdata.js",
  "app/javascripts/vendor/backbone-indexeddb.js",
  "app/javascripts/vendor/jfeed.min.js",
  "app/javascripts/vendor/masonry.min.js",
  "app/javascripts/vendor/masonry_ordered.js",
  "app/javascripts/vendor/jquery.timeago.js",
  "app/javascripts/vendor/filer.min.js",
  "app/javascripts/vendor/jquery.tinysort.min.js",
  "app/javascripts/vendor/hotkeys.js",
  "app/javascripts/vendor/inflection.js",
  "app/javascripts/app.js",
  "app/javascripts/lib/feedParsers/google.js",
  "app/javascripts/models/setting.js",
  "app/javascripts/models/article.js",
  "app/javascripts/models/displayed-articles.js",
  "app/javascripts/models/search.js",
  "app/javascripts/views/window-view.js",
  "app/javascripts/views/intent-view.js",
  "app/javascripts/views/article-view.js",
  "app/javascripts/views/category-view.js",
  "app/javascripts/views/search-view.js",
  "app/javascripts/views/search-results-view.js",
  "app/javascripts/views/settings-view.js",
  "app/javascripts/templates.js",
  "app/javascripts/setup.js",
  "app/javascripts/foreground-setup.js"
];

var backgroundJavascriptFiles = [
  "app/javascripts/background.js",
  "app/javascripts/vendor/jquery-1.7.2.min.js",
  "app/javascripts/vendor/underscore.min.js",
  "app/javascripts/vendor/backbone.min.js",
  "app/javascripts/vendor/backbone-indexeddb.js",
  "app/javascripts/vendor/jfeed.min.js",
  "app/javascripts/vendor/filer.min.js",
  "app/javascripts/vendor/inflection.js",
  "app/javascripts/app.js",
  "app/javascripts/lib/feedParsers/google.js",
  "app/javascripts/models/setting.js",
  "app/javascripts/models/article.js",
  "app/javascripts/views/notifications-view.js",
  "app/javascripts/setup.js",
  "app/javascripts/background-setup.js"
];

var cssFiles = [
  "app/stylesheets/fonts/pictos.css",
  "app/stylesheets/reset.css",
  "app/stylesheets/base.css",
  "app/stylesheets/masonry.css",
  "app/stylesheets/ui/navigation.css",
  "app/stylesheets/ui/headings.css",
  "app/stylesheets/ui/browser.css",
  "app/stylesheets/ui/news_index.css",
  "app/stylesheets/ui/search.css",
  "app/stylesheets/specific/categories.css",
  "app/stylesheets/specific/settings.css"
];

desc('Build the application.');
task('build', ['build:javascripts', 'build:css', 'build:docs']);

namespace('build', function () {
  desc('Precompile the applications templates.');
  task('templates', [], function () {
    jake.logger.log('Building the templates...');

    var files = fs.readdirSync(templatesDir);

    var templates = {};
    var i;
    for (i = 0; i < files.length; i++) {
      if (/\.jst$/.test(files[i])) {
        templates[files[i].replace(/\.jst$/, '')] = template.compile(templatesDir + '/' + files[i]);
        jake.logger.log('.');
      }
    }
    template.write(compiledTemplatesFile, templates);
    jake.logger.log('Finished compiling templates');
  });

  desc('Compile the documentation');
  task('docs', [], function(){
    jake.logger.log('Building documentation...');
    var commands = [
      "rm -fr ./docs/*",
      "paige"
    ];
    jake.exec(commands, function () {
      jake.logger.log('Documentation saved to docs folder');
      complete();
    });
  });

  desc('Join and minify the CSS');
  task('css', [], function(){
    jake.logger.log('Started compressing CSS files...');
    new compressor.minify({
      type: 'yui-css',
      fileIn: cssFiles,
      fileOut: 'app/stylesheets/minified.css',
      callback: function(error){
          jake.logger.log('Finished compressing CSS');
          if(error){
            jake.logger.log(error);
          }
      }
    });
  });

  desc('Join and minify the JavaScript');
  task('javascripts', ['javascripts:foreground', 'javascripts:background']);

  namespace('javascripts', function () {

    task('foreground', ['templates'], function(){
      jake.logger.log('Started compressing foreground JavaScript files...');
      new compressor.minify({
        type: 'uglifyjs',
        fileIn: foregroundJavascriptFiles,
        fileOut: 'app/javascripts/foreground.min.js',
        callback: function(error){
          jake.logger.log('Finished compressing foreground JavaScript');
          if(error){
            jake.logger.console.log(error);
          }
        }
      });
    });

    task('background', [], function(){
      jake.logger.log('Started compressing background JavaScript files...');
      new compressor.minify({
        type: 'uglifyjs',
        fileIn: backgroundJavascriptFiles,
        fileOut: 'app/javascripts/background.min.js',
        callback: function(error){
          jake.logger.log('Finished compressing background JavaScript');
          if(error){
            jake.logger.console.log(error);
          }
        }
      });
    });

  });
});
