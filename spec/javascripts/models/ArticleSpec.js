/*global App */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

describe("Article", function() {

  var articleData = {
    "image"       : "http://google.com/image_url.jpg",
    "title"       : "Something happened in the business world!",
    "source"      : "The Guardian",
    "id"          : "123456",
    "category"    : "Business",
    "link"        : "http://news.google.com",
    "updated"     : "",
    "description" : "The article"
  };

  describe("ordering", function() {

    var article1, article2, article3, articles;

    beforeEach(function() {
      // create some articles
      article1 = new App.Article($.extend({}, articleData, {
        "id": "1",
        "updatedTime": new Date("Mon, 10 Jun 2012 14:23:36 GMT").getTime()
      }));
      article2 = new App.Article($.extend({}, articleData, {
        "id": "2",
        "updatedTime": new Date("Mon, 10 Jun 2012 09:23:36 GMT").getTime()
      }));
      article3 = new App.Article($.extend({}, articleData, {
        "id": "3",
        "updatedTime": new Date("Mon, 11 Jun 2012 14:23:36 GMT").getTime()
      }));
      articles = new App.Articles([article1, article2, article3]);
    });

    it("should order the articles with the newest first", function() {
      var dates = articles.pluck("updatedTime");
      expect(dates[0]).toEqual(article3.get("updatedTime"));
      expect(dates[1]).toEqual(article1.get("updatedTime"));
      expect(dates[2]).toEqual(article2.get("updatedTime"));
    });

  });

  describe("processing", function(){
    var articles;

    beforeEach(function() {
      jasmine.Clock.useMock();
      articles = new App.Articles();
      App.canBackgroundProcess = true;
    });

    describe("startProcessing", function() {

      it("should call getFromFeed after the default interval", function() {
        spyOn(articles, 'getFromFeed');
        articles.startProcessing();
        jasmine.Clock.tick(60000);
        expect(articles.getFromFeed).toHaveBeenCalledWith(App.googleFeed);
      });

      it("should call getFromFeed after the specified interval", function() {
        spyOn(articles, 'getFromFeed');
        articles.startProcessing(9000000000);
        jasmine.Clock.tick(60000);
        expect(articles.getFromFeed).not.toHaveBeenCalled();
        jasmine.Clock.tick(9000000000);
        expect(articles.getFromFeed).toHaveBeenCalledWith(App.googleFeed);
      });

      it("should clear any previous interval that have been set", function() {
        spyOn(window, 'clearInterval');
        articles.startProcessing();
        expect(window.clearInterval).not.toHaveBeenCalled();
        articles.startProcessing();
        expect(window.clearInterval).toHaveBeenCalled();
      });

    });

    describe("getFromFeed", function() {
      var request, scienceFeedXml, technologyFeedXml;

      beforeEach(function() {
        scienceFeedXml    = jasmine.getFixtures().read('science-feed.rss');
        technologyFeedXml = jasmine.getFixtures().read('technology-feed.rss');
        App.settings = new Mock();
        new Mock(App.settings);
        App.settings.stubs('get').returns(['science', 'world']);

        new Mock(App.googleFeed);
        App.googleFeed.stubs('uri').returns('https://news.google.com');

        spyOn(articles, 'trigger');

        jasmine.Ajax.useMock();
      });

      it("call trigger articleGrabbedWithImage for each article that is processed", function() {
        runs(function() {
          articles.getFromFeed(App.googleFeed);
          request = mostRecentAjaxRequest();
          request.response({ 'status': 200, 'responseText': scienceFeedXml });
        });

        runs(function() {
          expect(articles.trigger.calls.length).toEqual(10);
          for(var i = 0; i <= articles.trigger.calls.length-1; i++){
            expect(articles.trigger.calls[i].args[0]).toEqual('articleGrabbedWithImage');
          }
        });
      });

      it("call trigger articleGrabbed for articles with no images", function() {
        runs(function() {
          articles.getFromFeed(App.googleFeed);
          request = mostRecentAjaxRequest();
          request.response({ 'status': 200, 'responseText': technologyFeedXml });
        });

        runs(function() {
          expect(articles.trigger.calls.length).toEqual(10);
          expect(articles.trigger.calls[0].args[0]).toEqual('articleGrabbed');
        });
      });

      it("should load all feeds when no category is passed", function() {
        App.googleFeed.expects('uri').twice();
        articles.getFromFeed(App.googleFeed);
      });

      it("should only load the feed for the category that it passed", function() {
        App.googleFeed.expects('uri').once();
        articles.getFromFeed(App.googleFeed, 'science');
      });

      it("should not process any articles when canBackgroundProcess is false", function() {
        spyOn(App.settings, 'get');

        App.canBackgroundProcess = false;
        articles.getFromFeed(App.googleFeed);
        expect(App.settings.get).not.toHaveBeenCalled();
      });

    });

  });

}); // end describe
