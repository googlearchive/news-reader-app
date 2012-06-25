// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

beforeEach(function() {
  this.addMatchers({
    toVerifyExpectations: function() {
      if(this.actual.jsmocha.verify()){
        this.actual.jsmocha.teardown();
        return true;
      }else{
        this.message = function() {
          return this.actual.jsmocha.report();
        };
        return false;
      }
    }
  });
});
