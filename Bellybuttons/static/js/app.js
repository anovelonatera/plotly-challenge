//d3.event.preventDefault();

function buildGauge(wash_frequency) {

  // Enter a speed between 0 and 180
var level = wash_frequency;

// Trig to calc meter point
var degrees = 180 - (20 * wash_frequency),
     radius = 0.7;
var radians = degrees * Math.PI / 180;
var x = radius * Math.cos(radians);
var y = radius * Math.sin(radians);

// Path: may have to change to create a better triangle // GAUGUE NEEDLE
var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
     pathX = String(x),
     space = ' ',
     pathY = String(y),
     pathEnd = ' Z';
var path = mainPath.concat(pathX,space,pathY,pathEnd);

var data = [{ type: 'scatter',
   x: [0], y:[0], 
    marker: {size: 25, color:'850000'}, 
    showlegend: false,
    name: 'frequency', 
    text: level, 
    hoverinfo: 'text+name'}, 
  { values: [20, 20, 20, 20, 20, 20, 20, 20, 20, 180], 
  rotation: 90,
  text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
  textinfo: 'text',
  textposition:'inside',
  marker: {colors:['#97dfdc', '#83d9d6', '#70d3cf', '#5ccdc9', '#48c7c3', '#3abcb8', 
                   '#34a9a5', '#2e9894', '#298784', 'rgba(255, 255, 255, 0)']},
  labels: ['151-180', '121-150', '91-120', '61-90', '31-60', '0-30', ''], 
  hoverinfo: 'label',
  hole: .5,
  type: 'pie',
  showlegend: false
}];

// shape = GAUGE NEEDLE METER
var layout = {
  shapes:[{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
  title: '<b>Belly Buttons Wash Frequency</b> <br> Scrubs per Week',
  height: 600,
  width: 600,
  xaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]},
  yaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]}
}; // END Gauge Layout description.

// Plot Gauge.
Plotly.newPlot('gauge', data, layout);

}; // ================================= END buildGauge function

// ================================= START BUILDMETADATA FUNCTION =================================
function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  d3.json(`/metadata/${sample}`). then(function(data) {
    // Use d3 to select the panel with id of `#sample-metadata`
    var metadata = d3.select('#sample-metadata');

    // Use `.html("") to clear any existing metadata
    d3.select('#sample-metadata').html('');

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(data).forEach(([key, value]) => {
      // 1
      metadata.append('div').text(`${key}: ${value}`); 
      // 2
      //d3.select("#sample-metadata").append().text(`${key}: ${value}`);       
    });

    // BONUS: Build the Gauge Chart
    buildGauge(data.WFREQ);    

  }); // END fetch metadata sample Object.entries
} // ================================= END buildMetadata function()


// ================================= START BUILDCHARTS FUNCTION =================================
function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(`/samples/${sample}`).then(function(response){
    console.log(`At buildCharts: ${response.otu_ids}`);   

    // Slice the top 10 samples
    var otu_ids = response.otu_ids.slice(0,10);
    var otu_labels = response.otu_labels.slice(0,10);
    var sample_values = response.sample_values.slice(0,10);    

    console.log(otu_labels);

    // @TODO: Build a Bubble Chart using the sample data
    var trace = {
      x: response.otu_ids,
      y: response.sample_values,
      text: response.otu_labels,
      mode: 'markers',
      marker: {
        color: response.otu_ids,
        size: response.sample_values        
      }
    };

    var layout_bubble = {
      title: 'Bellybuttons',
      showlegend: false,
      height: 600,
      width: 1500
    };

    var data_bubble = [trace];
    Plotly.newPlot('bubble', data_bubble, layout_bubble);

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slicce() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).    
    var data_pie = [{
      labels: otu_ids,
      values: sample_values,
      hoverinfo: otu_labels,      
      // text: otu_labels,  // text displays badly the text at hover
      name: 'Belly Button Top 10 Samples',
      type: 'pie'      
    }];

    var layout_pie = {
      title: 'Belly Button Top 10 Samples',
      height: 500,
      width: 500
    };

    Plotly.newPlot('pie', data_pie, layout_pie);
  });
}; // ================================= END buildCharts function


// ================================= START INIT FUNCTION =================================
function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    console.group(`First Sample is: ${firstSample}`);
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}; // ================================= END init function


// ================================= START SELECTION SAMPLE FUNCTION =================================
function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();