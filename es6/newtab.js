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
    return _.template(this.template, this.toObject());
  }

  toObject(){
    var obj = {};
    obj.domain = this.domain;
    obj.productivity = this.productivity;
    return obj;
  }

  setTemplate(template){
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


/**** TESTING ****/
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

console.log(domains);

/**** END TESTING ****/


var renderGraph = function() {
  if(VERBOSE){ console.debug("FUNCTION CALL: renderGraph()"); }


  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();

  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var plot = new Plottable.Plots.Line();
  plot.x(function(d) { return d.x; }, xScale);
  plot.y(function(d) { return d.y; }, yScale);

  var data = [
    { "x": 0, "y": 1 },
    { "x": 1, "y": 2 },
    { "x": 2, "y": 4 },
    { "x": 3, "y": 8 }
  ];

  var dataset = new Plottable.Dataset(data);
  plot.addDataset(dataset);

  var chart = new Plottable.Components.Table([
    [yAxis, plot],
    [null, xAxis]
  ]);

  chart.renderTo("svg#graph");

}

var renderClassControls = function(productive, unproductive){
}

var renderDomainList = function(domains){
  for(var d of domains){
    d.setTemplate("<div><%= domain %></div>");
    var str = d.render();
    console.log(str);
  }
}

var DOMLoaded = function() {
  if(VERBOSE){ console.debug("EVENT: DOMContentLoaded"); }
  renderGraph();
  renderDomainList(domains);
}

document.addEventListener('DOMContentLoaded', DOMLoaded, false);
