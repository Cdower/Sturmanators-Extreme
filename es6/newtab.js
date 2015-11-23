var VERBOSE = true;
var TESTING = true;

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
    colorScale.range(["#FF00FF", "#FF0000", "#0000FF"]);

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
    colorScale.range(["#0000FF", "#FF0000", "#FF00FF"]);
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
    legend.renderTo("svg#graph")
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

var DOMLoaded = function() {
  if(VERBOSE){ console.debug("EVENT: DOMContentLoaded"); }

  renderDomainList(domains, "ul.domain-list-productive");

  var articles = ["Invasion_of_Normandy", "Banana", "Arthur_Tedder,_1st_Baron_Tedder"];

  for(var a of articles){
    fetchWikipediaArticle(a, renderWikiData, $(".wikipedia-container"));
  }

  renderDomainList(domains, "ul.domain-list-productive");

  var endTime = (new Date).getTime();
  //The time 12 hours ago. Milleseconds * seconds * minutes * hours
  var startTime = endTime - (1000*60*60*12);
  
  getTimeSlots(startTime,endTime, function(domains){console.log(domains);});
  getDomains(startTime,endTime, function(domains){console.log(domains);
                                                  renderGraph(domains);});
}

document.addEventListener('DOMContentLoaded', DOMLoaded, false);
