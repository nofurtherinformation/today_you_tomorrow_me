var dd;
var pageX;
var pageY;
const displacement_data = d3.csv('summary_human_displacement.csv').then(function(data){
    dd = data;
})

color = d3.scalePow()
    .domain([0, 100])
    .range(["rgba(107,147,94,0)","#68915b"]);

//doesn't seem to work with CSV....
// var pixel_data;
// const px_data = d3.csv('HABITAT_LOSS_PERCENTAGES.csv').then(function(data){
//     pixel_data=data;
// })

var pixel_data;
const d = d3.csv("https://gist.githubusercontent.com/kat-wicks/f205e7ccfcc730c350237b8a7d3c30fa/raw/1995471ea33f31e7801770b080fd3cb218c4c977/slr_habitat_loss.csv",  (d, i, columns) => (d3.autoType(d))).then(function(data){
    pixel_data = data
})
const API_KEY = "ea61f3692f37cf92a8df83f3df1d9d9d";

var slr_tiles = [
    {'name':'slr_0', 'url':'http://dev.dylanhalpern.com/slr/slr_00/'},
    {'name':'slr_1', 'url':'http://dev.dylanhalpern.com/slr/slr_01/'},
    {'name':'slr_2', 'url':'http://dev.dylanhalpern.com/slr/slr_02/'},
    {'name':'slr_3', 'url':'http://dev.dylanhalpern.com/slr/slr_03/'},
    {'name':'slr_4', 'url':'http://dev.dylanhalpern.com/slr/slr_04/'},
    {'name':'slr_5', 'url':'http://dev.dylanhalpern.com/slr/slr_05/'},
    {'name':'slr_6', 'url':'http://dev.dylanhalpern.com/slr/slr_06/'},
    {'name':'slr_7', 'url':'http://dev.dylanhalpern.com/slr/slr_07/'},
    {'name':'slr_8', 'url':'http://dev.dylanhalpern.com/slr/slr_08/'},
    {'name':'slr_9', 'url':'http://dev.dylanhalpern.com/slr/slr_09/'},
    {'name':'slr_10', 'url':'http://dev.dylanhalpern.com/slr/slr_10/'}
]

$( document ).on( "mousemove", function( event ) {
    pageX = event.clientX;
    pageY = event.clientY;
  });

mapboxgl.accessToken = 'pk.eyJ1IjoiZGhhbHBlcm4iLCJhIjoiY2pvMnliandsMHJsbTNwcGhlNWhqYzF3ZyJ9.g5FiNV9s5DXPt1RaE2wNyg';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/dhalpern/cju007aoj560k1gplfbhlc9ft', // our map style
    center: [-91.9736877, 30.179239], // gulf coast area
    zoom: 7.5, // regional scale zoom
    interactive:false
});


const heatmap_vars = {
            // Increase the heatmap weight based on frequency and property magnitude
            "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "mag"],
                0, 0,
                6, 1
            ],
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 1,
                9, 3
            ],
            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            // Begin color ramp at 0-stop with a 0-transparancy color
            // to create a blur-like effect.
            "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0, "rgba(117,107,177,0)",
                0.1, "rgba(255,255,255,0.1)",
                1, "rgba(255,255,255,0.25)"
            ],
            // Adjust the heatmap radius by zoom level
            "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 1,
                8, 15
            ],
            // Transition from heatmap to circle layer by zoom level
            "heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 1,
                9, 0.1
            ],
        };

        map.on('load', function() {
      map.setPaintProperty('water', 'fill-color', '#025a72')
      slr_tiles.forEach(function(tile){
      // Insert the layer beneath any symbol layer.
          map.addSource(tile.name, {
              "type": "raster",
                  "scheme": "tms",
                  "tiles": [
                      tile.url + '{z}/{x}/{y}.png'
                  ],
                  "tileSize": 256,
          })
      })

    slr_tiles.forEach(function(tile){
        map.addLayer({
            'id': tile.name,
            'type': 'raster',
            'source': tile.name,
            'layout': {
                'visibility': 'none'
            },
            'maxZoom':12,
            'minZoom':0
        });
    })

    map.addLayer({
        'id':'coast',
        'type': 'line',
        'source': {
            'type': 'geojson',
            'data': coast
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#efefef",
            "line-width": 1
        }
    })

    // map.addLayer({
    //     'id':'wash',
    //     'type': 'fill',
    //     'source': {
    //         'type': 'geojson',
    //         'data': habitats
    //     },
    //     "layout": {
    //         "visibility":"none"
    //     },
    //     "paint":{
    //          "fill-opacity":0.6,
    //        "fill-color":"#68915b",
    //        "fill-outline-color":"#68915b"
    //     }
    // })

    map.addLayer({
        'id':'bird_env',
        'type': 'heatmap',
        'source': {
            'type': 'geojson',
            'data': habitats
        },
        'layout': {
           'visibility':'none'
        },
        "paint": heatmap_vars
    })
    map.addLayer({
        'id':'bird_env_line',
        'type': 'line',
        'source': {
            'type': 'geojson',
            'data': habitats
        },
        "layout": {
            "visibility":"none",
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#68915b",
            "line-width": 40,
            "line-opacity":0.01
        }
    })

    map.setFilter('bird_env', ['==', 'Louisiana_', 'BIRD']);
    map.setFilter('bird_env_line', ['==', 'Louisiana_', 'BIRD']);


    map.addLayer({
        'id':'fish_env',
        'type': 'heatmap',
        'source': {
            'type': 'geojson',
            'data': habitats
        },
        'layout': {
           'visibility':'none'
        },
        "paint": heatmap_vars
    })
    map.addLayer({
        'id':'fish_env_line',
        'type': 'line',
        'source': {
            'type': 'geojson',
            'data': habitats
        },
        "layout": {
            "visibility":"none",
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#68915b",
            "line-width": 40,
            "line-opacity":0.01
        }
    })

    map.setFilter('fish_env', ['==', 'Louisiana_', 'FISH']);
    map.setFilter('fish_env_line', ['==', 'Louisiana_', 'FISH']);

    map.addLayer({
        'id':'invert_env',
        'type': 'heatmap',
        'source': {
            'type': 'geojson',
            'data': habitats
        },
        'layout': {
           'visibility':'none'
        },
        "paint": heatmap_vars
    })
    map.addLayer({
        'id':'invert_env_line',
        'type': 'line',
        'source': {
            'type': 'geojson',
            'data': habitats
        },
        "layout": {
            "visibility":"none",
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#68915b",
            "line-width": 40,
            "line-opacity":0.01
        }
    })

    map.setFilter('invert_env_line', ['==', 'Louisiana_', 'INVERT']);
    map.setFilter('invert_env', ['==', 'Louisiana_', 'INVERT']);

    map.addLayer({
        'id':'habitats',
        'type': 'heatmap',
        'source': {
            'type': 'geojson',
            'data': habitats
        },
        'layout': {
           'visibility':'none'
        },
        "paint": heatmap_vars
    })
    map.addLayer({
        'id':'habitats_line',
        'type': 'line',
        'source': {
            'type': 'geojson',
            'data': habitats
        },
        "layout": {
            "visibility":"none",
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#68915b",
            "line-width": 40,
            "line-opacity":0.01
        }
    })

    var popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true
        });

    map.on('click', 'bird_env_line', function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';
        var name = e.features[0].properties.Louisian_2;
        var la_name = e.features[0].properties.Louisian_3;
        // Populate the popup and set its coordinates
        // based on the feature found.
    popup.setLngLat(e.lngLat)
        .setHTML(`<h2>${name}</h2><p>${la_name}</p><img>`)
        .addTo(map);
        console.log(la_name)
        if (la_name != 'null') {
            getImg(la_name);
        } else {
            console.log(`${name} louisiana`)
            getImg(`${name} louisiana`)
        }
    });
    map.on('click', 'habitats_line', function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';
        var name = e.features[0].properties.Louisian_2;
        var la_name = e.features[0].properties.Louisian_3;
        // Populate the popup and set its coordinates
        // based on the feature found.
    popup.setLngLat(e.lngLat)
        .setHTML(`<h2>${name}</h2><p>${la_name}</p><img>`)
        .addTo(map);
        console.log(la_name)
        if (la_name != 'null') {
            getImg(la_name);
        } else {
            getImg(name + ' louisana')
        }
    });

    map.on('click', 'fish_env_line', function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';
        var name = e.features[0].properties.Louisian_2;
        var la_name = e.features[0].properties.Louisian_3;
        // Populate the popup and set its coordinates
        // based on the feature found.
    popup.setLngLat(e.lngLat)
        .setHTML(`<h2>${name}</h2><p>${la_name}</p><img>`)
        .addTo(map);
        console.log(la_name)
        if (la_name != 'null') {
            getImg(la_name);
        } else {
            getImg(name + ' louisana')
        }
    });
    map.on('click', 'invert_env_line', function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';
        var name = e.features[0].properties.Louisian_2;
        var la_name = e.features[0].properties.Louisian_3;
        // Populate the popup and set its coordinates
        // based on the feature found.
    popup.setLngLat(e.lngLat)
        .setHTML(`<h2>${name}</h2><p>${la_name}</p><img>`)
        .addTo(map);
        console.log(la_name)
        if (la_name != 'null') {
            getImg(la_name);
        } else {
            getImg(name + ' louisana')
        }
    });
});

var rows_num = 24;
var cols_num = 10;
var slr_num = 0;

function getArray(slr_level){
  slr_num = slr_level;
  const values = []
  if(slr_level == 0){

  for(let row =0; row<rows_num;row++){
    let valueArray = [];
    for(let column =0; column<cols_num;column++){
     valueArray.push(0);
    }
    values.push(valueArray);
    }

  } else {
  for(let row =0; row<rows_num;row++){

    let valueArray = [];
    for(let column =0; column<cols_num;column++){
      if (.5<pixel_data[row*cols_num + column][slr_level]/pixel_data[row*cols_num + column]["ORIGINAL AREA"] && pixel_data[row*cols_num + column][slr_level]/pixel_data[row*cols_num + column]["ORIGINAL AREA"]<.99)
        valueArray.push(1);
      else if ((pixel_data[row*cols_num + column][slr_level]/pixel_data[row*cols_num + column]["ORIGINAL AREA"])<=.5)
        valueArray.push(0);
      else if (pixel_data[row*cols_num + column][slr_level]/pixel_data[row*cols_num + column]["ORIGINAL AREA"]>=.99)
        valueArray.push(2);
    }

    values.push(valueArray);
  }}
    return values;

}

function grid (config) {
    /*
    * CREDIT FOR GRID TO @bryangingechen on Observable.
    */


  // defaults
  config = Object.assign({size:document.getElementById("pixel_viz").offsetWidth/17, numStates:3, margin:2, outline:'transparent'}, config);
  let {nx, ny, size, numStates, init, margin, colorArray, outline} = config;

  // validate init: this is horrible...
  if (init !== undefined) {
    if (init.some(d => d.length !== init[0].length) ||
        init.some(d => d.some(v => v<0 || v >= numStates || v != Math.round(v))))
      throw new Error(`init should be undefined or a rectangular matrix with integer entries between 0 and ${numStates-1}`);
    if (nx === undefined && ny !== undefined) {
      if (ny === init.length)
        nx = init[0].length;
      else throw new Error(`init length:${init.length} not equal to ny:${ny}`);
    } else if (ny === undefined && nx !== undefined) {
      if (nx === init[0].length)
        ny = init.length;
      else throw new Error(`init inner length:${init[0].length} not equal to nx:${nx}`);
    }
    else if (nx === undefined && ny === undefined) {
      ny = init.length;
      nx = init[0].length;
    }
  } else {
    if (nx === undefined && ny !== undefined)
      nx = ny;
    else if (ny === undefined && nx !== undefined)
      ny = nx;
    else if (nx === undefined && ny === undefined)
      ny = nx = 5;
  }


  colorArray =  ["transparent","#9fbc96","#68915b"];

  // Array of values, start out all 0 if init not defined
  const state = init ? init.map(d => d.slice()) : Array.from({length:ny}, d => Array(nx).fill(0));

  const svg = d3.select("#svg").attr("width",nx*(size+2*margin)).attr("height", ny*(size+2*margin));

   //const svg = d3.select(DOM.svg(nx*(size+2*margin), ny*(size+2*margin)));
  const el = svg.node();

  const rectData = [];
  for (let y=0; y<ny; y++)
    for (let x=0; x<nx; x++)
      rectData.push({x,y});

  const grid = svg.append("g")
      .attr("cursor", "pointer")
    .selectAll("rect")
    .data(rectData)
    .join("rect")

      .attr("x", d => d.x*(size + 2*margin) + margin)
      .attr("y", d => d.y*(size + 2*margin) + margin)
      .attr("id", d => rectData.indexOf(d))
      .attr("stroke", outline)
      .attr("width", size)
      .attr("height", size)
      .on('mouseover', handleMouseOver)
      .on("mouseout", handleMouseOut)
      .attr("fill", d=> color(((pixel_data[rectData.indexOf(d)][slr_num])/(pixel_data[rectData.indexOf(d)]["ORIGINAL AREA"])*100).toFixed(0)));
  el.addEventListener('inputArray', ({detail}) => {
    if (detail !== null && detail !== undefined) {
      if (detail.length === ny &&
          detail.every(d => d.length === nx && d.every(v => v < numStates && v >= 0 && v === Math.round(v)))) {
        state = detail;
      } else
        return console.log(`failed inputArray event: ${detail}`);
    } else {
      state = init ? init.map(d => d.slice()) : Array.from({length:ny}, d => Array(nx).fill(0));
    }
    el.value = state;
    grid.attr("fill", d=> color(((pixel_data[rectData.indexOf(d)][slr_num])/(pixel_data[rectData.indexOf(d)]["ORIGINAL AREA"])*100).toFixed(0)))
    el.dispatchEvent(new CustomEvent('input'));
  });

  el.value = state;
  return el;
}

function updateGrid(init){

    const state = init.map(d => d.slice());
     colorArray = ["transparent","#9fbc96","#68915b"];
    const rectData = [];
      for (let y=0; y<init.length; y++){
        for (let x=0; x<init[0].length; x++){
          rectData.push({x,y});
        }
    }

     const g = d3.select("#svg").selectAll("g");

     g.selectAll("rect")
      .data(rectData)
      .transition()
      .duration(getRandomInt(50,400))
      .attr("fill", d=> color(((pixel_data[rectData.indexOf(d)][slr_num])/(pixel_data[rectData.indexOf(d)]["ORIGINAL AREA"])*100).toFixed(0)));

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function handleMouseOver(){
    if (slr_num == 0){
      let loss = 0;
    }else {
      loss = ((pixel_data[this.id][slr_num])/(pixel_data[this.id]["ORIGINAL AREA"])*100).toFixed(0);
    };
    $("#gridImg").css({'top':pageY,'left':pageX+20}).html(`<h3>${pixel_data[this.id].SPECIES}<br>${loss}% loss</h3>`);
    $('#gridImg').fadeIn('slow');
    map.setFilter('habitats_line', ['==','Louisian_2',pixel_data[this.id].SPECIES]);
    map.setPaintProperty('habitats_line', 'line-opacity', 0.1);
    showRasterLayer('habitats_line');
    
    hideRasterLayer('bird_env');
    hideRasterLayer('invert_env');
    hideRasterLayer('fish_env');
    hideRasterLayer('bird_env_line');
    hideRasterLayer('invert_env_line');
    hideRasterLayer('fish_env_line');
    $('#stickyButtons .button').removeClass('button_active')
    
}
function handleMouseOut(){
    $('#gridImg').css('background-image','none');

}
$('#left_panel').mouseleave(function(){
    $('#gridImg').css('background-image','none');
    $('#gridImg').fadeOut();
    map.setPaintProperty('habitats_line', 'line-opacity', 0.01);
    map.setFilter('habitats_line', ['>','OBJECTID',0]);
    hideRasterLayer('bird_env');
    hideRasterLayer('invert_env');
    hideRasterLayer('fish_env');
    hideRasterLayer('bird_env_line');
    hideRasterLayer('invert_env_line');
    hideRasterLayer('fish_env_line');
    showRasterLayer('habitats');
    showRasterLayer('habitats_line');

})
function data_icon_grid(num) {
    
    var data = new Array();
    var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
    var ypos = 1;
    var width = $('#human_counter .left_panel_boxes').width()/10;
    var height = $('#human_counter .left_panel_boxes').width()/10;
    var counter= 0 ;
    // iterate for rows 
    for (var row = 0; row < num/10; row++) {
        data.push( new Array() );

        // iterate for cells/columns inside rows
        for (var column = 0; column < 10; column++) {
          if (counter <= num){ var color = "#000"} else { var color = "rgba(0,0,0,0)"}
            data[row].push({
                x: xpos,
                y: ypos,
                width: width,
                height: height,
                fill: color
            })
            // increment the x position. I.e. move it over by 50 (width variable)
            xpos += width;
            counter+=1;
        }
        // reset the x position after a row is complete
        xpos = 1;
        // increment the y position for the next row. Move it down 50 (height variable)
        ypos += height; 
    }
    return data;
}
function draw_icon_grid(selector, num){
    let path = (selector == "people") ? "M56.2,49c2.2-1.8,3.7-4.6,3.7-7.7c0-5.4-4.4-9.8-9.8-9.8c-5.4,0-9.8,4.4-9.8,9.8c0,3.1,1.4,5.9,3.7,7.7  c-5.1,2.4-8.7,7.5-8.7,13.5v6h29.8v-6C64.9,56.5,61.3,51.4,56.2,49z" :
        (selector == "houses") ? "M95,52.915c0,2.326-0.672,3.725-2.492,3.97c-0.127,0.027-0.307,0.054-0.469,0.054h-9.832c0,0,0,22.416,0,31.229  c0,3.94-1.998,5.691-4.203,6.428c-0.365,0.11-0.703,0.221-1.039,0.276H23.502c-0.363-0.057-0.703-0.166-1.039-0.276  c-2.204-0.735-4.204-2.486-4.204-6.428c0-8.812,0-31.229,0-31.229s-8.93,0.055-10.275,0C5.804,56.858,5,55.437,5,52.916  c0-3.204,0.544-3.856,2.985-6.374c2.906-3.038,37.604-39.271,37.604-39.271s1.919-2.217,4.646-2.14  c2.751-0.078,4.618,2.14,4.618,2.14s8.177,8.783,16.921,18.062v-8.457c0,0,0.027-3.175,4.516-3.858  c0.521-0.082,1.117-0.111,1.766-0.111h1.039c0.623,0,1.221,0.029,1.736,0.111c4.521,0.654,4.545,3.858,4.545,3.858v22.712  c3.447,3.587,5.971,6.213,6.666,6.954C94.479,49.058,95,49.711,95,52.915z" : "M47.5,3.666C23.291,3.666,3.666,23.291,3.666,47.5S23.291,91.334,47.5,91.334S91.334,71.709,91.334,47.5  S71.709,3.666,47.5,3.666z M59.084,38.547h-7.189v-9.064h-8.788v8.695L57.518,51.76c1.045,0.984,1.566,2.285,1.566,3.902v11.463  c0,2.641-1.193,4.08-3.558,4.34v4.648h-5.901V71.52h-3.78v4.594h-5.899v-4.615c-2.678-0.105-4.029-1.553-4.029-4.373V55.662h7.19  v9.803h8.788v-9.434L37.482,42.389c-1.045-1.004-1.566-2.285-1.566-3.842V27.854c0-2.844,1.345-4.311,4.029-4.414v-4.66h5.899v4.648  h3.78v-4.648h5.901v4.703c2.364,0.258,3.558,1.688,3.558,4.311V38.547z"
    let number = (selector == "value") ? (parseInt((num/2-1).toFixed(0))) : (parseInt((num/20000-1).toFixed(0)))
    let scale = (selector == "people") ? 0.3 : 0.15
    d3.select(`#${selector}_grid svg`).remove()
    grid = d3.select(`#${selector}_grid`)
      .append("svg")
      .attr("width",$('#human_counter .left_panel_boxes').width())
      .attr("height",$('#human_counter .left_panel_boxes').width()/100*(Math.ceil(number / 10) * 10)+20);
    row = grid.selectAll(".row")
      .data(data_icon_grid(number))
      .enter().append("g")
      .attr("class", "row");
    column = row.selectAll(`.${selector}`)
      .data(function(d) { return d; })
      .enter().append("path")
      .style('opacity',1)
      .attr("d", path)
      .style("transform", d=>`translate(${d.x}px,${d.y}px) scale(${scale})`)
      .attr('class',`${selector}`)
      .attr("width", '20px')
      .attr("height", '20px')
      .style("fill", '#68915b')
   
    
  }
function getPosition(marker) { // gets the position roughly when the marker enters the frame
    return ($(`#${marker}`).offset().top-760)
}

function hideLayer(layer){ // layer must be passed as a string in quotes
    map.setLayoutProperty(layer, 'visibility', 'none');
    map.setPaintProperty(layer, 'fill-opacity', 0); // setting the CSS property of the SVG to 0, hiding it

};

function showLayer(layer, opacity){ // layer must be passed as a string in quotes
    map.setPaintProperty(layer, 'fill-opacity', opacity); // setting the CSS property of the SVG to 0, showing it
    map.setLayoutProperty(layer, 'visibility', 'visible');
};

function showRasterLayer(layer){ // layer must be passed as a string in quotes
    map.setLayoutProperty(layer, 'visibility', 'visible');
};
function hideRasterLayer(layer){ // layer must be passed as a string in quotes
    map.setLayoutProperty(layer, 'visibility', 'none');
};
function revealLayer(layer){ // layer must be passed as a string in quotes
    map.setPaintProperty(layer, 'fill-opacity', 1) // setting the CSS property of the SVG to 0, showing it
    map.setPaintProperty(layer, 'fill-translate', [0,0]); // setting the CSS property of the SVG to 0, showing it
};
function updateDD(slr){
    $('#dd_0').html(parseInt(dd[0][`${slr}`]).toLocaleString() + ' people');
    $('#dd_1').html(parseInt(dd[1][`${slr}`]).toLocaleString() + ' units');
    $('#dd_2').html(parseFloat(dd[2][`${slr}`]).toFixed(2)+' bn');
    draw_icon_grid('people',parseInt(dd[0][`${slr}`]))
    draw_icon_grid('houses',parseInt(dd[1][`${slr}`]))
    draw_icon_grid('value',parseFloat(dd[2][`${slr}`]).toFixed(2))
}

function getImg(term){
  let TAGS = term.split(' ').join('+');
  let url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + API_KEY + "&tags=" + TAGS + "&safe_search=1&per_page=200";
  $.getJSON(url + "&format=json&jsoncallback=?", function(data){
    let item = data.photos.photo[Math.floor(Math.random()*Object.keys(data.photos.photo).length)];
    let src = "http://farm"+ item.farm +".static.flickr.com/"+ item.server +"/"+ item.id +"_"+ item.secret +"_m.jpg";
    $(".mapboxgl-popup-content img").attr("src", src);
  });
};
function getGridImg(term){
   $("#gridImg").html(`<h3>${term}</h3>`);
  let TAGS = term.split(' ').join('+');
  let url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + API_KEY + "&tags=" + TAGS + "&safe_search=1&per_page=200";
  $.getJSON(url + "&format=json&jsoncallback=?", function(data){
    let item = data.photos.photo[Math.floor(Math.random()*Object.keys(data.photos.photo).length)];
    let src = "http://farm"+ item.farm +".static.flickr.com/"+ item.server +"/"+ item.id +"_"+ item.secret +"_m.jpg";
    $("#gridImg").css('background-image',`url(${src})`);

  });
};

$(document).ready(function(){
    $(window).scrollTop(0);
    $('#stickyButtons').fadeOut();
    $('#video_overlay').fadeOut();
    $('#slr_meter').fadeOut();
    grid({init: getArray(0)});
})
$('.show').click(function(){
    hideRasterLayer('bird_env');
    hideRasterLayer('invert_env');
    hideRasterLayer('fish_env');
    hideRasterLayer('bird_env_line');
    hideRasterLayer('invert_env_line');
    hideRasterLayer('fish_env_line');
    hideRasterLayer('habitats');
    hideRasterLayer('habitats_line');
    $('.show').removeClass('show_active');
    $(this).addClass('show_active');
    if (map.getLayer($(`#${this.id}`).attr('alt')).visibility == "none") {
    showRasterLayer($(`#${this.id}`).attr('alt'));
    showRasterLayer($(`#${this.id}`).attr('alt')+'_line');
    } else {
        hideRasterLayer($(`#${this.id}`).attr('alt'));
        hideRasterLayer($(`#${this.id}`).attr('alt')+'_line');
    }
})
$('#stickyButtons .button').click(function(){
    hideRasterLayer('habitats');
    hideRasterLayer('habitats_line');
    $(this).toggleClass('button_active');
    if (map.getLayer($(`#${this.id}`).attr('alt')).visibility == "none") {
    showRasterLayer($(`#${this.id}`).attr('alt'));
    showRasterLayer($(`#${this.id}`).attr('alt')+'_line');
    } else {
        hideRasterLayer($(`#${this.id}`).attr('alt'));
        hideRasterLayer($(`#${this.id}`).attr('alt')+'_line');
    }
})

$(window).scroll(function() { // whenever the page scrolls
    var height = $(window).scrollTop()+300; // current position
    if (($(window).scrollTop()) > ($('#fish_env').offset().top)) {
            $('#stickyButtons').fadeIn();
            $('.button').removeClass('button_active')
    } else {
        $('#stickyButtons').fadeOut();
    }
    if (height == 300) {
        $('#overlay').css('background-image','url("img/bg.jpg")').fadeIn();
        updateDD('0');
        // showRasterLayer('habitats');
        // hideRasterLayer('bird_env');
        // hideRasterLayer('fish_env');
        // hideRasterLayer('invert_env');
    } else if ((height  > getPosition('marker1')) && (height  < getPosition('marker2'))) {
        $('#overlay').fadeOut();
        $('rect').fadeOut();
        updateDD('0');
        // showRasterLayer('habitats');
        // hideRasterLayer('bird_env');
        // hideRasterLayer('fish_env');
        // hideRasterLayer('invert_env');
    } else if ((height  > getPosition('marker2')) && (height  < getPosition('marker3'))) {
        showRasterLayer('bird_env');
        showRasterLayer('bird_env_line');
        $('#slr_meter').fadeOut();
        hideRasterLayer('slr_1');

        updateGrid(getArray(0));
        updateDD('0');
        $('rect').fadeOut();
    } else if ((height  > getPosition('marker3')) && (height  < getPosition('marker4'))) {
        hideRasterLayer('bird_env');
        hideRasterLayer('bird_env_line');
        hideRasterLayer('fish_env');
        hideRasterLayer('invert_env');
        hideRasterLayer('fish_env_line');
        hideRasterLayer('invert_env_line');
        showRasterLayer('habitats');
        showRasterLayer('habitats_line');
        $('#slr_meter').fadeIn();
        showRasterLayer('slr_1');
        hideRasterLayer('slr_2');
        updateGrid(getArray(1));
        $('#counter').css('bottom','5%');
        $('#counter p').html('1');
        $('.wave, .wave2').css('bottom','0%');
        updateDD('1');
        map.setPaintProperty('habitats_line', 'line-opacity', 0.01);
        map.setFilter('habitats', ['>','OBJECTID',0]);
        map.setFilter('habitats_line', ['>','OBJECTID',0]);
        $('rect').fadeIn();

    } else if ((height  > getPosition('marker4')) && (height  < getPosition('marker5'))) {
        showRasterLayer('slr_2');
        hideRasterLayer('slr_3');
        updateGrid(getArray(2));
        $('#counter p').html('2')
        $('#counter').css('bottom','13%')
        $('.wave, .wave2').css('bottom','10%');
        $('.wave_filler').css('height','10%');
        updateDD('2');
        hideRasterLayer('bird_env');
        hideRasterLayer('bird_env_line');
        hideRasterLayer('fish_env');
        hideRasterLayer('invert_env');
        hideRasterLayer('fish_env_line');
        hideRasterLayer('invert_env_line');
        
        map.setFilter('habitats', ['==','Louisian_2','Piping plover']);
        map.setFilter('habitats_line', ['==','Louisian_2','Piping plover']);
        map.setPaintProperty('habitats_line', 'line-opacity', 0.1);
        showRasterLayer('habitats');
        showRasterLayer('habitats_line');

    } else if ((height > getPosition('marker5')) && (height  < getPosition('marker6'))) {
        map.setPaintProperty('habitats_line', 'line-opacity', 0.01);
        map.setFilter('habitats', ['>','OBJECTID',0]);
        map.setFilter('habitats_line', ['>','OBJECTID',0]);
        showRasterLayer('slr_3')
        $('#counter p').html('3')
        updateGrid(getArray(3));
        $('#counter').css('bottom','21%')
        $('.wave, .wave2').css('bottom','20%');
        $('.wave_filler').css('height','20%');

        updateDD('3');
            // map.flyTo({
            //     center: [-90.7393522,30.0464164],
            //     zoom: 10,
            //     bearing: 0,
            //     speed: 0.2,
            //     curve: 1,
            //     easing: function (t) { return t; }
            //     });

        hideRasterLayer('slr_1')
        hideRasterLayer('slr_4')
    } else if ((height > getPosition('marker6')) && (height  < getPosition('marker7'))) {
        updateGrid(getArray(3));
    } else if ((height > getPosition('marker7')) && (height  < getPosition('marker8'))) {
        showRasterLayer('slr_4')
        updateDD('4');

        $('#counter p').html('4')

        $('#counter').css('bottom','29%')
        $('.wave, .wave2').css('bottom','30%');
        $('.wave_filler').css('height','30%');

        hideRasterLayer('slr_2')
        hideRasterLayer('slr_5')
        updateGrid(getArray(4));
    } else if ((height > getPosition('marker8')) && (height  < getPosition('marker9'))) {
        showRasterLayer('slr_5');
        updateDD('5');

        $('#counter p').html('5');
        $('#counter').css('bottom','37%');
        $('.wave, .wave2').css('bottom','40%');
        $('.wave_filler').css('height','40%');
        updateGrid(getArray(5));
        hideRasterLayer('slr_3')
        hideRasterLayer('slr_6')
        hideRasterLayer('slr_3');
        hideRasterLayer('slr_6');
    } else if ((height > getPosition('marker9')) && (height  < getPosition('marker10'))) {
        showRasterLayer('slr_6');

        updateDD('6');
        $('#counter p').html('6')
        $('#counter').css('bottom','45%')
        $('.wave, .wave2').css('bottom','50%');
        $('.wave_filler').css('height','50%');
        hideRasterLayer('slr_2')
        hideRasterLayer('slr_7')
        updateGrid(getArray(6));
        // map.flyTo({

        //         center: [-91.167895, 30.179239], // gulf coast area
        //         zoom: 8, // regional scale zoom
        //         bearing: 0,
        //         speed: 0.1,
        //         curve: 1,
        //         easing: function (t) { return t; }
        //         });

        hideRasterLayer('bird_env');
    } else if ((height > getPosition('marker10')) && (height  < getPosition('marker11'))) {

        updateGrid(getArray(6));
    } else if ((height > getPosition('marker11')) && (height  < getPosition('marker12'))) {
        showRasterLayer('slr_7')
        updateDD('7');

        $('#counter p').html('7')
        $('#counter').css('bottom','56%')
        $('.wave, .wave2').css('bottom','60%');
        $('.wave_filler').css('height','60%');
        hideRasterLayer('slr_5')
        hideRasterLayer('slr_8')
        updateGrid(getArray(7));
    } else if ((height > getPosition('marker12')) && (height  < getPosition('marker13'))) {
        showRasterLayer('slr_8');
        updateDD('8');

        $('#counter p').html('8');
        $('#counter').css('bottom','66%');
        $('.wave, .wave2').css('bottom','70%');
        $('.wave_filler').css('height','70%');
        hideRasterLayer('slr_6')
        hideRasterLayer('slr_9')
        updateGrid(getArray(8));
        hideRasterLayer('slr_6');
        hideRasterLayer('slr_9');
    } else if ((height > getPosition('marker13')) && (height  < getPosition('marker14'))) {
        showRasterLayer('slr_9');
        updateDD('9');

        $('#counter p').html('9');
        $('#counter').css('bottom','76%');
        $('.wave, .wave2').css('bottom','80%');
        $('.wave_filler').css('height','80%');
        hideRasterLayer('slr_7')
        hideRasterLayer('slr_10')
        updateGrid(getArray(9));
        
        $('#stickyButtons').css('opacity','1');
        $('#video_overlay').fadeOut().css('opacity','0');
    } else if (height > getPosition('marker14')) {
        showRasterLayer('slr_10');
        updateDD('10');

        $('#counter p').html('10');
        $('#counter').css('bottom','86%');
        $('.wave, .wave2').css('bottom','90%');
        $('.wave_filler').css('height','90%');
        hideRasterLayer('slr_8')
        updateGrid(getArray(10));
        
        $('#video_overlay').fadeIn().css('opacity','1');
        $('#stickyButtons').css('opacity','0');
    } else {
    }
})