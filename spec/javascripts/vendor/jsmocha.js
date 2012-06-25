var jsMocha = {};
/*global jsMocha: false */
jsMocha.Cardinality = new function() {
    function Cardinality(required, maximum) {
        this.required = required;
        this.maximum = maximum;

        this.verify = function(invocation_count) {
          return invocation_count >= this.required && invocation_count <= this.maximum ? true : false;
        };

        this.allowed_any_number_of_times = function() {
          return this.required === 0 && this.maximum == Infinity ? true : false;
        };

        this.inspect = function() {
          if(this.allowed_any_number_of_times()){
            return "allowed any number of times";
          }
          else{
            if(this.required === 0 && this.maximum === 0){
              return "expected never";
            }
            else if(this.required == this.maximum){
              return "expected exactly " + this.times(this.required);
            }
            else if(this.maximum == Infinity){
              return "expected at least " + this.times(this.required);
            }
            else if(this.required === 0){
              return "expected at most " + this.times(this.maximum);
            }
          }
        };

        this.times = function(number) {
          switch(number){
            case 0:
              return "no times";
            case 1:
              return "once";
            case 2:
              return "twice";
            default:
              return number + " times";
          }
        };
    }
    this.exactly = function(number) {
        return new Cardinality(number, number);
    };
    this.at_least = function(number) {
        return new Cardinality(number, Infinity);
    };
    this.at_most = function(number) {
        return new Cardinality(0, number);
    };
};
/*global jsMocha: false, console: false */
jsMocha.console = {
  log: function(a){
    if(typeof window.console != 'undefined'){
      console.log(a);
    }
  },
  warn: function(a){
    if(typeof window.console != 'undefined'){
      console.log(a);
    }
  }
};
/*global jsMocha: false */
jsMocha.Expectation = function(mock, method_name) {
  this.mock = mock;
  var obj = this.existing_expecation(method_name);
  if(obj){
    jsMocha.console.log("ARRRRRG, trying you mock twice you be!");
    obj.has_existing_expectation = true;
    obj.once();
    return obj;
  }
  else{
    this.has_existing_expectation = false;
    this.once();
  }
  this.method_name = method_name;
  this.actual_parameters = null;
  this.invocation_count = 0;
  this.local_report = [];
  this.return_values = null;
  this.valid = true;
  this.callback = null;
  this.callback_arguments = [];
};

jsMocha.Expectation.prototype = {

  times: function(number) {
    this.cardinality = jsMocha.Cardinality.exactly(number);
    return this;
  },
  once: function() {
    if(this.has_existing_expectation){
      this.cardinality = jsMocha.Cardinality.exactly(this.cardinality.maximum + 1);
    }
    else{
      this.cardinality = jsMocha.Cardinality.exactly(1);
    }
    return this;
  },
  twice: function() {
    this.cardinality = jsMocha.Cardinality.exactly(2);
    return this;
  },
  never: function() {
    this.cardinality = jsMocha.Cardinality.exactly(0);
    return this;
  },
  at_least: function(number) {
    this.cardinality = jsMocha.Cardinality.at_least(number);
    return this;
  },
  at_most: function(number) {
    this.cardinality = jsMocha.Cardinality.at_most(number);
    return this;
  },
  passing: function() {
    this.parameters_matcher = new jsMocha.ParametersMatcher(arguments);
    return this;
  },
  returns: function() {
    this.return_values = arguments;
    return this;
  },
  runs: function(callback) {
    this.callback = callback;
    return this;
  },
  invokes_arguments: function() {
    this.callback_arguments = arguments;
    return this;
  },
  should_return_something: function() {
    return this.return_values ? true : false;
  },
  existing_expecation: function(method_name) {
    if(this.mock.jsmocha){
      var len = this.mock.jsmocha.expectations.expectations.length;
      for(var i = 0; i < len; i++){
        if(this.mock.jsmocha.expectations.expectations[i].method_name == method_name){
          return this.mock.jsmocha.expectations.expectations[i];
        }
      }
    }
  },
  match: function(args) {
    if(this.parameters_matcher){
      if(this.parameters_matcher.match(args)){
        this.invocation_count += 1;
        return true;
      }
      else{
        return false;
      }
    }
    else{
      this.invocation_count += 1;
      return true;
    }
  },
  next_return_value: function() {
    var return_vals_length = this.return_values.length;
    if( return_vals_length == 1 ){
      return this.return_values[0];
    }
    else if( return_vals_length > 1 ){
      var return_indxed = this.invocation_count-1;
      if(return_indxed > return_vals_length-1){
        return this.return_values[return_vals_length-1];
      }
      else{
        return this.return_values[return_indxed];
      }
    }
  },
  run_callbacks: function(args) {
    if(this.callback){
      this.callback();
    }
    var len = this.callback_arguments.length;
    for(var i=0; i<len; i++){
      args[this.callback_arguments[i]]();
    }
  },
  verify: function(){
    this.valid = true;
    this.local_report = [];

    if(this.cardinality.verify(this.invocation_count)){
      this.set_valid(true);
      this.add_report('PASS '+this.cardinality.inspect() + this.expected_params_report() + ' invoked '+this.cardinality.times(this.invocation_count));
    }
    else{
      this.set_valid(false);
      this.add_report('FAIL wrong number of invocations, '+this.cardinality.inspect() + this.expected_params_report() + ' invoked '+this.cardinality.times(this.invocation_count));
    }

    if(this.parameters_matcher){
      var param_report = this.parameters_matcher.report();
      if(param_report === true){
        this.set_valid(true);
      }
      else{
        this.set_valid(false);
        this.add_report('FAIL '+param_report);
      }
    }
    return(this.is_valid());
  },
  expected_params_report: function() {
    if(this.parameters_matcher){
      return ' with(' + this.parameters_matcher.list_parameters(this.parameters_matcher.expected_parameters) + ')';
    }
    else{
      return '';
    }
  },
  set_valid: function(valid) {
    if(this.valid !== false){
      this.valid = valid;
    }
  },
  is_valid: function() {
    return this.valid;
  },
  report: function(){
    return this.local_report.join("\r\n");
  },
  add_report: function(report){
    this.local_report.push(report);
  }
};
/*global jsMocha: false */
jsMocha.ExpectationList = function() {
  this.expectations = {};
};

jsMocha.ExpectationList.prototype = {

  add: function(mock, method_name, options){
    options = options || { type: 'mock' };
    var expectation = new jsMocha.Expectation(mock, method_name);
    var local_expectation = this.find_or_create(method_name);
    this.store_local_expectation(local_expectation, expectation, options);
    this.store_mocked_object(local_expectation, mock);
    this.replace_method(mock, method_name, local_expectation, options);
    return expectation;
  },
  find_or_create: function(name){
    if(!this.expectations[name]){
      this.expectations[name] = { expectations: { mock: [], spy: [], stub: [] }, obj: null, original_method: null, invocation_count: 0 };
    }
    return this.expectations[name];
  },
  store_local_expectation: function(local_expectation, expectation, options){
    local_expectation.expectations[options.type].push(expectation); // stubs always need to be last in the array
  },
  store_mocked_object: function(expectation, obj) {
    if(expectation.obj === null){
      expectation.obj = obj;
    }
  },
  replace_method: function(mock, method_name, expectation, options) {
    var self = this;
    if(expectation.original_method === null){
      expectation.original_method = mock[method_name];
    }
   mock[method_name] = function(){
     jsMocha.console.log("JSMOCHA INFO: method invoked with the parameters:");
     jsMocha.console.log(jsMocha.utility.extend(true, [], arguments));
     expectation.invocation_count += 1;
     var matched_expectation = self.check_for_matches(expectation.expectations.mock, arguments);
     if(matched_expectation === false){
       matched_expectation = self.check_for_matches(expectation.expectations.spy, arguments);
     }
     if(matched_expectation === false){
       matched_expectation = self.check_for_matches(expectation.expectations.stub, arguments);
     }
     if(matched_expectation !== false && matched_expectation.should_return_something()){
       return matched_expectation.next_return_value();
     }
     if(options.type == 'spy'){
       expectation.original_method.apply(mock, arguments);
     }
   };
  },
  check_for_matches: function(expectations, args){
    var len = expectations.length;
    for(var i = 0; i < len; i++){
      if(expectations[i].match(args)){
        expectations[i].run_callbacks(args);
        return expectations[i]; // parameter match was found, return the expectation
      }
    }
    return false;
  },
  verify_all: function(){
    var results = [];
    for(var key in this.expectations){
      if (this.expectations.hasOwnProperty(key)) {
        jsMocha.console.log("JSMOCHA INFO: total invocations: "+this.expectations[key].invocation_count);
        results = this.verify_each(this.expectations[key].expectations.mock, results);
        results = this.verify_each(this.expectations[key].expectations.spy, results);
        results = this.verify_each(this.expectations[key].expectations.stub, results);
      }
    }
    return this.all_passed(results);
  },
  verify_each: function(expectations, results){
    var len = expectations.length;
    for(var i = 0; i < len; i++){
      results.push(expectations[i].verify());
    }
    return results;
  },
  all_passed: function(array){
    var len = array.length;
    for(var i=0; i < len; i++){
      if(array[i] === false){
        return false;
      }
    }
    return true;
  },
  reports: function(){
    var results = [];
    for(var key in this.expectations){
      if (this.expectations.hasOwnProperty(key)) {
        results.push("object: " + this.get_name(this.expectations[key].obj) + '.' + key);
        results.push("INFO called " + this.expectations[key].invocation_count + " time(s)");
        results = this.reports_for_each(this.expectations[key].expectations.mock, results);
        results = this.reports_for_each(this.expectations[key].expectations.spy, results);
        results = this.reports_for_each(this.expectations[key].expectations.stub, results);
      }
    }
    return "\r\n"+results.join("\r\n");
  },
  reports_for_each: function(expectations, results){
    var len = expectations.length;
    for(var i = 0; i < len; i++){
      results.push(expectations[i].report());
    }
    return results;
  },
  restore_all: function(){
    for(var key in this.expectations){
      if (this.expectations.hasOwnProperty(key)) {
        this.restore(key, this.expectations[key]);
      }
    }
  },
  restore: function(method_name, expectation){
    expectation.obj[method_name] = expectation.original_method;
  },
  get_name: function(mock) {
     var funcNameRegex = /function (.{1,})\(/;
     var results = (funcNameRegex).exec((mock).constructor.toString());
     return (results && results.length > 1) ? results[1] : "";
  }
};
/*global jsMocha: false */
var Match = {

  is_a_method_of: function(method){
    for(var meth in Match){
      if(method === Match[meth]){
        return true;
      }
    }
  },

  a_string: function(o){
    return typeof o === Match.STRING;
  },

  an_array: function(o) {
    return Match.type(o) === Match.ARRAY;
  },

  a_boolean: function(o) {
    return typeof o === Match.BOOLEAN;
  },

  a_function: function(o) {
    return Match.type(o) === Match.FUNCTION;
  },

  a_date: function(o) {
    return Match.type(o) === Match.DATE;
  },

  is_null: function(o) {
    return o === null;
  },

  a_number: function(o) {
    return typeof o === Match.NUMBER && isFinite(o);
  },

  an_object: function(o, failfn) {
    return (o && (typeof o === Match.OBJECT || (!failfn && Match.a_function(o)))) || false;
  },

  is_undefined: function(o) {
    return typeof o === Match.UNDEFINED;
  },

  type: function(o) {
    jsMocha.console.warn();
    jsMocha.console.warn(Match.TYPES[typeof o]);
    jsMocha.console.warn(Match.TYPES[Match.TOSTRING.call(o)]);
    return Match.TYPES[typeof o] || Match.TYPES[Match.TOSTRING.call(o)] || (o ? Match.OBJECT : Match.NULL);
  }
};

Match.ARRAY     = 'array';
Match.BOOLEAN   = 'boolean';
Match.DATE      = 'date';
Match.ERROR     = 'error';
Match.FUNCTION  = 'function';
Match.NUMBER    = 'number';
Match.NULL      = 'null';
Match.OBJECT    = 'object';
Match.REGEX     = 'regexp';
Match.STRING    = 'string';
Match.TOSTRING  = Object.prototype.toString;
Match.UNDEFINED = 'undefined';

Match.TYPES = {
  'undefined'         : Match.UNDEFINED,
  'number'            : Match.NUMBER,
  'boolean'           : Match.BOOLEAN,
  'string'              : Match.STRING,
  '[object Function]' : Match.FUNCTION,
  '[object RegExp]'   : Match.REGEX,
  '[object Array]'    : Match.ARRAY,
  '[object Date]'     : Match.DATE,
  '[object Error]'    : Match.ERROR
};
/*global jsMocha: false */
Mock = function(object, force) {
  var mock = object || {};
  if(this.already_mocked(mock)){
    return mock;
  }
  this.expectations = new jsMocha.ExpectationList();
  if(this.check_for_clashes(mock) && !force){
    throw new Error("Cannot mock object, function names clash!!");
  }
  var type = typeof(mock);
  var type2 = Object.prototype.toString.call(object);
  if((type === 'function' || type === 'object') && (type2 !== '[object Date]' && type2 !== '[object Array]')) {
    this.add_methods_to_object(mock);
  } else {
    throw new Error("Cannot mock something of type: " + typeof(mock));
  }
  this.mock = mock;
  Mock.mocked_objects.push(mock);
  return mock;
};

Mock.mocked_objects = [];

Mock.mockerize = function(){
  Object.prototype.expects = function(method_name){
    if(Mock.is_real_call(arguments)){ return Mock.mock_from_expects(this, method_name); }
  };
  Function.prototype.expects = function(method_name){
    if(Mock.is_real_call(arguments)){ return Mock.mock_from_expects(this, method_name); }
  };
  Object.prototype.stubs = function(method_name){
    if(Mock.is_real_call(arguments)){ return Mock.mock_from_stubs(this, method_name); }
  };
  Function.prototype.stubs = function(method_name){
    if(Mock.is_real_call(arguments)){ return Mock.mock_from_stubs(this, method_name); }
  };
  Object.prototype.spies = function(method_name){
    if(Mock.is_real_call(arguments)){ return Mock.mock_from_spies(this, method_name); }
  };
  Function.prototype.spies = function(method_name){
    if(Mock.is_real_call(arguments)){ return Mock.mock_from_spies(this, method_name); }
  };
};

Mock.is_real_call = function(args){
  return args.length == 1 && typeof(args[0]) == 'string';
};

Mock.mock_from_expects = function(obj, method_name){
  var m = new Mock(obj, true);
  return obj.expects(method_name);
};

Mock.mock_from_stubs = function(obj, method_name){
  var m = new Mock(obj, true);
  return obj.stubs(method_name);
};

Mock.mock_from_spies = function(obj, method_name){
  var m = new Mock(obj, true);
  return obj.spies(method_name);
};

Mock.teardown_all = function(){
  var l = Mock.mocked_objects.length;
  for(var i = 0; i < l; i++){
    if(typeof Mock.mocked_objects[i].jsmocha !== 'undefined'){
      Mock.mocked_objects[i].jsmocha.teardown(true);
    }
  }
  Mock.mocked_objects = [];
};

Mock.remove_from_mocked_objects = function(obj){
  var l = Mock.mocked_objects.length;
  for(var i = 0; i < l; i++){
    if(Mock.mocked_objects[i] === obj){
      Mock.mocked_objects.splice(i,1);
      return;
    }
  }
};

Mock.prototype = {
  reservedNames: ['expects', 'stubs', 'spies', 'jsmocha'],

  already_mocked: function(object) {
    return object.jsmocha ? true : false;
  },
  check_for_clashes: function(object) {
    for( var property in object ){
      if(this.in_array(property, this.reservedNames)){
        return true;
      }
    }
  },
  in_array: function(subject, array){
    var len = array.length;
    for(var i = 0; i < len; i++){
      if(subject == array[i]){
        return true;
      }
    }
    return false;
  },
  add_methods_to_object: function(object, stub) {
    object.jsmocha = this;
    object.stubs = function(method_name){
      var expectation = this.jsmocha.expectations.add(this, method_name, { type: 'stub' });
      expectation.at_least(0);
      return expectation;
    };
    object.expects = function(method_name){
      return this.jsmocha.expectations.add(this, method_name);
    };
    object.spies = function(method_name){
      return this.jsmocha.expectations.add(this, method_name, { type: 'spy' });
    };
  },
  verify: function(){
    var result = this.expectations.verify_all();
    return result;
  },
  report: function(){
    var reports = this.expectations.reports();
    this.teardown();
    return reports;
  },
  teardown: function(skip_remove){
    if(!skip_remove){ Mock.remove_from_mocked_objects(this.mock); }
    this.expectations.restore_all();
    delete this.mock.expects;
    delete this.mock.stubs;
    delete this.mock.spies;
    delete this.mock.jsmocha;
  }
};
/*global jsMocha: false */
jsMocha.ParametersMatcher = function(expected_parameters) {
  this.expected_parameters = expected_parameters;
  this.serialize_stack_limit = 4;
  this.invocations = [];
};

jsMocha.ParametersMatcher.prototype = {

  valid: function() {
    var len = this.invocations.length;
    if(len < 1){
      return false;
    }
    for(var i = 0; i < len; i++){
      if(this.invocations[i] === false){
        return false;
      }
    }
    return true;
  },
  match: function(actual_parameters) {
    this.actual_parameters = actual_parameters;
    if(this.block_given()){
      var match = this.block(actual_parameters);
      if(match){
        this.invocations.push(true);
        return true;
      }
      else{
        return false;
      }
    }
    else{
      return this.parameters_match(actual_parameters);
    }
  },
  parameters_match: function(actual_parameters) {
    var len = this.expected_parameters.length;
    for(var i = 0; i <= len; i++){
      if(Match.is_a_method_of(this.expected_parameters[i])){
        jsMocha.console.warn("not running regular matcher");
        if(!this.expected_parameters[i](actual_parameters[i])){
          return false;
        }
      }else if(!this.equal(this.expected_parameters[i], actual_parameters[i])){
        return false;
      }
    }
    this.invocations.push(true);
    return true;
  },
  equal: function(expected, actual, recursion_level) {
    recursion_level = recursion_level || 0;
    if(recursion_level > this.serialize_stack_limit){
      jsMocha.console.warn('object too complex to fully match');
      return true;
    }
    jsMocha.console.warn("running regular matcher");
    if(expected instanceof Array) {
      for(var i = 0; i < actual.length; i++) {
        if(!this.equal(expected[i], actual[i], (recursion_level+1))){ return false; }
      }
      return actual.length == expected.length;
    } else if (Object.prototype.toString.call(expected) == "[object Date]") {
      return expected.valueOf() == actual.valueOf();
    } else if (expected instanceof Object) {
      for (var key in expected){
        if(actual[key] !== undefined){
          if(key != 'expects' && key != 'spies' && key != 'stubs' && key){
            if(!this.equal(expected[key], actual[key], (recursion_level+1))){
              return false;
            }
          }else{
            return true;
          }
        }else{
          return false;
        }
      }
      for (var key in actual){
        if(expected[key] !== undefined){
          if(!this.equal(expected[key], actual[key], (recursion_level+1))){ return false; }
        }else{
          return false;
        }
      }
      return true;
    }else{
      return expected == actual;
    }
  },
  block_given: function() {
    if(this.expected_parameters.length == 1 && this.is_function(this.expected_parameters[0]) && !Match.is_a_method_of(this.expected_parameters[0])){
      this.block = this.expected_parameters[0];
      return true;
    }
    else{
      return false;
    }
  },
  is_function: function(o) {
    return typeof o == 'function' || Object.prototype.toString.call(o) == '[object Function]' ? true : false;
  },
  report: function() {
    if(this.valid() || this.invocations.length < 1) {
      return true;
    }
    else{
      var msg = '';
      if(this.block_given()){
        msg += "received (";
      }
      else{
        msg += "expected (";
        msg += this.list_parameters(this.expected_parameters);
        msg += ") but got (";
      }
      msg += this.list_parameters(this.actual_parameters);
      msg += ")";
      return msg;
    }
  },
  list_parameters: function(parameters) {
    if(parameters){
         var a = [];
         var len = parameters.length;
         for(var i = 0; i < len; i++){
           a.push(this.serialize(parameters[i], 0));
         }
         return a.join(', ');
        }
  },
  serialize: function(obj, recursion_level) {
    if(recursion_level > this.serialize_stack_limit){
      return 'object too complex to fully display';
    }
    if(obj === null){return 'null';}
    switch (typeof obj){
      case 'number':
      case 'boolean':
      case 'function':
        return obj;

      case 'string':
        return '"' + obj + '"';

      case 'object':
        var str;
        if (typeof obj.toSource !== 'undefined' && typeof obj.callee === 'undefined'){
          str = obj.toSource();
          return str.substring(1,str.length-1);
        }
        else{
          var a = [];
          if (obj.constructor === Array || typeof obj.callee !== 'undefined'){
            var len = obj.length - 1;
            for(var i = 0; i < len; i++) { a.push(this.serialize(obj[i], (recursion_level+1))); }
            a.push(this.serialize(obj[i], (recursion_level+1)));
            str = '[' + a.join(', ') + ']';
          }
          else{
            for(var key in obj) {
              if (obj.hasOwnProperty(key)) {
                a.push(key + ':' + this.serialize(obj[key], (recursion_level+1)));
              }
            }
            str = '{' + a.join(', ').replace(/\,$/, '') + '}';
          }
          return str;
        }

      default:
        return 'UNKNOWN';
    }
  }
};
/*global jsMocha: false */


jsMocha.utility = {

  isFunction: function( obj ) {
    return Object.prototype.toString.call(obj) === "[object Function]";
  },

  isArray: function( obj ) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  },

  isPlainObject: function( obj ) {
    if ( !obj || Object.prototype.toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval ) {
      return false;
    }

    if ( obj.constructor
      && !Object.prototype.hasOwnProperty.call(obj, "constructor")
      && !Object.prototype.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
      return false;
    }


    var key;
    for ( key in obj ) {}

    return key === undefined || Object.prototype.hasOwnProperty.call( obj, key );
  },

  extend: function() {
    var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

    if ( typeof target === "boolean" ) {
      deep = target;
      target = arguments[1] || {};
      i = 2;
    }

    if ( typeof target !== "object" && !jsMocha.utility.isFunction(target) ) {
      target = {};
    }

    for ( ; i < length; i++ ) {
      if ( (options = arguments[ i ]) != null ) {
        for ( name in options ) {
          src = target[ name ];
          copy = options[ name ];

          if ( target === copy ) {
            continue;
          }

          if ( deep && copy && ( jsMocha.utility.isPlainObject(copy) || jsMocha.utility.isArray(copy) ) ) {
            var clone = src && ( jsMocha.utility.isPlainObject(src) || jsMocha.utility.isArray(src) ) ? src
              : jsMocha.utility.isArray(copy) ? [] : {};

            target[ name ] = jsMocha.utility.extend( deep, clone, copy );

          } else if ( copy !== undefined ) {
            target[ name ] = copy;
          }
        }
      }
    }

    return target;
  }

};
