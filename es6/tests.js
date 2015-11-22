var TestDomains = [
  {
    domain: "domain.com",
    visits: 58,
    lastSevenDays: null,
    productivity: 2,
  },
  {
    domain: "bomb.com",
    visits: 68,
    lastSevenDays: null,
    productivity: 1,
  },
  {
    domain: "wombo.com",
    visits: 20,
    lastSevenDays: null,
    productivity: 1
  },
  {
    domain: "everybodywombo.com",
    visits: 90,
    lastSevenDays: null,
    productivity: 0
  },
];


var domains = [];
for(var item of TestDomains){
  var d = new Domain(item);
  domains.push(d);
}


var TestWikipediaArticles = [
  {
    name: "Invasion_of_Normandy",
    title: "Invasion of Normandy",
    snippet: "The Invasion of Normandy was the invasion by and establishment of Western Allied forces in Normandy, during Operation Overlord in 1944 during World Wa..."
  },
  {
    name: "Banana",
    title: "Banana",
    snippet: "A banana is an edible fruit, botanically a berry, produced by several kinds of large herbaceous flowering plants in the genus Musa. (In some countries..."
  },
  {
    name: "Arthur_Tedder,_1st_Baron_Tedder",
    title: "Arthur Tedder, 1st Baron Tedder",
    snippet: "Marshal of the Royal Air Force Arthur William Tedder, 1st Baron Tedder GCB (11 July 1890 – 3 June 1967) was a senior British air force commander. He w..."
  }
];


var StartDependencyTests = function(){
  if($ == undefined){
    console.error("FAILED: jQuery dependency missing");
  }
  if(_ == undefined){
    console.error("FAILED: Underscore dependency missing");
  }
  if(WIKIPEDIA == undefined){
    console.error("FAILED: Wikipedia.js dependency missing");
  }
  if(Plottable == undefined){
    console.error("FAILED: Plottable dependency missing");
  }
}


var testAPICall = function(response){
  var error = 0;
  returnObj = {
    name: undefined,
    title: undefined,
    snippet: undefined
  };

  if(response == undefined){
    console.error("FAILED: API response is missing");
    error = 1;
    return returnObj;
  }

  if(response.summary == undefined){
    console.error("FAILED: Malformed API response");
    error = 1;
  }

  if(response.summary.title == undefined){
    console.error("FAILED: Malformed API response");
    error = 1;
  }

  if(response.summary.summary == undefined){
    console.error("FAILED: Malformed API response");
    error = 1;
  }

  if(!error){
    console.debug("SUCCESS: API formatting OK");
  }

  return returnObj;
}


var StartAPITests = function(testArticles, testTarget){
  console.debug("Starting API tests...");

  var i = 0;
  for(var article of testArticles){
    console.debug("Fetching: " + article.name);
    fetchWikipediaArticle(article.name, renderWikiData, testTarget);
  }

  console.debug("Waiting 5000ms for API calls to complete...");
  setTimeout(function(){
    testArticlesOnDOM(testArticles, testTarget);
  }, 5000);
}


var testArticlesOnDOM = function(articles, target){
  var error = 0;
  var children = target.children();

  var i = 0;
  for(var child of children){
    var jChild = $(child);
    if(jChild.find(".wikipedia-article-summary").text() != articles[i].snippet){
      console.error("FAILED: Article summary is incorrect");
      error = 1;
    }
    if(jChild.find(".wikipedia-article-title").text().trim() != articles[i].title){

      console.error("FAILED: Article title is incorrect");
      error = 1;
    }
    i++;
  }

  if(!error){
    console.debug("SUCCESS: API responses OK");
    console.debug("SUCCESS: DOM manipulation OK");
  } else {
    console.error("Info: API failure may be due to slow connection...");
  }
}


var StartDomainTests = function(){
}


var StartGraphingTests = function(){
}


var StartAllTests = function(){
  console.debug("Starting test suite...");
  console.debug("Test render target...");
  var TestRenderTarget = $("body").append("<div class='__testTarget'></div>");
  console.debug(TestRenderTarget);
  if(TestRenderTarget == undefined){
    console.error("FAILED: TestRenderTarget spawn unsuccessful.");
  } else {
    console.debug("SUCCESS: TestRenderTarget spawn OK");
  }

  StartDependencyTests();
  StartAPITests(TestWikipediaArticles, $(".__testTarget"));
  StartDomainTests();
  StartGraphingTests();
}


document.addEventListener('DOMContentLoaded', StartAllTests, false);

