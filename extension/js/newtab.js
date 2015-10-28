"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VERBOSE = true;
var $ = Sizzle;

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

//=============================================================
//Begin history parsing code

// Search history to find up to ten links that a user has typed in,
// and show those links in a popup.
function buildTypedUrlList() {
  // To look for history items visited in the last week,
  // subtract a week of microseconds from the current time.
  var endTime = new Date().getTime();

  // Track the number of callbacks from chrome.history.getVisits()
  // that we expect to get.  When it reaches zero, we have all results.
  var numRequestsOutstanding = 0;

  //This will run a search for each 30 minute slot in the last week
  //This code works so long as time is going forwards or stopped.
  //If time goes backwards there will be errors

  //for debugging purposes we just search the last 12 hours of history
  for (var timeSlot = 0; timeSlot < 24; timeSlot++) {

    var startTime = endTime - 1000 * 60 * 30;
    chrome.history.search({
      'text': '', // Return every history item....
      'startTime': startTime,
      'endTime': endTime
    }, function (historyItems) {
      // For each history item, get details on all visits.

      console.log(historyItems);

      /*
      for (var i = 0; i < historyItems.length; ++i) {
      var url = historyItems[i].url;
      var processVisitsWithUrl = function(url) {
        // We need the url of the visited item to process the visit.
        // Use a closure to bind the url into the callback's args.
        return function(visitItems) {
          processVisits(url, visitItems);
        };
      };
      chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
      numRequestsOutstanding++;
      }
      if (!numRequestsOutstanding) {
      onAllVisitsProcessed();
      }*/
    });
    endTime = startTime;
  }
  // Maps URLs to a count of the number of times the user typed that URL into
  // the omnibox.
  var urlToCount = {};

  //3 arrays that hold the naughty, and nice URLs.
  //at some point we'll move this to persistant storage

  //var naughtyList = ["facebook", "buzzfeed", "reddit"];
  //var niceList = ["wikipedia","news.ycombinator","stackoverflow"];

  //Returns true if a url contains one of the domains in a list
  var isListed = function isListed(url, list) {
    for (domain in list) {
      if (url.indexOf(domain) > -1) return false;
    }
    return true;
  };

  // Callback for chrome.history.getVisits().  Counts the number of
  // times a user visited a URL by typing the address.
  var processVisits = function processVisits(url, visitItems) {
    for (var i = 0, ie = visitItems.length; i < ie; ++i) {
      // Ignore items unless the user typed the URL.

      if (!urlToCount[url]) {
        urlToCount[url] = 0;
      }

      urlToCount[url]++;
    }

    // If this is the final outstanding call to processVisits(),
    // then we have the final results.  Use them to build the list
    // of URLs to show in the popup.
    if (! --numRequestsOutstanding) {
      onAllVisitsProcessed();
    }
  };

  // This function is called when we have the final list of URls to display.
  var onAllVisitsProcessed = function onAllVisitsProcessed() {
    // Get the top scorring urls.
    var urlArray = [];
    for (var url in urlToCount) {
      urlArray.push(url);
    }

    // Sort the URLs by the number of times the user typed them.
    urlArray.sort(function (a, b) {
      return urlToCount[b] - urlToCount[a];
    });

    console.log(urlArray.slice(0, 10));
  };
}

//End History pasing code
//======================================================================================

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
  buildTypedUrlList();
  renderDomainList(domains, "ul.domain-list-productive");
};

document.addEventListener('DOMContentLoaded', DOMLoaded, false);