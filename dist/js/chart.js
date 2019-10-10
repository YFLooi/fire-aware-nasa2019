let chart = {};
let updatedDataUsed = false;

const dataSet1 = {
    co2: [
        { label: "SCI", y: 18 },
        { label: "CIT", y: 29 },
        { label: "IRV", y: 40 },                                    
        { label: "GRA", y: 34 },
        { label: "LJA", y: 24 }
    ],
    ch4: [
        { label: "SCI", y: 63.50 },
        { label: "CIT", y: 73.09},
        { label: "IRV", y: 88.03 },                                    
        { label: "GRA", y: 77.06 },
        { label: "LJA", y: 60.02 }
    ],
    tAmb: [
        { label: "SCI", y: 20 },
        { label: "CIT", y: 25.3},
        { label: "IRV", y: 18.7 },                                    
        { label: "GRA", y: 16.2 },
        { label: "LJA", y: 25.3 }
    ]
}
const dataSet2 = {
    co2: [
        { label: "SCI", y: 52.50 },
        { label: "CIT", y: 42.09},
        { label: "IRV", y: 77.03 },                                    
        { label: "GRA", y: 44.06 },
        { label: "LJA", y: 91.02 }
    ],
    ch4: [
        { label: "SCI", y: 33.50 },
        { label: "CIT", y: 23.09},
        { label: "IRV", y: 58.03 },                                    
        { label: "GRA", y: 97.06 },
        { label: "LJA", y: 40.02 }
],
    tAmb: [
        { label: "SCI", y: 30 },
        { label: "CIT", y: 32.3},
        { label: "IRV", y: 7.7 },                                    
        { label: "GRA", y: 33.2 },
        { label: "LJA", y: 12.3 }
    ]
}

function renderChart() {
    chart = new CanvasJS.Chart("chartContainer", {
        //Examples: light1, light2, dark1, dark2
        theme: 'light2',
        title:{
            text: "CO2 and CH4 readings vs various parameters by location"              
        },
        data: [//array of dataSeries objects
            { //dataSeries = CO2
                // Change type "column (vertical bar)" to "bar", "area", "line" or "pie"
                type: "column",
                visible: true,
                name: 'CO2 (ppm)', //Shown in Legend
                showInLegend: true,
                dataPoints: dataSet1.co2
            },
            { //dataSeries = CH4
                type: "column",
                visible: true,
                name: "CH4 (ppb)",       
                showInLegend: true,         
                dataPoints: dataSet1.ch4
            },
            { //dataSeries = ambient temp 1hr average
                type: "line",
                visible: true,
                name: "T ambient (°C)",       
                showInLegend: true,         
                dataPoints: dataSet1.tAmb
            }
        ],
        // Set axisY properties here
        axisY:{
            //prefix: "$",
            //suffix: "ppm",
            //If true, the y-axis starts from zero
            //If false, the y-axis sets itself to include all existing y-values
            //Setting to 'false' allows showing small differences in values much larger than zero
            includeZero: false 
        } 
    });

    chart.render();
}

function updateChart () {
    //Examples of options objects to update a rendered chart:
    //chart.options.title.text = "Chart Title";
    //chart.options.data = [array];
    //chart.options.data[0] = {object};
    //chart.options.data[0].dataPoints = [array];

    let updateData = []
    if (updatedDataUsed === true) {
        updateData = dataSet1;

        //So that next time this function is called, the other
        //data set is used
        updatedDataUsed = false;
    } else if (updatedDataUsed === false) {
        updateData = dataSet2;

        //So that next time this function is called, the other
        //data set is used
        updatedDataUsed = true;
    }

    chart.options.data[0] = {
        type: "column",
        name: "CO2 (ppm)",       
        showInLegend: true,         
        dataPoints: updateData.co2
    };
    chart.options.data[1] = {
        type: "column",
        name: "CH4 (ppb)",       
        showInLegend: true,         
        dataPoints: updateData.ch4
    };
    chart.options.data[2] = {
        type: "line",
        name: "T ambient (°C)",       
        showInLegend: true,         
        dataPoints: updateData.tAmb
    };

    //Once all required updates are entered, the chart is re-rendered
    //to include the updates
    chart.render();
}

//By default, all chartElement-s are selected on load
let chartCO2Copy, chartCh4Copy, chartTAmbCopy = {};
function toggleChartElements (elementNo) {
    //Gets all html elements with name attribute = chartElement into an array
    //Since I set unique names, getting the 1st one is enough
    let chartElementToggled = document.getElementsByName('chartElement')[elementNo];

    if(chartElementToggled.checked === true){ 
        console.log(`${chartElementToggled.value} has been checked`)

        const targetIndex = chart.options.data.findIndex(data => data.name === chartElementToggled.value);
        console.log(`${chart.options.data[targetIndex].name}-s visibility set to ${chart.options.data[targetIndex].visible}`)
        
        chart.options.data[targetIndex].visible = true;
        //Once all required updates are entered, the chart is re-rendered
        //to include the updates
        chart.render();

    } else if(chartElementToggled.checked === false) {
        console.log(`${chartElementToggled.value} has been un-checked`)

        const targetIndex = chart.options.data.findIndex(data => data.name === chartElementToggled.value);
        console.log(`${chart.options.data[targetIndex].name}-s visibility set to ${chart.options.data[targetIndex].visible}`)
        
        chart.options.data[targetIndex].visible = false;
        //Once all required updates are entered, the chart is re-rendered
        //to include the updates
        chart.render();
    }
}
