"use strict";

var TestDomains = [{
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
  for (var _iterator = TestDomains[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    var item = _step.value;

    var d = new Domain(item);
    domains.push(d);
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

var TestWikipediaArticles = [{
  name: "Invasion_of_Normandy",
  title: "Invasion of Normandy",
  snippet: "The Invasion of Normandy was the invasion by and establishment of Western Allied forces in Normandy, during Operation Overlord in 1944 during World Wa..."
}, {
  name: "Banana",
  title: "Banana",
  snippet: "A banana is an edible fruit, botanically a berry, produced by several kinds of large herbaceous flowering plants in the genus Musa. (In some countries..."
}, {
  name: "Arthur_Tedder,_1st_Baron_Tedder",
  title: "Arthur Tedder, 1st Baron Tedder",
  snippet: "Marshal of the Royal Air Force Arthur William Tedder, 1st Baron Tedder GCB (11 July 1890 – 3 June 1967) was a senior British air force commander. He w..."
}];

var StartDependencyTests = function StartDependencyTests() {
  if ($ == undefined) {
    console.error("FAILED: jQuery dependency missing");
  }
  if (_ == undefined) {
    console.error("FAILED: Underscore dependency missing");
  }
  if (WIKIPEDIA == undefined) {
    console.error("FAILED: Wikipedia.js dependency missing");
  }
  if (Plottable == undefined) {
    console.error("FAILED: Plottable dependency missing");
  }
};

var testAPICall = function testAPICall(response) {
  var error = 0;
  returnObj = {
    name: undefined,
    title: undefined,
    snippet: undefined
  };

  if (response == undefined) {
    console.error("FAILED: API response is missing");
    error = 1;
    return returnObj;
  }

  if (response.summary == undefined) {
    console.error("FAILED: Malformed API response");
    error = 1;
  }

  if (response.summary.title == undefined) {
    console.error("FAILED: Malformed API response");
    error = 1;
  }

  if (response.summary.summary == undefined) {
    console.error("FAILED: Malformed API response");
    error = 1;
  }

  if (!error) {
    console.debug("SUCCESS: API formatting OK");
  }

  return returnObj;
};

var StartAPITests = function StartAPITests(testArticles, testTarget) {
  console.debug("Starting API tests...");

  var i = 0;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = testArticles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var article = _step2.value;

      console.debug("Fetching: " + article.name);
      fetchWikipediaArticle(article.name, renderWikiData, testTarget);
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

  console.debug("Waiting 5000ms for API calls to complete...");
  setTimeout(function () {
    testArticlesOnDOM(testArticles, testTarget);
  }, 5000);
};

var testArticlesOnDOM = function testArticlesOnDOM(articles, target) {
  var error = 0;
  var children = target.children();

  var i = 0;
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var child = _step3.value;

      var jChild = $(child);
      if (jChild.find(".wikipedia-article-summary").text() != articles[i].snippet) {
        console.error("FAILED: Article summary is incorrect");
        error = 1;
      }
      if (jChild.find(".wikipedia-article-title").text().trim() != articles[i].title) {

        console.error("FAILED: Article title is incorrect");
        error = 1;
      }
      i++;
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

  if (!error) {
    console.debug("SUCCESS: API responses OK");
    console.debug("SUCCESS: DOM manipulation OK");
  } else {
    console.error("Info: API failure may be due to slow connection...");
  }
};

var StartDomainTests = function StartDomainTests() {};

var StartGraphingTests = function StartGraphingTests() {};

var StartAllTests = function StartAllTests() {
  console.debug("Starting test suite...");
  console.debug("Test render target...");
  var TestRenderTarget = $("body").append("<div class='__testTarget'></div>");
  console.debug(TestRenderTarget);
  if (TestRenderTarget == undefined) {
    console.error("FAILED: TestRenderTarget spawn unsuccessful.");
  } else {
    console.debug("SUCCESS: TestRenderTarget spawn OK");
  }

  StartDependencyTests();
  StartAPITests(TestWikipediaArticles, $(".__testTarget"));
  StartDomainTests();
  StartGraphingTests();
};

if (TESTING) {
  document.addEventListener('DOMContentLoaded', StartAllTests, false);
}