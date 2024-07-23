
var currentSlide = 1;

// Navigate Slides
const changeSlide = (slideIncrement) =>{
    nextSlide = currentSlide + slideIncrement
    document.getElementById(`${currentSlide}`).classList.remove("pSelected");
    if(nextSlide  > 3){
        console.log('OVER')
        currentSlide = 1;
    } else if (nextSlide  <= 0){
        currentSlide = 3;
    } else{
        currentSlide = nextSlide;
    }
    document.getElementById(`${currentSlide}`).classList.add("pSelected");

    switch(currentSlide) {
        case 1:
            slideOne();
            break;
        case 2: 
            slideTwo();
            break;
        case 3:
            slideThree();
            break;
    }
}

// scatterplot chart of y = highway MGP and x = city MPG
const slideOne = async() =>{
    // create a slider and chart div
    const chartHtml = 
    `   
        <div id="textBox">
            <h3>Save Fuel With Your Next Car</h3>
            The last place you want to spend more is at the pump. Using the <a href="https://github.com/flunky/flunky.github.io">
            2017 Cars Dataset<a/>, this guide will give you insights on how to find a fuel efficent car.
            <br/><br/>
            For engines, did you know that less can be more? It can be when it comes to fuel consumption.
            <br/><br/>
            Depending on the model, lower cylinder engines can improve your fuel efficeny both around town and on the highway.
            <br/><br/>
            Although it may not give you the most powerful speedster on the raceway, if saving money is on
            your mind, your engine composition can make a difference. 
            <br/><br/>
            Of the best engines for MPG performance, the average cylinder count is 
            4.75.
        </div>
        <div id="chart"></div> 
        <h3 id="cylinderSliderText">Max cylinders: </h3> <h3 id="cylinderSliderCounter">12</h3>
        <input type="range" id="cylinderSlider" min="2" max="12" value="12" 
        oninput="cylinderSliderCounter.innerText = this.value">
    `
    document.getElementById('slide').innerHTML=chartHtml
    document.getElementById("chart").innerHTML = ''
    //initialize data
    var data =  d3.csv('https://flunky.github.io/cars2017.csv', function(data){
        // filter out electric cars
        let subset = data.filter(function(d){return d.EngineCylinders > 0})
        subset = subset.sort(function(a,b){return d3.descending(a.AverageHighwayMPG, b.AverageCityMPG)})

        // initiate chart
        const chart = d3.select('#chart')
                        .append("svg")
                        .attr("width", 700)
                        .attr("height", 452 )
                        .append("g")
                        .attr("transform","translate("+75+","+60+")")
    

        // set axis x and y - this will animate from start x/y to end x/y whent he graph is loaded
        const xStart = d3.scaleLinear().domain([0, 0]).range([0, 450])
        const yStart = d3.scaleLinear().domain([0, 0]).range([375, 0])
        const xEnd = d3.scaleLinear().domain([9, 40]).range([0, 450])
        const yEnd = d3.scaleLinear().domain([15, 42]).range([375, 0])

        chart.append("g")
            .attr("transform","translate("+0+","+375+")")
            .call(d3.axisBottom(xEnd))
        chart.append("g")
            .call(d3.axisLeft(yEnd).tickValues([ 5, 10, 15, 20,25, 30, 35, 40]))
        
        // add labels
        chart.append("text")
            .attr("text-anchor", "end")
            .attr("x", 500)
            .attr("y", 360)
            .text("Average City MPG");
        
        chart.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("x", 5)
            .attr("y", 25)
            .text("Average Highway MPG");

        // set the scatterplot colorscheme
        color = d3.scaleLinear()
            .domain([2,12])
            .range([ "grey", "red"])
            .interpolate(d3.interpolateRgb.gamma(2.2))
        
        // create a tooltip div
        const popup = d3.select("#chart")
            .append("div")
            .style("position", "absolute")
            .style("opacity", 0)
            .attr("class", "popup")
            .style("color","yellow")
            .style("background","black")
            .style("padding","5px")
        
        // set the scatterplot dots (start of animation)
        chart.append("g")
        .selectAll("circle")
        .data(subset)
        .enter()
        .append("circle")
        .attr("cx", function (d,i) { 
            return xStart(d.AverageCityMPG); 
        })
        .attr("cy", function(d,i){return  yStart(d.AverageHighwayMPG);})
        .attr("r", 6)
        .style("fill", function (d) { return color(d.EngineCylinders)})
        
        // set the scatterplot dots (end of animation)
        chart.selectAll("circle")
        .transition()
        .delay(function(d,i){return(i*1)})
        .duration(1500)
        .attr("cx", function (d,i) { 
            return xEnd(d.AverageCityMPG); 
        })
        .attr("cy", function(d,i){return  yEnd(d.AverageHighwayMPG);})

         // setup hover tooltip
        chart.selectAll("circle")
        .on("mouseover", function(d){ 
            d3.select(this).transition()
            .duration(50)
            .attr("r",8);
            popup.style("opacity", 100)
            popup.html(`
                Make: ${d.Make} <br/>
                Engine Cylinders: ${d.EngineCylinders} <br/>
                Avg. Highway MPG: ${d.AverageHighwayMPG} <br/>
                Avg. City MPG: ${d.AverageCityMPG}`) 
                .style("left", (d3.mouse(this)[0]+60) + "px")
                .style("top", (d3.mouse(this)[1]-70) + "px")
        }).on("mouseout", function(d){ 
            d3.select(this).transition()
            .duration(50)
            .attr("r",6);
            popup.style("opacity", 0)
            popup.html(``)
        })

        // Annotations
          const type = d3.annotationCalloutCircle

          const annotations = [{
            note: {
              title: "Average of ~4.75 cylinders in top performers"
            },
            dy: 180,
            dx: -10,
            y: 164,
            x: 460,
            subject: {
              radius: 160,
              radiusPadding: 1
            }
          }]
          const addAnnotation = d3.annotation()
            .editMode(false)
            .notePadding(15)
            .type(type)
            .annotations(annotations)

            d3.select("svg")
            .append("g")
            .attr("class", "annotation-group")
            .call(addAnnotation)

        // update the max number of cylinders shown in the data
        const changeCylinders = (count) => {
            const filteredData = []
            for(i in subset){
                if(parseInt(subset[i]["EngineCylinders"]) <= count){
                    filteredData.push(subset[i])
                }
            };

            chart.selectAll("circle")
            .data(filteredData)
            .exit().remove()

            chart.selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", function (d,i) { 
                return xEnd(d.AverageCityMPG); 
            })
            .attr("cy", function(d,i){return  yEnd(d.AverageHighwayMPG);})
            .attr("r", 6)
            .style("fill", function (d) { return color(d.EngineCylinders)})

            // reset hover tooltip
            chart.selectAll("circle")
            .on("mouseover", function(d){ 
                d3.select(this).transition()
                .duration(50)
                .attr("r",8);
                popup.style("opacity", 100)
                popup.html(`
                    Make: ${d.Make} <br/>
                    Engine Cylinders: ${d.EngineCylinders} <br/>
                    Avg. Highway MPG: ${d.AverageHighwayMPG} <br/>
                    Avg. City MPG: ${d.AverageCityMPG}`) 
                    .style("left", (d3.mouse(this)[0]+60) + "px")
                    .style("top", (d3.mouse(this)[1]-70) + "px")
            }).on("mouseout", function(d){ 
                d3.select(this).transition()
                .duration(50)
                .attr("r",6);
                popup.style("opacity", 0)
                popup.html(``)
            })
        };

        d3.select("#cylinderSlider").on("change", function(d){
            count = this.value
            console.error(count)
            changeCylinders(count)
        });
    });
}

// barchart of y = avergae MGP and x = fuel source
const slideTwo = () =>{
    // create a slider and chart div
    const chartHtml = 
    `   
        <div id="textBox">
            <h3>Save Fuel With Your Next Car</h3>
            While the cylinder composition of your engine can make a difference, its fuel type 
            is another consideration for imporving fuel performance.
            <br/><br/>
            A diesel engine (on average) will drive 6 more miles on the highway
            and 5 more miles inner-city. 
            <br/><br/>
            While this can contribute to less frequent refueling, a caveat
            to consider your current location.
            <br><br>
            In the United States at least, diesel remains a small market (<a href="https://www.bbc.com/news/world-us-canada-34329596">LINK</a>).
        </div>
        <div id="chart"></div> 
        <h3 id="cylinderSliderText">Change Driving Location </h3>
        <button class="locationBtnHighway" id="highwayBtn" value="highway">Highway</button>
        <button class="locationBtnCity" id="cityBtn" value="city">City</button>
    `
    document.getElementById('slide').innerHTML=chartHtml
    document.getElementById("chart").innerHTML = ''
    // set dimensions
    const height = 452;

    //initialize data
    var data =  d3.csv('https://flunky.github.io/cars2017.csv', function(data){
        // filter out target fuel types and get MPG averages over all cars
        let gas = data.filter(function(d){return d.Fuel === "Gasoline"})
        let gasHighway = d3.mean(gas, d=> d.AverageHighwayMPG)
        let gasCity = d3.mean(gas, d=> d.AverageCityMPG)

        let diesel = data.filter(function(d){return d.Fuel === "Diesel"})
        let dieselHighway = d3.mean(diesel, d=> d.AverageHighwayMPG)
        let dieselCity = d3.mean(diesel, d=> d.AverageCityMPG)

        // composite into new datasets
        const barChartHighway = [
            {
                Fuel: "Gas",
                AverageMPG: gasHighway,
            },
            {
                Fuel: "Diesel",
                AverageMPG: dieselHighway,            
            }
        ]

        const barChartCity = [
            {
                Fuel: "Gas",
                AverageMPG: gasCity,
            },
            {
                Fuel: "Diesel",
                AverageMPG: dieselCity,            
            }
        ]
        
       

        const changeFuelData = (driveLocation) => {
            const newData = driveLocation == 'city' ? barChartCity: barChartHighway;
            const oldData = driveLocation == 'city' ? barChartHighway : barChartCity;
            const styleClass = driveLocation == 'city' ? 'fuelRectCity' : 'fuelRectHighway'

            //clear older chart
            document.getElementById('chart').innerHTML=''
             // initiate chart
            const chart = d3.select('#chart')
            .append("svg")
            .attr("width", 700)
            .attr("height", height )
            .append("g")
            .attr("transform","translate("+75+","+60+")")

            // add labels
            chart.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("x", 5)
            .attr("y", 25)
            .text("Average Vehicle MPG");
            chart.append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .style("text-decoration", "underline")  
            .attr("x", 275)
            .attr("y", -40)
            .text(`Average vehicle MPG (${driveLocation})`);

            // create a tooltip div
            const popup = d3.select("#chart")
            .append("div")
            .style("position", "absolute")
            .style("opacity", 0)
            .attr("class", "popup")
            .style("color","yellow")
            .style("background","black")
            .style("padding","5px")

            // set axis x and y - this will animate from start x/y to end x/y whent he graph is loaded
            const xScale = d3.scaleBand().domain(newData.map((d)=> {return d.Fuel})).range([0, 450]).padding(0.2)
            const yStart = d3.scaleLinear().domain([0, 0]).range([375, 0])
            const yEnd = d3.scaleLinear().domain([0, 35]).range([375, 0])

            chart.selectAll("rect")
            .data(oldData)
            .exit().remove()

            // set the bar chart  (start of animation)
            chart.append("g")
            .selectAll("rect")
            .data(newData)
            .enter()
            .append("rect")
            .attr("x", function(d,i){return xScale(d.Fuel) + 34})
            .attr("y", function(d,i){return yStart(d.AverageMPG);})
            .attr("width", 100)
            .attr("height", function(d,i){return 370 - yEnd(d.AverageMPG)  })
            .attr("class", styleClass)
            chart.append("g")
            .attr("transform","translate("+0+","+370+")")
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("style","font-size: medium; font-weight: bold")
            .append();
            chart.append("g")
            .call(d3.axisLeft(yEnd))

            // set the bar chart (end of animation)
            chart.selectAll("rect")
            .transition()
            .delay(function(d,i){return(i*1)})
            .duration(600)
            .attr("x", function(d,i){return xScale(d.Fuel) + 34})
            .attr("y", function(d,i){return yEnd(d.AverageMPG);})
            .attr("width", 100)
            .attr("height", function(d,i){return 370 - yEnd(d.AverageMPG)  })
            .attr("style", "outline: solid black; fill: gold;") 
            .attr("class", styleClass)
            chart.append("g")
            .attr("transform","translate("+0+","+370+")")

            // setup hover tooltip
            chart.selectAll("rect")
            .on("mouseover", function(d){ 
            d3.select(this).transition()
            .duration(50)
            popup.style("opacity", 100)
            popup.html(`
                <br/>
                Average ${driveLocation} MPG: ${parseFloat(d.AverageMPG).toFixed(1)}`) 
                .style("left", (d3.mouse(this)[0]+60) + "px")
                .style("top", (d3.mouse(this)[1]-70) + "px")
            }).on("mouseout", function(d){ 
            d3.select(this).transition()
            .duration(50)
            popup.style("opacity", 0)
            popup.html(``)
            })

            //Make annotations
            const type = d3.annotationXYThreshold
            const annotations = [{
                note: {
                title: "Diesel Combined Average MGP (in City or Highway) is 28.5 MPG"
                },
                y: 132,
                x:493,
                subject: {
                    x1: 120,
                    x2: 500
                  }

            }]
            const makeAnnotations = d3.annotation()
                .editMode(false)
                .notePadding(15)
                .type(type)
                .annotations(annotations)

            d3.select("svg")
            .append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations)
        };
        
        changeFuelData('Highway')
        

        d3.select(".locationBtnHighway").on("click", function(d){
            value = this.value
            console.log(value)
            changeFuelData(value)
        });
        d3.select(".locationBtnCity").on("click", function(d){
            value = this.value
            console.log(value)
            changeFuelData(value)
        });
    });
}

// create map of manfuatures, showing mpg performance, cynclinders, fuel types
const slideThree= () =>{
 // create a slider and chart div
    const chartHtml = 
    `   
        <div id="textBox">
            <h3>Save Fuel With Your Next Car</h3>
            While engine composition and fuel type both affect performance, some countries produce 
            cars with higher overall efficiency.
            <br><br>
            For all fuel types, Sweden, Japan, and Korea have the best average MPG. Cars from these countries 
            will be a good place to look for your next purchase.
            <br><br>
            The best performing countries also have descending cylinder counts as MPG increases, so looking for low 
            cylinder engines is still beneficial.
            <br><br>
            If we filter for just diesel cars, Germany and the UK outperform all other countries in MPG, but very few
            countries offer Diesel cars at all. 
            <br><br>
            So while diesel can still be a consideration (along with country and cylinders), it still comes with the caveat
            of limited choices.
        </div>
        <div id="chart"></div> 
        <h3 id="cylinderSliderText">Filter Fuel Types:</h3>
        <button class="locationBtnHighway" id="countryAvgBtn" value="all">All Fuel Types</button>
        <button class="locationBtnCity" id="countryDieselAvgBtn" value="diesel">Diesel Fuel Only</button>
    `
    document.getElementById('slide').innerHTML=chartHtml
    document.getElementById("chart").innerHTML = ''
    // set dimensions
    const height = 452;

    //initialize data
    var data =  d3.csv('https://flunky.github.io/cars2017.csv', function(data){
        // filter out electric cars
        let subset = data.filter(function(d){return d.EngineCylinders > 0})

        //append country data
        subset.forEach(e => {
            e.Country = mapCountry(e.Make)
        });

        // group countries into summaries, with average MPGs, avg cylindercount, gas car count, diesel car count
        let countryAverages = d3.nest().key(function(d){
            return d.Country; })
        .rollup(function(d){
            return{
                AverageHighwayMPG: d3.mean(d, function(e) { return e.AverageHighwayMPG; }),
                AverageCityMPG: d3.mean(d, function(e) { return e.AverageCityMPG; }),
                AverageCylinders: d3.mean(d, function(e) { return e.EngineCylinders; }),
                GasCarCount: d3.sum(d, function(e) { gas = e.Fuel == 'Gasoline' ? 1:0;  return gas; }),
                DieselCarCount: d3.sum(d, function(e) { gas = e.Fuel == 'Diesel' ? 1:0;  return gas; }),
            }
        }).entries(subset)
        .map(function(d){
            return { 
                Country: d.key, 
                AverageHighwayMPG: d.value.AverageHighwayMPG, 
                AverageCityMPG: d.value.AverageCityMPG, 
                AverageMPG: parseFloat((d.value.AverageHighwayMPG + d.value.AverageCityMPG) / 2).toFixed(1),
                AverageCylinders: d.value.AverageCylinders,
                GasCarCount: d.value.GasCarCount,
                DieselCarCount: d.value.DieselCarCount,
            };
        });

        // group for diesel engines only
        const dieselSubset = subset.filter(function(d){return d.Fuel ==='Diesel'})
        let dieselCountryAverages = d3.nest().key(function(d){
            return d.Country; })
        .rollup(function(d){
            return{
                AverageHighwayMPG: d3.mean(d, function(e) { return e.AverageHighwayMPG; }),
                AverageCityMPG: d3.mean(d, function(e) { return e.AverageCityMPG; }),
                AverageCylinders: d3.mean(d, function(e) { return e.EngineCylinders; }),
                GasCarCount: d3.sum(d, function(e) { gas = e.Fuel == 'Gasoline' ? 1:0;  return gas; }),
                DieselCarCount: d3.sum(d, function(e) { gas = e.Fuel == 'Diesel' ? 1:0;  return gas; }),
            }
        }).entries(dieselSubset)
        .map(function(d){
            return { 
                Country: d.key, 
                AverageHighwayMPG: d.value.AverageHighwayMPG, 
                AverageCityMPG: d.value.AverageCityMPG, 
                AverageMPG: parseFloat((d.value.AverageHighwayMPG + d.value.AverageCityMPG) / 2).toFixed(1),
                AverageCylinders: d.value.AverageCylinders,
                GasCarCount: d.value.GasCarCount,
                DieselCarCount: d.value.DieselCarCount,
            };
        });

        // sort the data by DESC average MPG
        countryAverages.sort(function(a,b){
            return a.AverageMPG - b.AverageMPG
        })
        dieselCountryAverages.sort(function(a,b){
            return a.AverageMPG - b.AverageMPG
        })

        const changeCountryData = (filter) => {
            //clear older chart
            document.getElementById('chart').innerHTML=''

            usingData = filter == 'diesel' ? dieselCountryAverages: countryAverages;

            // initiate chart
            const chart = d3.select('#chart')
            .append("svg")
            .attr("width", 700)
            .attr("height", height )
            .append("g")
            .attr("transform","translate("+115+","+60+")")
            
            // set x and y scales
            const countrylist = countryAverages.map((c)=> {return c.Country})
            const xScale= d3.scaleLinear().domain([0, 35]).range([0, 450])
            const yScale = d3.scaleBand().domain(countrylist).range([380, 0]).padding(3)
            chart.append("g")
            .attr("transform","translate("+5+","+0+")")
            .call(d3.axisBottom(xScale))

            .append();
            chart.append("g")
            .attr("style","font-size: medium; font-weight: bold")
            .call(d3.axisLeft(yScale))

            // add labels
            let labelTextTop = '';
            
            if(filter === 'diesel'){
                labelTextTop = 'Average Diesel Car MPG by Country of Origin';
            } else{
                labelTextTop = 'Average Car MPG by Country of Origin';
            }

            chart.append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .style("text-decoration", "underline")  
            .attr("x", 275)
            .attr("y", -30)
            .text(labelTextTop);


            // create a tooltip div
            const popup = d3.select("#chart")
            .append("div")
            .style("position", "absolute")
            .style("opacity", 0)
            .attr("class", "popup")
            .style("color","yellow")
            .style("background","black")
            .style("padding","5px")

            //create the lines
            chart.selectAll("eef")
                .data(usingData)
                .enter()
                .append("line")
                .attr("x1", function(d) { return xScale(d.AverageMPG); })
                .attr("x2", xScale(0))
                .attr("y1", function(d) { return yScale(d.Country); })
                .attr("y2", function(d) { return yScale(d.Country); })
                .attr("stroke", "grey")

            // append and anumate circles
            chart.append("g").selectAll("circle")
            .data(usingData)
            .enter()
            .append("circle")
            .attr("cx", xScale(0))
            .attr("cy", function(d) { return yScale(d.Country); })
            .attr("r", 6)
            .attr("style", "fill: red;") 

            chart.selectAll("circle")
            .transition()
            .delay(function(d,i){return(i*1)})
            .duration(600)
            .attr("cx", function(d) { return xScale(d.AverageMPG); })
            .attr("cy", function(d) { return yScale(d.Country); })
            .attr("r", 6)
            .attr("style", "fill: green; stroke: black") 

            // setup hover tooltip
            chart.selectAll("circle")
            .on("mouseover", function(d){ 
            d3.select(this).transition()
            .duration(50)
            .attr("r",10);
            popup.style("opacity", 100)
            popup.html(`
                ${d.Country}:
                <br>
                - Average MPG: ${parseFloat(d.AverageMPG).toFixed(1)}
                <br>
                - Average Engine Cylinders: ${parseFloat(d.AverageCylinders).toFixed(1)}
                <br>
                - Gas Cars: ${d.GasCarCount}
                <br>
                - Diesel Cars: ${d.DieselCarCount}
                `)
                .style("left", (d3.mouse(this)[0]+60) + "px")
                .style("top", (d3.mouse(this)[1]-70) + "px")
                
            }).on("mouseout", function(d){ 
            d3.select(this).transition()
            .duration(50)
            .attr("r",6);
            popup.style("opacity", 0)
            popup.html(``)
            })

            //Make annotations
            if( filter == 'diesel'){
                const type = d3.annotationXYThreshold
                const annotations = [{
                    note: {
                        label: "Best MPG (Sweden) for combined Gas/Diesel ",
                        lineType: "none",
                        wrap: 150,
                        align: "right"
                    },
                    y: 100,
                    x:460,
                    subject: {
                        y1: 60,
                        y2: 450
                      }
    
                }]
                const makeAnnotations = d3.annotation()
                    .editMode(false)
                    .notePadding(19)
                    .type(type)
                    .annotations(annotations)
    
                d3.select("svg")
                .append("g")
                .attr("class", "annotation-group")
                .call(makeAnnotations)
            } else{
                const type = d3.annotationCallout
                const annotations = [{
                    note: {
                        label: "Top 4 countries have ascending average cylinder counts, inverse to MPG. ",
                        bgPadding: 20,
                    },
                    x: 454,
                    y: 110,
                    dy: 137,
                    dx: 50
                }]
                const makeAnnotations = d3.annotation()
                    .editMode(false)
                    .type(type)
                    .annotations(annotations)

                d3.select("svg")
                .append("g")
                .attr("class", "annotation-group")
                .call(makeAnnotations)
            }

        }

        changeCountryData('all')

        d3.select(".locationBtnHighway").on("click", function(d){
            value = this.value
            console.log(value)
            changeCountryData(value)
        });
        d3.select(".locationBtnCity").on("click", function(d){
            value = this.value
            console.log(value)
            changeCountryData(value)
        });
    });
}

const mapCountry = (mfgName)=>{
    switch(mfgName) {
        case 'Audi':
        case 'BMW':
        case 'Mercedes-Benz':
        case 'Porsche':
        case 'smart':
        case 'Volkswagen':
          return 'Germany';
        case 'Alfa Romeo':
        case 'Ferrari':
        case 'Fiat':
        case 'Lamborghini':
        case 'Maserati':
            return 'Italy';
        case 'Acura':
        case 'Honda':
        case 'Infiniti':
        case 'Lexus':
        case 'Mazda':
        case 'Mitsubishi':
        case 'Nissan':
        case 'Subaru':
        case 'Toyota':
        case 'Genesis':
            return 'Japan';
        case 'Genesis':
        case 'Hyundai':
        case 'Kia':
            return 'South Korea';
        case 'Volvo':
            return 'Sweden';
        case 'Aston Martin':
        case 'Bentley':
        case 'Jaguar':
        case 'Land Rover':
        case 'Lotus':
        case 'McLaren Automotive':
        case 'MINI':
        case 'Rolls-Royce':
            return 'UK';
        case 'Buick':
        case 'Cadillac':
        case 'Chevrolet':
        case 'Chrysler':
        case 'Dodge':
        case 'Ford':
        case 'GMC':
        case 'Jeep':
        case 'Lincoln':
        case 'Ram':
        case 'Roush Performance':
        case 'Tesla':
            return 'USA'
        default:
            console.error('Unkown car maker')
    } 
}
