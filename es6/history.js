var VERBOSE = true;

//We need to return a couple of metrics:
//First we need to return the productivity of specified time slots.
//  This will be an array of objects with 5 paramaters 
//  Object:{startTime, duration, niceCount, naughtyCount, neutralCount}

//Second, we need a storted list of the most visited nice, naughty, and neutral domains
//This will return an object with 3 sorted lists of objects 
//  Object:{niceList[domain], naughtyList[domain], neutralList[domain]}
//  Object domain : {domain, count}

// Search history to find up to ten links that a user has typed in,
// and show those links in a popup.
function getDomains() {


  var endTime = (new Date).getTime();

  var domains = {
  niceList:[],
  naughtyList:[],
  neutralList:[]};

  //Test URL parsing using purl. This returns github.com to the console.
  //console.log(purl("https://github.com/allmarkedup/purl/tree/master/test").attr('host'));

  //This will run a search for each 30 minute slot in the last week
  //This code works so long as time is going forwards or stopped. 
  //If time goes backwards there will be errors

  //for debugging purposes we just search the last 12 hours of history
  //for(var timeSlot = 0; timeSlot< (24); timeSlot++){

  var startTime = (endTime-(1000*60*60*30*24));
  chrome.history.search({
        'text': '',              // Return every history item....
        'startTime': startTime,
        'endTime': endTime
    }, function(historyItems) {
    // For each history item, get details on all visits.

    //console.log(historyItems);

    //3 arrays that hold the naughty, and nice URLs.
    //at some point we'll move this to persistant storage

    var naughtyDomains = ["facebook.com", "buzzfeed.com", "reddit.com"];
    var niceDomains = ["wikipedia","news.ycombinator","stackoverflow"];

    //Returns true if a url contains one of the domains in a list
    var isListed = function(url, list) {
      for(var domain in list){
        if(url.indexOf(list[domain]) > -1) return true;
      }
      return false;
    }

    /*function domain(domain,count){
        this.domain = domain;
        this.count = count;
        this.increment = function(){count++;};
    }*/

    var urlToCount = {};
    //console.log(startTime);
    for(var visit in historyItems){
      var parsedURL = purl(historyItems[visit].url).attr('host');

      if (!urlToCount[parsedURL]) {
        urlToCount[parsedURL] = 0;
      }

      urlToCount[parsedURL]++;
    }

    console.log(urlToCount);

    for(var url in urlToCount){
      if(isListed(url, niceDomains)){
        domains.niceList.push({url:url, views:urlToCount[url]});
      }
      else if(isListed(url, naughtyDomains)){
        domains.naughtyList.push({url:url, views:urlToCount[url]}); 
      }
      else{
        domains.neutralList.push({url:url, views:urlToCount[url]});
      }
    }

    function domainSort(a,b){
      return b.views - a.views;
    };

    domains.niceList.sort(domainSort);
    domains.naughtyList.sort(domainSort);
    domains.neutralList.sort(domainSort);

  });
  return domains;

}

//End History pasing code
//======================================================================================