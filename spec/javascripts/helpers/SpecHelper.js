// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

afterEach(function() {
  // after each spec verify all jsMocha expectations are satisfied
  $(Mock.mocked_objects).each(function(i, obj){
    expect(obj).toVerifyExpectations();
  });
});
