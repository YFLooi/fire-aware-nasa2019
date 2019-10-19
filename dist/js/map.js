//Locations. Assume this data is retrieved from a db for a specific time and hour
/** */
const database = firebase.database();

//'Popup' is a class, popup is a variable
let map, heatmap, popup, Popup;

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

//Contains all data to render the map
let mapData = [];
//Acts as toggle to determine which data type in mapData[] used to render heatmap and popups under Map pins
//Default is 'power', which measures intensity of fires
let dataType = 'frp';
function runInitMap(newMapData){
    mapData.splice(0, mapData.length)
    console.log('newMapData:');
    console.log(newMapData);

    if(newMapData.length === 0){
        const placeholder = document.createElement('div');
        placeholder.setAttribute('style', 'color:white;');
        placeholder.appendChild(document.createTextNode('No data found for selected date'));

        document.getElementById('map').appendChild(placeholder);
    } else {
        document.getElementById('map').innerHTML = '';
        mapData = [...mapData, ...newMapData];
        initMap();
    }
}
function updateDataType (newDataType){
    dataType = newDataType;
    initMap();
}

// On page load, initialize and add the map
function initMap() {
    // The location of centre point. Here, we choose the middle of the South China Sea
    var centerCoordinates = {lat: 9.5, lng: 113.7};  
    // The map, centered at at the coordinates in 'var centre'
    //mapTypeId determines the type of map on render. Can be 'roadmap', 'satellite', or 'terrain'
    map = new google.maps.Map(
        document.getElementById('map'), {zoom: 4.2, center: centerCoordinates, mapTypeId: 'terrain'});
    // for loop to generate all the markers for anomaly position
    for (i=0; i<mapData.length; i++){
        let marker = new google.maps.Marker({
            position: {lat: mapData[i].latitude, lng: mapData[i].longlitude}, 
            map: map,
            title: 'Anomaly detected' //Appears on hover over the marker
        })

        //Data for content must be from same array as data for marker!
        //Otherwise, the InfoWindow will be blank or appear in some odd place
        let infowindow = new google.maps.InfoWindow({
            content: '<div class="infowindowContent">'+
                '<div id="location"><b>Thermal anomaly at '+mapData[i].latitude+' ,'+mapData[i].longlitude+'</b></div>'+
                '<div id="bodyContent">'+
                    '<div>Fire Radiative Power (FRP): '+Math.round(mapData[i].frp)+' MW</div>'+    
                    '<div>Confidence: '+mapData[i].confidence+' %</div>'+    
                '</div>'+
            '</div>'
        });
        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });
        
    }            
   
    //Settings for the heatmap. It is rendered as a layer above the base map stored in 'var map'
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: selectHeatmapData(),
        map: map,
        gradient: ch4BrightGradient,
        radius: 30
    });

    /** 
    //Renders a popup for each location
    for (i=0; i<mapData.length; i++){
        //Renders the <div>-s containing content for reach popup
        //This hijacks the original code that needs a pre-defined <div> containing the popup's content
        const popupContentTarget = document.getElementById('popup-content');
        let popupContent = document.createElement('div');
        popupContent.setAttribute('id','popup-content.'+i); 

        if(dataType === 'power'){
            popupContent.innerHTML = `Power: ${mapData[i].power} MW` 
            popupContentTarget.appendChild(popupContent)
        }else if (dataType === 'confidence'){
            popupContent.innerHTML = `Confidence: ${mapData[i].confidence} %` 
            popupContentTarget.appendChild(popupContent)
        } else {
            console.log('Invalid value assigned to dataType');
        }

        Popup = createPopupClass();
        //Passes location and content for popup to Popup();
        //The 'content' property takes the entire DOM obtained by document.getElementById
        popup = new Popup(
            new google.maps.LatLng(mapData[i].latitude, mapData[i].longlitude),
            document.getElementById('popup-content.'+i));
        popup.setMap(map);
    }
    */
}
function selectHeatmapData () {
    heatmapData = []
    console.log('dataType sent to selectHeatmap data: '+dataType);

    if(dataType === 'frp'){
        for(i=0; i<mapData.length; i++){
            heatmapData[i] = { location: new google.maps.LatLng(mapData[i].latitude, mapData[i].longlitude), weight: (mapData[i].frp) }
        }
    }else if (dataType === 'confidence'){
        for(i=0; i<mapData.length; i++){
            heatmapData[i] = { location: new google.maps.LatLng(mapData[i].latitude, mapData[i].longlitude), weight: (mapData[i].confidence) }
        }
    }else {
        console.log('Invalid string assigned to dataType')
    }
    return heatmapData
}
//Changes data assigned to mapData() to one from different date
function changeMapData(form){
    const day = form.dayInput.value;
    const month = form.monthInput.value;
    const year = form.yearInput.value;
    const tod = form.todInput.value;
    let databaseUrl = day+month+year+tod; //Ex: modis/1Sept2019
    console.log('Target databaseUrl: '+databaseUrl)

    database.ref('modis/'+databaseUrl).once('value', (snapshot) => {
      //Gets object attached to 'snapshot'            
      const data = snapshot.val()
      console.log(data)
      //console.log(Object.keys(data).length);

      if(data === null || data.length === 0){
        document.getElementById('map').innerHTML = '';

        const placeholder = document.createElement('div');
        placeholder.setAttribute('style', 'color:white; text-align: center;');
        placeholder.appendChild(document.createTextNode('No data found for selected date'));
        document.getElementById('map').appendChild(placeholder);
        /** 
        document.getElementById('map').innerHTML = 'No data found for selected date';
        console.log('Error retrieving data from Firebase db')
        */
      } else {
        const dataArray = Object.values(data);
        console.log(dataArray)
        runInitMap(dataArray);
      }
    })
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
/* 
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
*/


//These functions alter the heatmap
//Turns the heatmap on/off
function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}
//Toggles the gradient between red-yellow-green to red-cyan-purple
/** 
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
*/
//Changes which of current date's data is displayed

