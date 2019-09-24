//Locations. Assume this data is retrieved from a db for a specific time and hour
const locations = [
    {name: 'San Clemente Island', shortName:'SCI', lat: 32.92, lng: -118.49, elevation: '100m', co2: 411, ch4: 1000, dewptT: -6.25, pressure: 1011, windDir: 158.7, windSpd: 0.79},
    {name: 'California Institute of Technology', shortName:'CIT', lat: 34.14, lng: -118.13, elevation: '20m', co2: 435, ch4: 1014, dewptT: 4.0, pressure: 1025, windDir: 320.1, windSpd: 0.01},
    {name: 'Irvine', shortName:'IRV', lat: 33.64, lng: -117.84, elevation: '25m', co2: 480, ch4: 1025, dewptT: 3.12, pressure: 1035, windDir: 50.7, windSpd: 0.21},
    {name: 'Granada Hills', shortName:'GRA', lat: 34.28, lng: -118.47, elevation: '150m', co2: 422, ch4: 1035, dewptT: -2.27, pressure: 1020, windDir: 180.2, windSpd: 0.56},
    {name: 'La Jolla', shortName:'LJA', lat: 32.87, lng: -117.25, elevation: '10m', co2: 415, ch4: 1100, dewptT: 4.13, pressure: 1012, windDir: 90.1, windSpd: 0.87},
]

//'Popup' is a class, popup is a variable
let map, heatmap, co2Data, ch4Data, popup, Popup;
//Important regulator to determine if co2 or ch4 data to be used
let usech4Data = false;
//First value determines outermost gradient. Must be 'rgba(255, 255, 255, 0)'
//or the entire map will be coloured
//4th value in rgba code is 'intensity'. '0' is invisible, '1' is maximum intensity
//Last value colours the centre. Centre's width increases with weight
//Gradient set equivalent to CSS 'radial-gradient'
const co2BrightGradient = [
    'rgba(255, 255, 255, 0.5)',
    'rgba(255, 0, 0, 0.4)',
    'rgba(255, 20, 20, 0.4)',
    'rgba(255, 30, 30, 0.4)',
    'rgba(10, 255, 10, 50)',
    'rgba(0, 255, 0, 50)',
]
const co2DarkGradient = [
    'rgba(255, 255, 255, 0.0)',
    'rgba(255, 0, 0, 0.4)',
    'rgba(255, 20, 20, 0.4)',
    'rgba(255, 30, 30, 0.4)',
    'rgba(10, 255, 10, 50)',
    'rgba(0, 255, 0, 50)',
]
const ch4BrightGradient = [
    'rgba(255, 255, 255, 0.5)',
    'rgba(255, 0, 0, 0.4)',
    'rgba(255, 20, 20, 0.4)',
    'rgba(255, 30, 30, 0.4)',
    'rgba(255, 250, 10, 50)',
    'rgba(255, 250, 0, 50)',
]
const ch4DarkGradient = [
    'rgba(255, 255, 255, 0.0)',
    'rgba(255, 0, 0, 0.4)',
    'rgba(255, 20, 20, 0.4)',
    'rgba(255, 30, 30, 0.4)',
    'rgba(255, 250, 10, 50)',
    'rgba(255, 250, 0, 1)',
]

// On page load, initialize and add the map
function initMap() {
    //On page load, processes co2 and ch4 data for rendering onto map
    //By default, sends co2Data to map on page load
    //Weight can indicate ppm emissions relative to baseline at SCI: Let weight = ppm at location/ppm @ SCI
    co2Data = []
    //Setup so that weight at SCI (baseline location) = 1
    for(i=0; i<locations.length; i++){
        co2Data[i] = { location: new google.maps.LatLng(locations[i].lat, locations[i].lng), weight: (locations[i].co2/locations[0].co2) }
    }
    ch4Data = []
    //Setup so that weight at SCI (baseline location) = 1
    //(locations[i].co2/locations[0].co2)
    for(i=0; i<locations.length; i++){
        ch4Data[i] = { location: new google.maps.LatLng(locations[i].lat, locations[i].lng), weight: (locations[i].ch4/locations[0].ch4) }
    }
    infowindowContent = []
    for(i=0; i<locations.length; i++){
        infowindowContent[i] = '<div id="content">'+
            '<div id="location"><b>Sensor location: '+locations[i].name+'</b></div>'+
            '<div id="bodyContent">'+
                '<div>Coordinates: '+ locations[i].lat+','+ locations[i].lng+'</div>'+    
                '<div>Elevation: '+ locations[i].elevation+'</div>'+    
                '<div>CO2 (ppm): '+ locations[i].elevation+ ' CH4 (ppb): '+ locations[i].elevation+'</div>'+
                '<div>Dewpoint temp (°C): '+ locations[i].dewptT+'</div>'+  
                '<div>Atmospheric pressure (milibar): '+ locations[i].elevation+'</div>'+  
                '<div>Wind direction (°): '+ locations[i].windDir+ ' Wind speed (m/s): '+ locations[i].windSpd+'</div>'+  
            '</div>'+
        '</div>'
    }

    // The location of centre point. Here, we choose IRV (Irvine, LA)
    var centerCoordinates = {lat: locations[2].lat, lng: locations[2].lng};
    // The map, centered at at the coordinates in 'var centre'
    //mapTypeId determines the type of map on render. Can be 'roadmap', 'satellite', or 'terrain'
    map = new google.maps.Map(
        document.getElementById('map'), {zoom: 7.75, center: centerCoordinates, mapTypeId: 'terrain'});
    // for loop to generate all the markers for sensor position
    for (i=0; i<5; i++){
        let marker = new google.maps.Marker({
            position: {lat: locations[i].lat, lng: locations[i].lng}, 
            map: map,
            title: locations[i].name
        })

        //Data for content must be from same array as data for marker!
        //Otherwise, the InfoWindow will be blank or appear in some odd place
        let infowindow = new google.maps.InfoWindow({
            content: '<div class="infowindowContent">'+
                '<h5 id="location">Sensor location: '+locations[i].name+'</h5>'+
                '<div id="bodyContent">'+
                    '<div>Coordinates: '+ locations[i].lat+', '+ locations[i].lng+'</div>'+    
                    '<div>Elevation: '+ locations[i].elevation+'</div>'+    
                    '<div>CO2 (ppm): '+ locations[i].co2+ ' CH4 (ppb): '+ locations[i].ch4+'</div>'+
                    '<div>Dewpoint temp (°C): '+ locations[i].dewptT+'</div>'+  
                    '<div>Atmospheric pressure (milibar): '+ locations[i].pressure+'</div>'+  
                    '<div>Wind direction (°): '+ locations[i].windDir+ ' Wind speed (m/s): '+ locations[i].windSpd+'</div>'+  
                '</div>'+
            '</div>'
        });
        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });
        
    }            
    
    //For indicating elevation
    var elevator = new google.maps.ElevationService;
    //Renders the popup window indicating metres of elevation
    var infowindow = new google.maps.InfoWindow({map: map});
    // Add a listener click event on 'var map'. Display the elevation for the LatLng of
    // the click inside the infowindow.
    map.addListener('click', function(event) {
        displayLocationElevation(event.latLng, elevator, infowindow);
    });

    //Settings for the heatmap. It is rendered as a layer above the base map stored in 'var map'
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: selectHeatmapData(),
        map: map,
        gradient: co2BrightGradient,
        radius: 40,
    });

    //Renders a popup for each location
    for (i=0; i<locations.length; i++){
        //Renders the <div>-s containing content for reach popup
        //This hijacks the original code that needs a pre-defined <div> containing the popup's content
        const popupContentTarget = document.getElementById('popup-content');
        let popupContent = document.createElement('div');
        popupContent.setAttribute('id','popup-content.'+i); 
        usech4Data === true ? popupContent.innerHTML = `CH4: ${locations[i].ch4} ppb` : popupContent.innerHTML = `CO2: ${locations[i].co2} ppm`;
        popupContentTarget.appendChild(popupContent)

        Popup = createPopupClass();
        //Passes location and content for popup to Popup();
        //The 'content' property takes the entire DOM obtained by document.getElementById
        popup = new Popup(
            new google.maps.LatLng(locations[i].lat, locations[i].lng),
            document.getElementById('popup-content.'+i));
        popup.setMap(map);
    }
}
function displayLocationElevation(location, elevator, infowindow) {
    // Initiate the location request
    elevator.getElevationForLocations({
        'locations': [location]
    }, function(results, status) {
        infowindow.setPosition(location);
        if (status === 'OK') {
            // Retrieve the first result
            if (results[0]) {
            // Open the infowindow indicating the elevation at the clicked position.
            infowindow.setContent('The elevation at this point <br>is ' +
                results[0].elevation.toFixed(0) + ' meters.');
            } else {
            infowindow.setContent('No results found');
            }
        } else {
            infowindow.setContent('Elevation service failed due to: ' + status);
        }
    });
}
function selectHeatmapData () {
    if(usech4Data === false){
        return co2Data;
    } else if(usech4Data === true){
        return ch4Data
    }
}

//createPopupClass() Returns the Popup class.
//Unfortunately, the Popup class can only be defined after
//google.maps.OverlayView is defined, when the Maps API is loaded.
//This function should only be called by initMap.
function createPopupClass() {
    //A customized popup on the map.
    //@param {!google.maps.LatLng} position
    //@param {!Element} content The bubble div.
    //@constructor
    //@extends {google.maps.OverlayView}

    function Popup(position, content) {
        this.position = position;

        content.classList.add('popup-bubble');

        // This zero-height div is positioned at the bottom of the bubble.
        var bubbleAnchor = document.createElement('div');
        bubbleAnchor.classList.add('popup-bubble-anchor');
        bubbleAnchor.appendChild(content);

        // This zero-height div is positioned at the bottom of the tip.
        this.containerDiv = document.createElement('div');
        this.containerDiv.classList.add('popup-container');
        this.containerDiv.appendChild(bubbleAnchor);

        // Optionally stop clicks, etc., from bubbling up to the map.
        google.maps.OverlayView.preventMapHitsAndGesturesFrom(this.containerDiv);
    }
    // ES5 magic to extend google.maps.OverlayView.
    Popup.prototype = Object.create(google.maps.OverlayView.prototype);

    /** Called when the popup is added to the map. */
    Popup.prototype.onAdd = function() {
        this.getPanes().floatPane.appendChild(this.containerDiv);
    };

    /** Called when the popup is removed from the map. */
    Popup.prototype.onRemove = function() {
        if (this.containerDiv.parentElement) {
            this.containerDiv.parentElement.removeChild(this.containerDiv);
        }
    };

    /** Called each frame when the popup needs to draw itself. */
    Popup.prototype.draw = function() {
        var divPosition = this.getProjection().fromLatLngToDivPixel(this.position);

        // Hide the popup when it is far out of view.
        var display =
            Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ?
            'block' :
            'none';

        if (display === 'block') {
            this.containerDiv.style.left = divPosition.x + 'px';
            this.containerDiv.style.top = divPosition.y + 'px';
        }
        if (this.containerDiv.style.display !== display) {
            this.containerDiv.style.display = display;
        }
    };

    return Popup;
}

//These functions alter the heatmap
//Turns the heatmap on/off
function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}
//Toggles the gradient between red-yellow-green to red-cyan-purple
function changeGradient() {
    let targetGradient = [];
    if(heatmap.get('gradient') === co2BrightGradient && usech4Data === false){
        targetGradient = co2DarkGradient
    } else if(heatmap.get('gradient') === co2DarkGradient && usech4Data === false){
        targetGradient = co2BrightGradient
    //Will only work if ch4BrightGradient applied if data source switched to ch4Data
    } else if(heatmap.get('gradient') === ch4BrightGradient && usech4Data === true){
        targetGradient = ch4DarkGradient
    } else if(heatmap.get('gradient') === ch4DarkGradient && usech4Data === true){
        targetGradient = ch4BrightGradient
    }

    heatmap.set('gradient', targetGradient);
}
//Sets radius of heatmap relative to each coordinate in heatmap
function changeRadius() {
    heatmap.set('radius', heatmap.get('radius') ===  40 ? 60 : 40);
}
//Changes the intensity of the heatmap's colours
function changeOpacity() {
    heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}
//Changes which GHG's data is displayed
function changeGHG(){
    usech4Data === false ? (usech4Data = true) : (usech4Data = false); 
    
    //Cannot use heatmap.set to swap 'data' property of rendered heatmap
    //or it will log TypeErrors in console.
    //Need to re-render Map if 'data' property changed
    initMap()

    //Sets the gradient for the resulting Map
    if (usech4Data === false){
        heatmap.set('gradient', co2BrightGradient)
    } else if (usech4Data === true){
        heatmap.set('gradient', ch4BrightGradient)
    }
}