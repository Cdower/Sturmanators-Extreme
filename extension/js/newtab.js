"use strict";

var VERBOSE = true;

var renderGraph = function renderGraph() {
  if (VERBOSE) {
    console.debug("FUNCTION CALL: renderGraph()");
  }

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();

  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var plot = new Plottable.Plots.Line();
  plot.x(function (d) {
    return d.x;
  }, xScale);
  plot.y(function (d) {
    return d.y;
  }, yScale);

  var data = [{ "x": 0, "y": 1 }, { "x": 1, "y": 2 }, { "x": 2, "y": 4 }, { "x": 3, "y": 8 }];

  var dataset = new Plottable.Dataset(data);
  plot.addDataset(dataset);

  var chart = new Plottable.Components.Table([[yAxis, plot], [null, xAxis]]);

  chart.renderTo("svg#graph");
};

var DOMLoaded = function DOMLoaded() {
  if (VERBOSE) {
    console.debug("EVENT: DOMContentLoaded");
  }
  renderGraph();
};

document.addEventListener('DOMContentLoaded', DOMLoaded, false);