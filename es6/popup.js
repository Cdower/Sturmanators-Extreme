chrome.tabs.getSelected(null, function(tab){
    console.log(tab.url);
    var cleanUrl = purl(tab.url).attr('host');

    document.getElementById("domainName").innerHTML = "<h3>" + cleanUrl + "</h3>";

    //addDomainClassificationListeners(tab.url);
});


var addDomainClassificationListeners = function(url){
  var controls = $(".controls");
  var controlProductive= controls.children(".control-item-productive");
  var controlUnproductive= controls.find(".control-item-unproductive");
  var controlUnknown = controls.find(".control-item-unknown");

  controlProductive.on("click", function(e){
    setClassification(url, 2);
  });

  controlUnproductive.on("click", function(e){
    setClassification(url, 1);
  });

  controlUnknown.on("click", function(e){
    setClassification(url, 0);
  });
}

var setClassification = function(domain, classification){
  console.debug("FUNCTION: setClassification()", domain, classification);

  //This takes time, so refreshing the list of domains is done in a callback
  setNiceness(domain, classification)
}

/*document.addEventListener('DOMContentLoaded', function() {
  var checkPageButton = document.getElementById('checkPage');
  checkPageButton.addEventListener('click', function() {

    chrome.tabs.getSelected(null, function(tab) {
      d = document;

      var f = d.createElement('form');
      f.action = 'http://minerva.tech';
      f.method = 'post';
      var i = d.createElement('input');
      i.type = 'hidden';
      i.name = 'url';
      i.value = tab.url;
      f.appendChild(i);
      d.body.appendChild(f);
      f.submit();
    });
  }, false);
}, false);
*/