"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var VERBOSE = true;

//=====================================================================
//Begin helper functions

//Initial domains to populate storage with.
var naughtyDomains = ["facebook.com", "buzzfeed.com", "reddit.com", "www.youtube.com", "i.imgur.com"];
var niceDomains = ["wikipedia", "news.ycombinator", "stackoverflow", "lms9.rpi.edu", "docs.google.com", "mail.google.com"];

//Function that returns true if an item in a list is contained in url
var isListed = function isListed(url, list) {
  for (var domain in list) {
    if (url.indexOf(list[domain]) > -1) return true;
  }
  return false;
};

//End helper functions
//=====================================================================

//=====================================================================
//This block of functions handles storing the naughty and nice domains in persitent memory.

/*A function that returns whether a domain is nice, naughty, or undefined
0:Undefined
1:Naughty
2:Nice
*/
var getNiceness = function getNiceness(url, callback) {

  url = purl(url).attr('host');

  console.log(url);

  chrome.storage.local.get([url], callback);

  return 0;
};

/*A function that sets a domain to either nice, naughty, or undefined
0:Undefined
1:Naughty
2:Nice
*/
var setNiceness = function setNiceness(url, niceness) {

  url = purl(url).attr('host');

  chrome.storage.local.set(_defineProperty({}, url, niceness));
};

//End Domain List Functions
//=====================================================================

//We need to return a couple of metrics:
//First we need to return the productivity of specified time slots.
//  This will be an array of objects with 5 paramaters
//  Object:{startTime, duration, niceCount, naughtyCount, neutralCount}

function getTimeSlots(startTime, endTime, callback) {
  //Return object containing the three domain lists
  var domains = {
    niceCount: 0,
    naughtyCount: 0,
    neutralCount: 0 };

  //Search for any url in the alotted time
  chrome.history.search({
    'text': '', // Return every history item....
    'startTime': startTime,
    'endTime': endTime
  }, function (historyItems) {
    // historyItems in an array of historyItem results

    //console.log(historyItems);

    //Create an object to hold each domain as an attribute with the visitcount as a value
    var urlToCount = {};

    //Count the visits of each domain
    for (var visit in historyItems) {

      //Use the purl library to extract the domain from a url
      //https://github.com/allmarkedup/purl
      var parsedURL = purl(historyItems[visit].url).attr('host');

      //Count the visits to a url
      if (!urlToCount[parsedURL]) {
        urlToCount[parsedURL] = 0;
      }
      urlToCount[parsedURL]++;
    }

    //Raw visit info for debugging purposes
    //console.log(urlToCount);

    /*For each of the urls add them and their view counter to their 
     respective productive or unproductive lists */
    for (var url in urlToCount) {
      if (isListed(url, niceDomains)) {
        //make an object with a url and views attribute and push it to the list.
        domains.niceCount += urlToCount[url];
      } else if (isListed(url, naughtyDomains)) {
        domains.naughtyCount += urlToCount[url];
      } else {
        domains.neutralCount += urlToCount[url];
      }
    }
    //console.log(domains);
    callback(domains);
  });

  //console.log(domains);
  //return domains;
}

//Second, we need a storted list of the most visited nice, naughty, and neutral domains
//This will return an object with 3 sorted lists of objects
//  Object:{niceList[domain], naughtyList[domain], neutralList[domain]}
//  Object domain : {domain, count}

function getDomains(startTime, endTime, callback) {

  //Return object containing the three domain lists
  var domains = [];

  //Test URL parsing using purl. This returns github.com to the console.
  //console.log(purl("https://github.com/allmarkedup/purl/tree/master/test").attr('host'));

  //Search for any url starting 12 hours ago
  chrome.history.search({
    'text': '', // Return every history item....
    'startTime': startTime,
    'endTime': endTime
  }, function (historyItems) {
    // historyItems in an array of historyItem results

    //console.log(historyItems);

    //Create an object to hold each domain as an attribute with the visitcount as a value
    var urlToCount = {};

    //Count the visits of each domain
    for (var visit in historyItems) {

      //Use the purl library to extract the domain from a url
      //https://github.com/allmarkedup/purl
      var parsedURL = purl(historyItems[visit].url).attr('host');
      //console.log(historyItems[visit]);
      //Count the visits to a url
      if (!urlToCount[parsedURL]) {
        urlToCount[parsedURL] = 0;
      }
      urlToCount[parsedURL]++;

      //This gives the total times a url was visited, but not the total times in our limited time slot.
      //historyItems[visit].visitCount;
    }

    //Raw visit info for debugging purposes
    //console.log(urlToCount);

    /*For each of the urls add them and their view counter to their 
     respective productive or unproductive lists */
    for (var url in urlToCount) {
      var productivityClass = 0;
      if (isListed(url, niceDomains)) {
        //make an object with a url and views attribute and push it to the list.
        productivityClass = 2;
      } else if (isListed(url, naughtyDomains)) {
        productivityClass = 1;
      }
      domains.push({ domain: url,
        visits: urlToCount[url],
        productivity: productivityClass });
    }

    //Simple sorting operator
    function domainSort(a, b) {
      return b.visits - a.visits;
    };

    //Sort each of the lists, putting the most viewed domains first.
    domains.sort(domainSort);
    //domains.naughtyList.sort(domainSort);
    //domains.neutralList.sort(domainSort);

    callback(domains);
  });
  //return domains;
}