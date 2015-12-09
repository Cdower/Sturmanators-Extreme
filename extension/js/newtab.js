"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VERBOSE = true;
var TESTING = false;

var Domain = (function () {
  function Domain(options) {
    _classCallCheck(this, Domain);

    this.domain = options.domain;
    this.template = null;
    this.productivity = options.productivity == undefined ? options.productivity : 0;
    this.visits = options.visits;
    this.history = {};
  }

  _createClass(Domain, [{
    key: "render",
    value: function render() {
      var compiled = _.template(this.template);
      return compiled(this.toObject());
    }
  }, {
    key: "toObject",
    value: function toObject() {
      var obj = {};
      obj.domain = this.domain;
      obj.productivity = this.productivity;
      return obj;
    }
  }, {
    key: "setTemplate",
    value: function setTemplate(template) {
      if (typeof template == "object") {
        template = template.join("\n");
      }
      this.template = template;
    }
  }, {
    key: "setHistory",
    value: function setHistory(historyObject) {}
  }, {
    key: "isProductive",
    value: function isProductive(val) {
      /* 0: UNKNOWN | 1: UNPRODUCTIVE | 2: PRODUCTIVE */
      if (val != undefined) {
        this.isProductive = val;
      }
      return this.isProductive;
    }
  }]);

  return Domain;
})();

var rgb2hex = function rgb2hex(rgb) {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  function hex(x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
};

var getColorsFromDom = function getColorsFromDom() {
  var colors = [rgb2hex($("#color-productive").css("color")), rgb2hex($("#color-unproductive").css("color")), rgb2hex($("#color-unknown").css("color"))];

  return colors;
};

/*
* Parse Date from retrieved time
*/
var parseDate = function parseDate(time) {
  var unparsed = Date(time).split(' ');
  var parsed = unparsed[1].concat("/").concat(unparsed[2]).concat(": ").concat(unparsed[4]);
  return parsed;
};

//=============================================================
//Begin graph rendering code

//AnalyticsRender class
//Grooms list of domain objects for render by graphing methods

var AnalyticsRender = (function () {
  function AnalyticsRender(domains) {
    _classCallCheck(this, AnalyticsRender);

    var prodUnprodUnknownColors = getColorsFromDom();
    this.categoryData = [{ x: "Unknown", visits: 0 }, { x: "Unproductive", visits: 0 }, { x: "Productive", visits: 0 }];
    for (item in domains) {
      this.categoryData[domains[item].productivity].visits += domains[item].visits;
    }
  }

  /*
  *   recieve data to render and decide what to render
  *   renderGraph creates an AnalyticsRender object and tells it what to render and how based on data on input
  *   ### Might change name to graphRenderManager to better fit its purpose once
  *   currently takes AnalyticsRender class object, may change to create analyticsRender class object that calls history to request domain objects
  */

  /*  Renders a Bar graph from data processed by renderGraph
  *   Does not display or interact with time data at this time
  *   Assumes data is from all of time
  */

  _createClass(AnalyticsRender, [{
    key: "renderBarGraph",
    value: function renderBarGraph() {
      var colorScale = new Plottable.Scales.Color();
      colorScale.range(this.prodUnprodUnknownColors);
      var xScale = new Plottable.Scales.Category();
      var yScale = new Plottable.Scales.Linear();

      var xAxis = new Plottable.Axes.Category(xScale, "bottom");
      var yAxis = new Plottable.Axes.Numeric(yScale, "left");

      var baseVal = this.categoryData[0].visits / 2;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.categoryData[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          item = _step.value;

          if (item.visits / 2 < baseVal) {
            baseVal = item.visits / 2;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"]) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var plot = new Plottable.Plots.Bar().addDataset(new Plottable.Dataset(this.categoryData)).x(function (d) {
        return d.x;
      }, xScale).y(function (d) {
        return d.visits;
      }, yScale).animated(true).attr("fill", function (d) {
        return d.visits;
      }, colorScale).baselineValue(baseVal).labelsEnabled(true);
      new Plottable.Components.Table([[yAxis, plot], [null, xAxis]]).renderTo("svg#graph_id");
      window.addEventListener("resize", function () {
        plot.redraw();
        xAxis.redraw();
        yAxis.redraw();
      });
    }

    /*
    * Renders Stacked bar graph for n timeperiods
    */

  }, {
    key: "renderStackedBarGraph",
    value: function renderStackedBarGraph() {
      var xScale = new Plottable.Scales.Category(); //x is a date
      var yScale = new Plottable.Scales.Linear();
      var colorScale = new Plottable.Scales.Color();
      colorScale.range(this.prodUnprodUnknownColors);

      var xAxis = new Plottable.Axes.Category(xScale, "bottom");
      var yAxis = new Plottable.Axes.Numeric(yScale, "left");

      var productive = [];
      var unproductive = [];
      var unknown = [];
      var fakeArrayForBuildingDates = [];
      //logic for time from the past week
      //The time 12 hours ago. Milleseconds * seconds * minutes * hours
      var twelveHours = 1000 * 60 * 60 * 12;
      //Millseconds * seconds * minutes * hours * days
      var oneWeek = 1000 * 60 * 60 * 24 * 7;
      var currentTime = new Date().getTime();
      var startTime = currentTime - oneWeek;
      var endTime = startTime + twelveHours;

      /*for(let i=0; i<14;i++){
        var n = i*twelveHours + endTime;
        var timeLabel = Date(n).split(' ')[1].concat("/").concat(Date(n).split(' ')[2]).concat(": ").concat(Date(n).split(' ')[4]);
        productive.push({ x: timeLabel, y: 0 });
        unproductive.push({ x: timeLabel, y: 0 });
        unknown.push({ x: timeLabel, y: 0 });
        //console.log( timeLabel, i);
      }*/

      var completion = 2;

      for (var i = 0; i < 14; i++) {
        var m = startTime + i * twelveHours;
        var n = endTime + i * twelveHours;
        getTimeSlots(m, n, function (domains) {
          var timeLabel = parseDate(endTime + fakeArrayForBuildingDates.length * twelveHours);
          productive.push({ x: fakeArrayForBuildingDates.length, y: domains.niceCount });
          unproductive.push({ x: fakeArrayForBuildingDates.length, y: domains.naughtyCount });
          unknown.push({ x: fakeArrayForBuildingDates.length, y: domains.neutralCount });
          //console.log(productive, fakeArrayForBuildingDates.length);
          fakeArrayForBuildingDates.push(0);

          completion++;
          if (completion == i) {
            plotStackedGraph();
          }
        });
        //let timeLabel = parseDate(n);
        //productive[i].x = timeLabel;
        //unproductive[i].x = timeLabel;
        //unknown[i].x = timeLabel;
      }
      /*while(startTime < currentTime){
              getTimeSlots(startTime,endTime, function(domains){
          var timeLabel = parseDate(endTime);
          productive.push({ x: timeLabel, y: domains.niceCount });
          unproductive.push({ x: timeLabel, y: domains.naughtyCount });
          unknown.push({ x: timeLabel, y: domains.neutralCount } );
          console.log(productive, timeLabel);
        });
        startTime += twelveHours;
        endTime += twelveHours;
      }*/

      //var for productive, unproductive, and unknown with x as a date/time y is number of visits
      /*
      var struct? array with time. { time: "", productive: , unproductive: , unknown: };
      */
      /*var productive = [{ x: "12/2", y: 1 }, { x: "12/4", y: 3 }, { x: 3, y: 2 },
                     { x: 4, y: 4 }, { x: 5, y: 3 }, { x: 6, y: 5 }, 
                     {x: 7, y: 4},{x:8 , y: 9}, {x:10, y: 3}, {x:11, y: 5}, {x:12, y: 2}, {x:13, y: 7}, {x:14, y: 3}];
      var unproductive = [{ x: "12/2", y: 2 }, { x: "12/4", y: 1 }, { x: 3, y: 2 },
                       { x: 4, y: 1 }, { x: 5, y: 2 }, { x: 6, y: 1 }, 
                       {x: 7, y: 5}, {x:8 , y: 8}, {x:10, y: 2}, {x:11, y: 3}, {x:12, y: 4}, {x:13, y: 3}, {x:14, y: 6}];
      var unknown = [{ x: "12/2", y: 2 }, { x: "12/4", y: 1 }, { x: 3, y: 2 },
                       { x: 4, y: 1 }, { x: 5, y: 2 }, { x: 6, y: 1 }, 
                       {x: 7, y: 6}, {x:8 , y: 4}, {x:10, y: 6}, {x:11, y: 6}, {x:12, y: 3}, {x:13, y: 5}, {x:14, y: 2}];
      */
      var plotStackedGraph = function plotStackedGraph() {
        var plot = new Plottable.Plots.StackedBar().addDataset(new Plottable.Dataset(productive).metadata(5)).addDataset(new Plottable.Dataset(unproductive).metadata(3)).addDataset(new Plottable.Dataset(unknown).metadata(1)).x(function (d) {
          return d.x;
        }, xScale).y(function (d) {
          return d.y;
        }, yScale).labelsEnabled(true).animated(true).attr("fill", function (d, i, dataset) {
          return dataset.metadata();
        }, colorScale);
        new Plottable.Components.Table([[yAxis, plot], [null, xAxis]]).renderTo("svg#graph_id");

        window.addEventListener("resize", function () {
          plot.redraw();
          xAxis.redraw();
          yAxis.redraw();
        });
      };
    }

    /*
    *   Renders a Pie graph from data processed by renderGraph
    *   Does not display or interact with time data at this time
    *   Assumes data is from all of time
    */
  }, {
    key: "renderPieGraph",
    value: function renderPieGraph() {
      var scale = new Plottable.Scales.Linear();
      var colorScale = new Plottable.Scales.Color();
      colorScale.range(this.prodUnprodUnknownColors);
      var legend = new Plottable.Components.Legend(colorScale);
      colorScale.domain([this.categoryData[2].x, this.categoryData[1].x, this.categoryData[0].x]);
      legend.xAlignment("left");
      legend.yAlignment("top");

      var plot = new Plottable.Plots.Pie().addDataset(new Plottable.Dataset(this.categoryData)).sectorValue(function (d) {
        return d.visits;
      }, scale).innerRadius(0).attr("fill", function (d) {
        return d.x;
      }, colorScale).labelsEnabled(true).renderTo("svg#graph_id");
      legend.renderTo("svg#graph_id");
      //.outerRadius(210)
      window.addEventListener("resize", function () {
        plot.redraw();
      });
    }
  }]);

  return AnalyticsRender;
})();

var renderGraph = function renderGraph(domains, graph) {
  if (VERBOSE) {
    console.debug("FUNCTION CALL: renderGraph()");
  }
  var visual = new AnalyticsRender(domains);

  //watch buttons here
  if (graph == 1) {
    visual.renderPieGraph();
  } else if (graph == 2) {
    visual.renderStackedBarGraph();
  } else {
    visual.renderBarGraph();
  }

  var svg = $("#graph_id");
  var button1 = $("#pie");
  button1.click(function () {
    svg.empty();
    visual.renderPieGraph();
  });
  var button2 = $("#bar");
  button2.click(function () {
    svg.empty();
    visual.renderBarGraph();
  });
  var button3 = $("#time");
  button3.click(function () {
    svg.empty();
    visual.renderStackedBarGraph();
  });
};

//End graph rendering code
//======================================================================================

var constructWikiLink = function constructWikiLink(title) {
  return "http://en.wikipedia.org/wiki/" + title;
};

var truncate = function truncate(string, length) {
  if (string.length < length) {
    return string;
  }
  return string.substring(0, length) + "...";
};

var renderWikiData = function renderWikiData(data, link, container) {
  // Compile article template
  var templateString = wikipediaArticleTemplate.join("\n");
  var compiled = _.template(templateString);

  // Fallback cases for when API call fails
  var truncatedSummary = "Article could not be fetched...";
  var imageUrl = "images/notfound.png";
  var title = "";

  if (data.summary != undefined) {
    if (data.summary.title != undefined) {
      title = truncate(data.summary.title, 25);
    }

    if (data.summary.image != undefined) {
      imageUrl = data.summary.image;
    }

    if (data.summary.summary != undefined) {
      truncatedSummary = truncate(data.summary.summary, 150);
    }
  }

  var rendered = compiled({
    title: title,
    imageUrl: imageUrl,
    summary: truncatedSummary,
    link: link
  });

  container.append(rendered);
};

var fetchWikipediaArticle = function fetchWikipediaArticle(titleName, callback, container) {

  var wikiArticleLink = constructWikiLink(titleName);

  WIKIPEDIA.getData(wikiArticleLink, function (data) {
    callback(data, wikiArticleLink, container);
  });
};

var setClassification = function setClassification(domain, classification) {
  console.debug("FUNCTION: setClassification()", domain, classification);

  //This takes time, so refreshing the list of domains is done in a callback
  setNiceness(domain, classification, function () {
    var svg = $("#graph_id");
    svg.empty();
    //After changing the classification of a domain refresh the list
    var endTime = new Date().getTime();
    //The time 12 hours ago. Milleseconds * seconds * minutes * hours
    var startTime = endTime - 1000 * 60 * 60 * 24 * 7;
    //Get the domain list, and then when it is done write the results to the screen
    getDomains(startTime, endTime, function (domains) {
      renderGraph(domains);
      renderDomainLists(domains);
    });
  });
};

var renderDomainList = function renderDomainList(domains, renderTargetSelector) {
  if (VERBOSE) {
    console.debug("FUNCTION: renderDomainList()", domains, renderTargetSelector);
  }

  var str = "";

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = domains[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var d = _step2.value;

      d.setTemplate(domainListingTemplate);
      str += d.render();
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = $(renderTargetSelector)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var n = _step3.value;

      n.innerHTML = str;
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
        _iterator3["return"]();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }
};

var addDomainClassificationListeners = function addDomainClassificationListeners() {
  var controls = $(".controls");
  var controlProductive = controls.children(".control-item-productive");
  var controlUnproductive = controls.find(".control-item-unproductive");
  var controlUnknown = controls.find(".control-item-unknown");

  controlProductive.on("click", function (e) {
    var targetDomain = $(e.toElement).attr("data-domain");
    setClassification(targetDomain, 2);
  });

  controlUnproductive.on("click", function (e) {
    var targetDomain = $(e.toElement).attr("data-domain");
    setClassification(targetDomain, 1);
  });

  controlUnknown.on("click", function (e) {
    var targetDomain = $(e.toElement).attr("data-domain");
    setClassification(targetDomain, 0);
  });
};

var renderDomainLists = function renderDomainLists(domains) {
  if (VERBOSE) {
    console.debug("FUNCTION: renderDomainLists()", domains);
  }

  var productive = _.map(_.filter(domains, function (domain) {
    return domain.productivity == 2;
  }), function (d, k) {
    return new Domain(d);
  });

  var unproductive = _.map(_.filter(domains, function (domain) {
    return domain.productivity == 1;
  }), function (d, k) {
    return new Domain(d);
  });

  var unknown = _.map(_.filter(domains, function (domain) {
    return domain.productivity == 0;
  }), function (d, k) {
    return new Domain(d);
  });

  renderDomainList(productive, "ul.domain-list-productive");
  renderDomainList(unknown, "ul.domain-list-unknown");
  renderDomainList(unproductive, "ul.domain-list-unproductive");

  addDomainClassificationListeners();
};

var setArticleCategory = function setArticleCategory(category) {
  $(".wikipedia-container").html("");
  var articles = _.sample(FeaturedArticles, 3);

  if (category == "technology") {
    articles = _.sample(TechArticles, 3);
  } else if (category == "finance") {
    articles = _.sample(FinanceArticles, 3);
  } else if (category == "politics") {
    articles = _.sample(PoliticalArticles, 3);
  }

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = articles[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var a = _step4.value;

      fetchWikipediaArticle(a, renderWikiData, $(".wikipedia-container"));
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
        _iterator4["return"]();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }
};

var addArticleCategoryListeners = function addArticleCategoryListeners() {
  var buttonTechnology = $("#technology");
  var buttonFinance = $("#finance");
  var buttonPolitics = $("#politics");

  buttonTechnology.on("click", function () {
    setArticleCategory("technology");
  });

  buttonFinance.on("click", function () {
    setArticleCategory("finance");
  });

  buttonPolitics.on("click", function () {
    setArticleCategory("politics");
  });
};

var DOMLoaded = function DOMLoaded() {
  if (VERBOSE) {
    console.debug("EVENT: DOMContentLoaded");
  }

  addArticleCategoryListeners();
  setArticleCategory(null);

  //This has to be blocking so that the domains can populate before evaluating the history
  initializeDomains(function () {});

  var endTime = new Date().getTime();
  //The time 12 hours ago. Milleseconds * seconds * minutes * hours * days
  var oneWeek = 1000 * 60 * 60 * 24 * 7;
  var startTime = endTime - oneWeek;
  //Get the domain list, and then when it is done write the results to the screen
  getDomains(startTime, endTime, function (domains) {
    renderGraph(domains);
    renderDomainLists(domains);
  });
};

document.addEventListener('DOMContentLoaded', DOMLoaded, false);