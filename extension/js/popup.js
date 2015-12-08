'use strict';

chrome.tabs.getSelected(null, function(tab){
    console.log(tab.url);
    var cleanUrl = purl(tab.url).attr('host');

    document.getElementById("domainName").innerHTML = "<h3>" + cleanUrl + "</h3>";
});

/*
document.addEventListener('DOMContentLoaded', function () {
  var checkPageButton = document.getElementById('checkPage');
  checkPageButton.addEventListener('click', function () {

    chrome.tabs.getSelected(null, function (tab) {
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
}, false);*/