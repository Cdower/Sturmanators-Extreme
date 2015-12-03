'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var VERBOSE = true;

//=====================================================================
//Begin helper functions

//Function that returns true if an item in a list is contained in url
var isListed = function isListed(url, list) {
  for (var domain in list) {
    if (url.indexOf(list[domain]) > -1) return true;
  }
  return false;
};

//Function to check if an object has any properties
/*Copied from here: 
  http://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object*/
function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) return false;
  }
  return true;
}
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
  //
  //Clean the url
  url = purl(url).attr('host');
  chrome.storage.local.get([url], callback.bind(url));

  return 0;
};

/*A function that sets a domain to either nice, naughty, or undefined
0:Undefined
1:Naughty
2:Nice
*/
var setNiceness = function setNiceness(url, niceness, callback) {

  //Clean the url
  url = purl(url).attr('host');

  chrome.storage.local.set(_defineProperty({}, url, niceness), callback);
};

/*This function writes a couple of predefined domains as productive or not 
  so that the "out of box experience" is more pleasant.

*/
var initializeDomains = function initializeDomains(callback) {

  //Initial domains to populate storage with.
  var naughtyDomains = ["facebook.com", "buzzfeed.com", "www.reddit.com", "www.youtube.com", "imgur.com", "sturmanators.slack.com"];
  var niceDomains = ["en.wikipedia.org", "news.ycombinator", "stackoverflow.com", "lms9.rpi.edu", "docs.google.com", "mail.google.com"];

  getNiceness("configured", function (preset) {
    //if (isEmpty(preset)) {
    console.log("Adding domains for the first time");

    setNiceness("configured", 0);

    for (var url in niceDomains) {
      setNiceness(niceDomains[url], 2);
    }
    for (var url in naughtyDomains) {
      setNiceness(naughtyDomains[url], 1);
    }
    //}

    //TODO: This doesn't quite wait until the above operations are done.
    callback();
  });
};

//End Domain List Functions
//=====================================================================

//We need a storted list of the most visited nice, naughty, and neutral domains

function getTimeSlots(startTime, endTime, callback) {
  getDomains(startTime, endTime, function (domains) {
    var counts = { niceCount: 0, naughtyCount: 0, neutralCount: 0 };

    /*
    0:Undefined
    1:Naughty
    2:Nice
    */
    for (var domain in domains) {
      if (domains[domain].productivity == 0) {
        counts.neutralCount += domains[domain].visits;
      } else if (domains[domain].productivity == 1) {
        counts.naughtyCount += domains[domain].visits;
      } else if (domains[domain].productivity == 2) {
        counts.niceCount += domains[domain].visits;
      }
    }

    callback(counts);
  });
}

function getDomains(startTime, endTime, callback) {

  //Return object containing the three domain lists
  var domains = [];

  //Search for any url starting 12 hours ago
  chrome.history.search({
    'text': '', // Return every history item....
    'startTime': startTime,
    'endTime': endTime
  }, function (historyItems) {

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

      /*This gives the total times a url was visited, but not the total times in our 
        limited time slot.*/
      //historyItems[visit].visitCount;
    }

    //Raw visit info for debugging purposes
    //console.log(urlToCount);

    /*For each of the urls add them and their view counter to their 
     respective productive or unproductive lists */
    var domainsToCount = Object.keys(urlToCount).length;

    /*Convert all of the visit items into domain items
      Check the productivity and jam them into domain items*/
    for (var url in urlToCount) {
      //This takes time, jump one callback in
      getNiceness(url, function (niceness) {

        //This is bound to the callback in getNiceness
        url = this;

        //Set the default "undefined" productivity
        var productiveValue = 0;
        //if there exists a defined productivity set that
        if (!isEmpty(niceness)) {
          productiveValue = niceness[url];
        }

        var visitCount = 0;
        if (typeof urlToCount[url] != "undefined") {
          visitCount = urlToCount[url];
        }

        //Add the domain formatted as a domain item         
        domains.push({ domain: url,
          visits: visitCount,
          productivity: productiveValue });

        //Decrement the count of remaining domains
        domainsToCount--;

        //Once all domains have been processed call the end function
        if (domainsToCount == 0) {
          onAllProcessedVisits();
        }
      });
    }

    var onAllProcessedVisits = function onAllProcessedVisits() {

      //Simple sorting operator
      function domainSort(a, b) {
        return b.visits - a.visits;
      };

      //Sort each of the lists, putting the most viewed domains first.
      domains.sort(domainSort);

      //Once we're done with all of the calculations call a function with the domainlist
      callback(domains);
    };
  });
}