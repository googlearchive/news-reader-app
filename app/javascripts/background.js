// ### Authors
// Paul Kinlan
// ### Last changed
// 2012-06-23

// ## Overview
// This file is loaded by manifest.json and sets up a listener for `onLaunched` which is
// triggered when the application is launched. A window is then created for the app
// which loads in main.html and sets some positional options.

chrome.experimental.app.onLaunched.addListener(function() {
  var opts = {
    width: 1200,
    height: 600,
    left: 100,
    top: 100
  };
  chrome.app.window.create('main.html', opts);
  App.notificationsView.clearCounts();
});
