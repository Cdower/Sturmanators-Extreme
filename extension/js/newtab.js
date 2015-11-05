"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VERBOSE = true;

var Domain = (function () {
  function Domain(options) {
    _classCallCheck(this, Domain);

    this.domain = options.domain;
    this.template = null;
    this.productivity = options.productivity == undefined ? options.productivity : 0;
    this.visits = options.visits;
    this.history = {};
  }

  /**** TEST DUMMY DATA ****/

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

var exampleDomains = [{
  domain: "domain.com",
  visits: 58,
  lastSevenDays: null,
  productivity: 2
}, {
  domain: "bomb.com",
  visits: 68,
  lastSevenDays: null,
  productivity: 1
}, {
  domain: "wombo.com",
  visits: 20,
  lastSevenDays: null,
  productivity: 1
}, {
  domain: "everybodywombo.com",
  visits: 90,
  lastSevenDays: null,
  productivity: 0
}];

var domains = [];
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  for (var _iterator = exampleDomains[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    var item = _step.value;

    var d = new Domain(item);
    domains.push(d);
  }

  /**** END TEST DUMMY DATA ****/
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

var renderGraph = function renderGraph() {
  if (VERBOSE) {
    console.debug("FUNCTION CALL: renderGraph()");
  }

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();

  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var plot = new Plottable.Plots.Line();
  plot.x(function (d) {
    return d.x;
  }, xScale);
  plot.y(function (d) {
    return d.y;
  }, yScale);

  var data = [{ "x": 0, "y": 1 }, { "x": 1, "y": 2 }, { "x": 2, "y": 4 }, { "x": 3, "y": 8 }];

  var dataset = new Plottable.Dataset(data);
  plot.addDataset(dataset);

  var chart = new Plottable.Components.Table([[yAxis, plot], [null, xAxis]]);

  chart.renderTo("svg#graph");
};

var fetchWikipediaArticle = function fetchWikipediaArticle(titleName) {

  var wikiArticleLink = "http://en.wikipedia.org/wiki/" + titleName;

  var container = $(".wikipedia-container");
  var templateString = wikipediaArticleTemplate.join("\n");
  var compiled = _.template(templateString);

  var handleData = function handleData(data) {

    var truncatedSummary = "not found";
    var imageUrl = "images/notfound.png";
    var title = "Article Could Not Be Fetched";
    var link = "http://www.google.com";

    console.log("Link is" + wikiArticleLink);

    if (data.summary != undefined) {
      if (data.summary.title != undefined) {
        title = data.summary.title;
      }

      if (data.summary.image != undefined) {
        imageUrl = data.summary.image;
      }

      if (data.summary.summary != undefined) {
        truncatedSummary = data.summary.summary.substring(0, 150) + "...";
      }
    }

    var rendered = compiled({
      title: title,
      imageUrl: imageUrl,
      summary: truncatedSummary,
      link: wikiArticleLink
    });

    container.append(rendered);
  };

  WIKIPEDIA.getData(wikiArticleLink, handleData);

  /****
  var wikiArticleLink = "http://en.wikipedia.org/wiki/Invasion_of_Normandy";
  var handleData = function(data){
      console.log(data.summary);
    console.log(data.summary.title);
      $("#title").html($("#title").html() + "" + data.summary.title);
      console.log(data.summary.summary);
    $("#summary").html($("#summary").html() + "" + data.summary.summary.substring(0,150) + "...");
      console.log(data.summary.image);
    //$("#image").html($("#image").html() + "" + data.summary.image);
    $("#put-image-here").attr("src", imageLink(data));
    $("#image-link").attr("href", wikiArticleLink);
  }
    function imageLink(data){
    return data.summary.image;
  }
    var handleError = function handleError(error){
    console.log(error);
  }
    */
};

var renderDomainList = function renderDomainList(domains, renderTargetSelector) {
  if (VERBOSE) {
    console.debug("FUNCTION: renderDomainList()", domains, renderTargetSelector);
  }

  //Somewhere in here throws the error
  /*Uncaught EvalError: Refused to evaluate a string as JavaScript because 'unsafe-eval' 
    is not an allowed source of script in the following Content Security Policy directive:
    "script-src 'self' blob: filesystem: chrome-extension-resource:".*/

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

var DOMLoaded = function DOMLoaded() {
  if (VERBOSE) {
    console.debug("EVENT: DOMContentLoaded");
  }
  renderGraph();

  //Print out the lists of productive, unproductive, and undefinied domains to the console
  console.log(getDomains());

  renderDomainList(domains, "ul.domain-list-productive");
  var articles = ["C++", "Entrepreneurship", "Google"];
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = articles[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var a = _step4.value;

      fetchWikipediaArticle(a);
      console.log("article is: " + a);
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

document.addEventListener('DOMContentLoaded', DOMLoaded, false);
