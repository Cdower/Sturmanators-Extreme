var VERBOSE = true;
var TESTING = false;

class Domain {
  constructor(options){
    this.domain = options.domain;
    this.template = null;
    this.productivity = options.productivity == undefined ? options.productivity : 0;
    this.visits = options.visits;
    this.history = {};
  }

  render(){
    var compiled = _.template(this.template);
    return compiled(this.toObject());
  }

  toObject(){
    var obj = {};
    obj.domain = this.domain;
    obj.productivity = this.productivity;
    return obj;
  }

  setTemplate(template){
    if(typeof template == "object"){ template = template.join("\n"); }
    this.template = template;
  }

  setHistory(historyObject){
  }

  isProductive(val){
    /* 0: UNKNOWN | 1: UNPRODUCTIVE | 2: PRODUCTIVE */
    if(val != undefined){ this.isProductive = val; }
    return this.isProductive;
  }
}

var rgb2hex = function(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

var getColorsFromDom = function(){
  var colors = [
    rgb2hex($("#color-productive").css("color")),
    rgb2hex($("#color-unproductive").css("color")),
    rgb2hex($("#color-unknown").css("color"))
  ]

  return colors;
}


//=============================================================
//Begin graph rendering code

//AnalyticsRender class
//Grooms list of domain objects for render by graphing methods
class AnalyticsRender{
  constructor(domains){
    this.categoryData = [{x: "Unknown", visits: 0}, {x: "Unproductive", visits: 0}, {x: "Productive", visits: 0}];
    for(item of domains){
        this.categoryData[item.productivity].visits += item.visits;
      }
  }

  /*  Renders a Bar graph from data processed by renderGraph
  *   Does not display or interact with time data at this time
  *   Assumes data is from all of time
  */
  renderBarGraph() {
    var colorScale = new Plottable.Scales.Color();
    colorScale.range(getColorsFromDom());

    var xScale = new Plottable.Scales.Category();
    var yScale = new Plottable.Scales.Linear();

    var xAxis = new Plottable.Axes.Category(xScale, "bottom");
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var baseVal = (this.categoryData[0].visits)/2;
    for(item of this.categoryData){
      if((item.visits/2) < baseVal){
          baseVal = (item.visits/2);
      }
    }

    var plot = new Plottable.Plots.Bar()
      .addDataset(new Plottable.Dataset(this.categoryData))
      .x(function(d) { return d.x; }, xScale)
      .y(function(d) { return d.visits; }, yScale)
      .animated(true)
      .attr("fill", function(d) { return d.visits; }, colorScale)
      .baselineValue(baseVal)
      .labelsEnabled(true);
    new Plottable.Components.Table([
      [yAxis,plot],
      [null,xAxis]
    ]).renderTo("svg#graph");
    window.addEventListener("resize", function() { plot.redraw(); });
  }

  /*
  *   Renders a Pie graph from data processed by renderGraph
  *   Does not display or interact with time data at this time
  *   Assumes data is from all of time
  */
  renderPieGraph() {
    var scale = new Plottable.Scales.Linear();
    var colorScale = new Plottable.Scales.Color();
    colorScale.range(getColorsFromDom());
    var legend = new Plottable.Components.Legend(colorScale)
    colorScale.domain([this.categoryData[2].x,this.categoryData[1].x,this.categoryData[0].x]);
    legend.xAlignment("left")
    legend.yAlignment("top");

    var plot = new Plottable.Plots.Pie()
    .addDataset(new Plottable.Dataset(this.categoryData))
    .sectorValue(function(d) { return d.visits; }, scale)
    .innerRadius(0)
    .attr("fill", function(d) { return d.x; }, colorScale)
    .outerRadius(60)
    .labelsEnabled(true)
    .renderTo("svg#graph");
    legend.renderTo("svg#legend")
    window.addEventListener("resize", function() { plot.redraw(); });
  }

}

/*
*   recieve data to render and decide what to render
*   renderGraph creates an AnalyticsRender object and tells it what to render and how based on data on input
*   ### Might change name to graphRenderManager to better fit its purpose once
*   currently takes AnalyticsRender class object, may change to create analyticsRender class object that calls history to request domain objects
*/
var renderGraph = function(domains) {
  if(VERBOSE){ console.debug("FUNCTION CALL: renderGraph()"); }
  var visual = new AnalyticsRender(domains);

  //watch buttons here
  visual.renderPieGraph();
  //visual.renderBarGraph();
}

//End graph rendering code
//======================================================================================

var constructWikiLink = function(title){
  return "http://en.wikipedia.org/wiki/" + title;
}

var renderWikiData = function(data, link, container){
  // Compile article template
  var templateString = wikipediaArticleTemplate.join("\n");
  var compiled = _.template(templateString);

  // Fallback cases for when API call fails
  var truncatedSummary = "Article could not be fetched...";
  var imageUrl = "images/notfound.png";
  var title = "";

  if(data.summary != undefined){
    if(data.summary.title != undefined){
      title = data.summary.title;
    }

    if(data.summary.image != undefined){
      imageUrl = data.summary.image;
    }

    if(data.summary.summary != undefined){
      truncatedSummary = data.summary.summary.substring(0,150) + "...";
    }
  }

  var rendered = compiled({
    title: title,
    imageUrl: imageUrl,
    summary: truncatedSummary,
    link: link
  });

  container.append(rendered);
}

var fetchWikipediaArticle = function(titleName, callback, container){

  var wikiArticleLink = constructWikiLink(titleName);

  WIKIPEDIA.getData(wikiArticleLink, function(data){
      callback(data, wikiArticleLink, container);
  });
}

var setClassification = function(domain, classification){
  console.debug("FUNCTION: setClassification()", domain, classification);
}

var renderDomainList = function(domains, renderTargetSelector){
  if(VERBOSE){ console.debug("FUNCTION: renderDomainList()", domains, renderTargetSelector); }

  var str = "";

  for(var d of domains){
    d.setTemplate(domainListingTemplate);
    str += d.render();
  }

  for(var n of $(renderTargetSelector)){
    n.innerHTML = str;
  }
}

var addDomainClassificationListeners = function(){
  var controls = $(".controls");
  var controlProductive= controls.children(".control-item-productive");
  var controlUnproductive= controls.find(".control-item-unproductive");
  var controlUnknown = controls.find(".control-item-unknown");

  controlProductive.on("click", function(e){
    var targetDomain = $(e.toElement).attr("data-domain");
    setClassification(targetDomain, 2);
  });

  controlUnproductive.on("click", function(e){
    var targetDomain = $(e.toElement).attr("data-domain");
    setClassification(targetDomain, 1);
  });

  controlUnknown.on("click", function(e){
    var targetDomain = $(e.toElement).attr("data-domain");
    setClassification(targetDomain, 0);
  });
}

var renderDomainLists = function(domains){
  if(VERBOSE){ console.debug("FUNCTION: renderDomainLists()", domains); }

  var productive = _.map(_.filter(domains, function(domain){ return domain.productivity == 2}), function(d, k){
    return new Domain(d);
  });

  var unproductive = _.map(_.filter(domains, function(domain){ return domain.productivity == 1}), function(d, k){
    return new Domain(d);
  });

  var unknown = _.map(_.filter(domains, function(domain){ return domain.productivity == 0}), function(d, k){
    return new Domain(d);
  });

  renderDomainList(productive, "ul.domain-list-productive");
  renderDomainList(unknown, "ul.domain-list-unknown");
  renderDomainList(unproductive, "ul.domain-list-unproductive");

  addDomainClassificationListeners();
}

var DOMLoaded = function() {
  if(VERBOSE){ console.debug("EVENT: DOMContentLoaded"); }

  var articles = ["Invasion_of_Normandy", "Banana", "Arthur_Tedder,_1st_Baron_Tedder"];

  for(var a of articles){
    fetchWikipediaArticle(a, renderWikiData, $(".wikipedia-container"));
  }

  var endTime = (new Date).getTime();
  //The time 12 hours ago. Milleseconds * seconds * minutes * hours
  var startTime = endTime - (1000*60*60*12);

  getTimeSlots(startTime, endTime, function(domains){console.log(domains);});
  getDomains(startTime, endTime, function(domains){
    renderGraph(domains);
    renderDomainLists(domains);
  });
}

document.addEventListener('DOMContentLoaded', DOMLoaded, false);
