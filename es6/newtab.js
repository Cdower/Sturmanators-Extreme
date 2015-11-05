var VERBOSE = true;

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


/**** TEST DUMMY DATA ****/
var exampleDomains = [
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
for(var item of exampleDomains){
  var d = new Domain(item);
  domains.push(d);
}
//*/
/**** END TEST DUMMY DATA ****/


//var data = [{ val: 2, legend: "Productive" }, { val: 6, legend: "Unknown" }, { val: 4, legend: "Unproductive" }];

var renderGraph = function(domains) { ///recieve data to render and decide what to render
  if(VERBOSE){ console.debug("FUNCTION CALL: renderGraph()"); }
  var categoryData = [{x: "Unknown", visits: 0, value: 0}, {x: "Unproductive", visits: 0, value: 1}, {x: "Productive", visits: 0, value: 2}];
  for(item of domains){
    categoryData[item.productivity].visits += item.visits;
  }
  //renderPieGraph(categoryData);
  renderBarGraph(categoryData);
}

var renderBarGraph = function (data) {
  console.log(data);
  var colorScale = new Plottable.Scales.Color();
  colorScale.range(["#FF00FF", "#FF0000", "#0000FF"]);

  var xScale = new Plottable.Scales.Category();
  var yScale = new Plottable.Scales.Linear();

  var xAxis = new Plottable.Axes.Category(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var baseVal = (data[0].visits)/2;
  for(item of data){
    if((item.visits/2) < baseVal){
        baseVal = (item.visits/2);
    }
  }

  var plot = new Plottable.Plots.Bar()
    .addDataset(new Plottable.Dataset(data))
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

var renderPieGraph = function (data) {
  var scale = new Plottable.Scales.Linear();
  var colorScale = new Plottable.Scales.InterpolatedColor();
  colorScale.range(["#BDCEF0", "#5279C7"]);
  var legend = new Plottable.Components.Legend(colorScale)
  colorScale.domain([data[0].visits,data[1].visits,data[2].visits]);
  console.log(colorScale.domain());
  legend.xAlignment("left")
  legend.yAlignment("top");
  
  var plot = new Plottable.Plots.Pie()
  .addDataset(new Plottable.Dataset(data))
  .sectorValue(function(d) { return d.visits; }, scale)
  .innerRadius(0)
  .attr("fill", function(d) { return d.visits; }, colorScale)
  .outerRadius(60)
  .renderTo("svg#graph");
  legend.renderTo("svg#graph")
  window.addEventListener("resize", function() { plot.redraw(); });
}

var fetchWikipediaArticle = function(titleName){

  var wikiArticleLink = "http://en.wikipedia.org/wiki/" + titleName;


  var container = $(".wikipedia-container");
  var templateString = wikipediaArticleTemplate.join("\n");
  var compiled = _.template(templateString);

  var handleData = function(data){

    var truncatedSummary = "not found";
    var imageUrl = "images/notfound.png";
    var title = "Article Could Not Be Fetched";

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
      summary: truncatedSummary
    });

    container.append(rendered);
  }

  WIKIPEDIA.getData(wikiArticleLink, handleData);

  /****
  var wikiArticleLink = "http://en.wikipedia.org/wiki/Invasion_of_Normandy";
  var handleData = function(data){

    console.log(data.summary);
    console.log(data.summary.title);

    $("#title").html($("#title").html() + "" + data.summary.title);

    console.log(data.summary.summary);
    $("#summary").html($("#summary").html() + "" + data.summary.summary.substring(0,150) + "...");

    console.log(data.summary.image);
    //$("#image").html($("#image").html() + "" + data.summary.image);
    $("#put-image-here").attr("src", imageLink(data));
    $("#image-link").attr("href", wikiArticleLink);
  }

  function imageLink(data){
    return data.summary.image;
  }

  var handleError = function handleError(error){
    console.log(error);
  }

  */
}

var renderDomainList = function(domains, renderTargetSelector){
  if(VERBOSE){ console.debug("FUNCTION: renderDomainList()", domains, renderTargetSelector); }

  //Somewhere in here throws the error
  /*Uncaught EvalError: Refused to evaluate a string as JavaScript because 'unsafe-eval' 
    is not an allowed source of script in the following Content Security Policy directive:
    "script-src 'self' blob: filesystem: chrome-extension-resource:".*/

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
  console.log(getDomains());
  renderGraph(exampleDomains);
  renderDomainList(domains, "ul.domain-list-productive");
  var articles = ["Invasion_of_Normandy", "Banana", "Arthur_Tedder,_1st_Baron_Tedder"];
  for(var a of articles){
    fetchWikipediaArticle(a);
  }
}

document.addEventListener('DOMContentLoaded', DOMLoaded, false);
