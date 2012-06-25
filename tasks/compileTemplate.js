// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

var fs    = require('fs');
var _und  = require('../app/javascripts/vendor/underscore.min');

exports.compile = function(file){
  var template = fs.readFileSync(file, 'utf8');
  return _und.template(template).source;
};

exports.write = function(file, templates){
  var code = 'App.templates = {';
  code += _und.map(templates, function(template, key) {
    return'"'+key+'": '+template;
  }).join(',');
  code += '};';
  fs.writeFileSync(file, code, 'utf8');
};
