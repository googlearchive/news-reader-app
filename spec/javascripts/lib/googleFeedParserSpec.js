/*global App: false, Mock: false */

// ### Authors
// Jamie Dyer <http://kernowsoul.com>
// ### Last changed
// 2012-06-23

describe("Google Feed Parser", function() {

  describe("pareseItem", function() {

    var sampleItem = {
      "description": '<table border="0" cellpadding="2" cellspacing="7" style="vertical-align:top;"><tr><td width="80" align="center" valign="top"><font style="font-size:85%;font-family:arial,sans-serif"><a href="http://news.google.com/news/url?sa=t&amp;fd=R&amp;usg=AFQjCNGut7swXmO7qiI0K0kH3IsrqBOPFg&amp;url=http://www.europe1.fr/France/Le-forcene-etait-un-chomeur-perturbe-1118607/"><img src="//nt0.ggpht.com/news/tbn/5JJEAThGRTPdZM/0.jpg" alt="" border="1" width="80" height="53" /><br /><font size="-2">Europe1</font></a></font></td><td valign="top" class="j"><font style="font-size:85%;font-family:arial,sans-serif"><br /><div style="padding-top:0.8em;"><img alt="" height="1" width="1" /></div><div class="lh"><a href="http://news.google.com/news/url?sa=t&amp;fd=R&amp;usg=AFQjCNGut7swXmO7qiI0K0kH3IsrqBOPFg&amp;url=http://www.europe1.fr/France/Le-forcene-etait-un-chomeur-perturbe-1118607/"><b>Le forcené était un chômeur &quot;perturbé&quot;</b></a><br /><font size="-1"><b><font color="#6f6f6f">Europe1</font></b></font><br /><font size="-1">PORTRAIT - Il a retenu jeudi en otage un vigile de Météo-France avant l&#39;intervention du GIPN. L&#39;homme qui a semé la panique jeudi matin au siège de Météo-France, près de Toulouse, en prenant un vigile en otage a été identifié. Il s&#39;agit d&#39;un cariste de <b>...</b></font><br /><font size="-1"><a href="http://news.google.com/news/url?sa=t&amp;fd=R&amp;usg=AFQjCNElCYl9r9kL9LZi_BwF2wfGneIboQ&amp;url=http://www.ouest-france.fr/ofdernmin_-Le-preneur-d-otage-de-Meteo-France-tres-gravement-blesse-_6346-2084656-fils-tous_filDMA.Htm">Le preneur d&#39;otage de Météo France très gravement blessé</a><font size="-1" color="#6f6f6f"><nobr>Ouest-France</nobr></font></font><br /><font size="-1"><a href="http://news.google.com/news/url?sa=t&amp;fd=R&amp;usg=AFQjCNHVQBQiZMdjU63ZhIrNsis96DLZFw&amp;url=http://tempsreel.nouvelobs.com/societe/20120607.FAP4457/meteo-france-le-preneur-d-otage-grievement-blesse-lors-de-l-intervention-du-gipn.html">Météo France: le preneur d&#39;otage grièvement blessé lors de l <b>...</b></a><font size="-1" color="#6f6f6f"><nobr>Le Nouvel Observateur</nobr></font></font><br /><font size="-1"><a href="http://news.google.com/news/url?sa=t&amp;fd=R&amp;usg=AFQjCNFuEk6g-5GP4cjVgd54dCyNuleTrA&amp;url=http://www.20minutes.fr/article/948633/forcene-retient-vigile-otage-chez-meteo-france-avant-etre-abattu">TOULOUSE - Un forcené retient un vigile en otage chez Météo-France <b>...</b></a><font size="-1" color="#6f6f6f"><nobr>20minutes.fr</nobr></font></font><br /><font size="-1" class="p"><a href="http://news.google.com/news/url?sa=t&amp;fd=R&amp;usg=AFQjCNH_-jqLI1XxnBWWTbGPKSmZWwfn4Q&amp;url=http://www.lavoixdunord.fr/france-monde/toulouse-un-forcene-retient-un-vigile-en-otage-plusieurs-ia0b0n498357"><nobr>La Voix du Nord</nobr></a></font><br /><font class="p" size="-1"><a class="p" href="http://news.google.com/news/story?ncl=dM9M4Lro3kxYiXMXLAg4iAWHJlAXM&amp;ned=fr&amp;topic=h"><nobr><b>337 autres articles&nbsp;&raquo;</b></nobr></a></font></div></font></td></tr></table>',
      "category": "Business",
      "id": "tag:news.google.com,2005:cluster=17593651276701",
      "link": "http://news.google.com",
      "title": "A news story - The Guardian",
      "updated": "Thu, 07 Jun 2012 15:36:35 GMT"
    };

    it("should return an object suitable for the Article model", function() {
      var parsedItem = App.googleFeed.parseItem(sampleItem);
      expect(parsedItem.description).toEqual(sampleItem.description);
      expect(parsedItem.category).toEqual(sampleItem.category);
      expect(parsedItem.id).toEqual(sampleItem.id);
      expect(parsedItem.link).toEqual(sampleItem.link);
      expect(parsedItem.title).toEqual("A news story");
      expect(parsedItem.source).toEqual("The Guardian");
      expect(parsedItem.updated).toEqual(sampleItem.updated);
      expect(parsedItem.image).toEqual("http://nt0.ggpht.com/news/tbn/5JJEAThGRTPdZM/11.jpg");
    });

    it("should handle titles with no source", function() {
      sampleItem.title = "A news story";
      var parsedItem = App.googleFeed.parseItem(sampleItem);

      expect(parsedItem.title).toEqual("A news story");
      expect(parsedItem.source).toEqual("");
    });

    it("should handle images with no src attribute", function() {
      sampleItem.description = '<img alt="" height="1" width="1" />';
      var parsedItem = App.googleFeed.parseItem(sampleItem);

      expect(parsedItem.image).toEqual("");
    });

    it("should handle items with no image tags", function() {
      sampleItem.description = '';
      var parsedItem = App.googleFeed.parseItem(sampleItem);

      expect(parsedItem.image).toEqual("");
    });

    it("should handle images with unexpected uri formats", function() {
      var parsedItem;
      sampleItem.description = '<p><img src="http://nt0.ggpht.com/news/tbn/5JJEAThGRTPdZM/11.jpg" /></p>';
      parsedItem = App.googleFeed.parseItem(sampleItem);

      expect(parsedItem.image).toEqual("http://nt0.ggpht.com/news/tbn/5JJEAThGRTPdZM/11.jpg");

      sampleItem.description = '<p><img src="//nt0.ggpht.com/news/tbn/5JJEAThGRTPdZM/00.jpg" /></p>';
      parsedItem = App.googleFeed.parseItem(sampleItem);

      expect(parsedItem.image).toEqual("http://nt0.ggpht.com/news/tbn/5JJEAThGRTPdZM/00.jpg");
    });

  });

  describe("uri", function() {

    beforeEach(function() {
      chrome.i18n = {};
      new Mock(chrome.i18n);
    });

    it("should return the feed uri for the category when no language is passed", function() {
      chrome.i18n.expects('getMessage')
        .times(2)
        .returns('http://news.google.com/news?output=rss', 'us');
      var uri = App.googleFeed.uri({ "category": "business" });
      expect(uri).toEqual('http://news.google.com/news?output=rss&ned=us&topic=b');
    });

    it("should return the feed uri for the category when a language is passed", function() {
      chrome.i18n.expects('getMessage')
        .once()
        .returns('http://news.google.com/news?output=rss');
      var uri = App.googleFeed.uri({ "category": "business", "language": "uk" });
      expect(uri).toEqual('http://news.google.com/news?output=rss&ned=uk&topic=b');
    });

  });

});
