// Master is a general controller for all the created objects
var YEAR = 2018, // DEFAULT YEAR
    CG = null;

$(function(){
    var queryParams = {}, 
        queryStr = location.search.substring(1),
        re = /([^&=]+)=([^&]*)/g, 
        m;
 
    while(m = re.exec(queryStr)){
        queryParams[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    if(queryParams['y']){
        YEAR = queryParams['y'];
        $("#yearSelector").val(YEAR);
    }

    $("#yearSelector").on("change", function(){
        queryParams['y'] = 1*$(this).find("option:selected").val();
        location.search = $.param(queryParams);
    });
    if (queryParams['mode'] === "print") {
        $("#menu").addClass("hidden"); // PRINT VERSION
    }
    
    CG = function(){
        var width = window.innerWidth, 
            height = window.innerHeight - 120,
            padding = {x: 35, y: 40, bottom: 40, right: 35},
            cellHeader = 40,
            counter = 0,
            currentMonth = new Date("Jan 1, " + YEAR).getMonth(),
            datesGroup;


        function __CalendarWidth() { return width; }
        function __CalendarHeight() { return height; }
        function __Padding() { return padding; }
        function __CellHeader() { return cellHeader; }
        function __GridWidth() { return width - padding.x - padding.right; }
        function __GridHeight() { return height - padding.y - padding.bottom; }
        function __CellWidth() { return __GridWidth() / 7; }
        function __CellHeight() { return __GridHeight() / __weeksInMonth(); }
        function __GetDatesGroup() {
            return datesGroup;
        }
        function __SetDatesGroup(value) {
            datesGroup = value;
        }
        function __IncrementCounter() { counter = counter + 1; }
        function __DecrementCounter() { counter = counter - 1; }
        function __MonthToDisplay() {
            var dateToDisplay = new Date();
            dateToDisplay.setMonth(currentMonth + counter);
            return dateToDisplay.getMonth();
        }
        function __MonthToDisplayAsText() { return eng.months[__MonthToDisplay()]; }
        function __YearToDisplay() {
            var dateToDisplay = new Date("Jan 1, " + YEAR);
            dateToDisplay.setMonth(currentMonth + counter);
            return dateToDisplay.getFullYear();
        }
        function __GridCellPositions() {
            // We store the top left positions of a 7 by 5 grid.
            var cellPositions = [];
            for (var y = 0; y < __weeksInMonth(); y++) {
                for (var x = 0; x < 7; x++) {
                    cellPositions.push([x * __CellWidth(), y * __CellHeight()]);
                }
            }
            return cellPositions;
        }

        function __weeksInMonth(){
            var numWeeks = 5,
                firstDayOfTheWeek = new Date(__YearToDisplay(), __MonthToDisplay(), 1).getDay(),
                daysInMonth = new Date(__YearToDisplay(), __MonthToDisplay() + 1, 0).getDate();
            
            if(firstDayOfTheWeek > 4 && daysInMonth === 31){
                numWeeks = 6;
            }else if(firstDayOfTheWeek > 5 && daysInMonth === 30){
                numWeeks = 6;
            }else if(firstDayOfTheWeek < 1 && daysInMonth === 28){
                numWeeks = 4;
            }
            //console.log(__MonthToDisplay(), firstDayOfTheWeek, daysInMonth, numWeeks)
            return numWeeks;
        }

        // This function generates all the days of the month, last and next added on.
        function __DaysInMonth() {
            var daysArray = [],
                firstDayOfTheWeek = new Date(__YearToDisplay(), __MonthToDisplay(), 1).getDay(),
                daysInPreviousMonth = new Date(__YearToDisplay(), __MonthToDisplay(), 0).getDate();

            // Last month
            for (var i = 1; i <= firstDayOfTheWeek; i++) {
                daysArray.push([daysInPreviousMonth - firstDayOfTheWeek + i, false, new Date(__YearToDisplay(), __MonthToDisplay()-1, daysInPreviousMonth - firstDayOfTheWeek + i)]);
            }

            // Current month
            var daysInMonth = new Date(__YearToDisplay(), __MonthToDisplay() + 1, 0).getDate();
            for (var i = 1; i <= daysInMonth; i++) {
                daysArray.push([i, true, new Date(__YearToDisplay(), __MonthToDisplay()+0,  i)]);
            }
            
            // Next month
            var daysRequiredFromNextMonth = 7 * __weeksInMonth() - daysArray.length;
            for (var i = 1; i <= daysRequiredFromNextMonth; i++) {
                daysArray.push([i, false, new Date(__YearToDisplay(), __MonthToDisplay()+1,  i)]);
            }

            return daysArray.slice(0, 7 * __weeksInMonth());
        }
        
        function __Days(_currentMonthData){
            var days = [];
            __DaysInMonth().forEach(function(d, i){
                var dd = {
                    number: d[0],
                    date: d[2],
                    current: d[1],
                    x: __GridCellPositions()[i][0],
                    y:__GridCellPositions()[i][1]
                };
                if(_currentMonthData) dd = $.extend(dd, _currentMonthData[i]);
                days.push(dd);
            });
            return days;
        }

        return {
            width: __CalendarWidth,
            height: __CalendarHeight,
            padding :__Padding(),
            cellHeader :__CellHeader(),
            gridWidth :__GridWidth,
            gridHeight :__GridHeight,
            cellWidth :__CellWidth,
            cellHeight :__CellHeight,
            getDatesGroup : __GetDatesGroup,
            setDatesGroup: __SetDatesGroup,
            incrementCounter : __IncrementCounter,
            decrementCounter : __DecrementCounter,
            monthToDisplay : __MonthToDisplay,
            monthToDisplayAsText : __MonthToDisplayAsText,
            yearToDisplay: __YearToDisplay,
            gridCellPositions: __GridCellPositions,
            daysInMonth : __DaysInMonth,
            days: __Days,
            weeksInMonth: __weeksInMonth
        };
    }();

    
    // INITIALIZE
    var parseDate = d3.time.format("%m/%d/%Y %I:%M %p").parse,
        timeScale = d3.time.scale().range([0, CG.width() - CG.padding.x - CG.padding.right]),
        tideScale = d3.scale.linear().domain([-.5, 4]).range([CG.cellHeight(), CG.cellHeader]);
    
    loadData();
    function loadData(){
        var READY = -2;
        
        d3.csv("data/" + YEAR + " Sun Data.csv", function(error, _data) {
            if(error){ return console.warn(error); }

            _data.forEach(function(d){
                d.rise = parseDate(d.rise);
                d.set = parseDate(d.set);
                d.moon = 1*d.moon;
                d.phase = 1*d.phase;
            });
            
            dig.sunData = _data;
            ready();
        });
        d3.csv("data/" + YEAR + " Moon Data.csv", function(error, _data) {
            if(error){ return console.warn(error); }

            _data.forEach(function(d){
                d.rise = parseDate(d.rise);
                d.set = parseDate(d.set);
                //d.full = d.full*1;
            });
            dig.moonData = _data;
            ready();
        });
        d3.csv("data/" + YEAR + " Hanalei Tide Data.csv", function(error, _data) {
            if(error){ return console.warn(error); }

            _data.forEach(function(d){
                d.date = parseDate(d.date);
            });
            dig.tideData = _data;
            ready();
        });
        
        function ready(){
            READY++;
            READY > 0 ? renderMonth() : null;
        }
    }
    
    function renderMonth(){
        //TODO: don't load data everytime
        parseDate = d3.time.format("%m/%d/%Y %I:%M %p").parse;
        timeScale = d3.time.scale().range([0, CG.width() - CG.padding.x - CG.padding.right]);
        tideScale = d3.scale.linear().domain([-.5, 4]).range([CG.cellHeight(), CG.cellHeader]);
        
        console.log("sundata:", dig.sunData.length);
        renderCalendarGrid();
        renderDaysOfMonth(dig.sunData);
        
        drawSunBlocks(dig.sunData);
        drawMoonPhase(dig.sunData);
        drawMoonBlocks(dig.moonData);
        drawTideGraph(dig.tideData);
    }

    $('#back').click(displayPreviousMonth);
    $('#forward').click(displayNextMonth);
    function displayPreviousMonth() {
        CG.decrementCounter();
        renderMonth();
    }
    function displayNextMonth(){
        CG.incrementCounter();
        renderMonth();
    }


    function renderCalendarGrid(month, year) {
        var cell = CG.gridCellPositions(),
            cw = CG.cellWidth(), ch = CG.cellHeight(),
            daysInMonthToDisplay = CG.daysInMonth(),
            T = "translate(" + CG.padding.x + "," + CG.padding.y + ")",
            TM = "translate(" + (CG.padding.x + cw - 20) + "," + (CG.padding.y + .5*CG.cellHeader) + ")";

        $("#calendar").empty();

        // Add the svg element.
        CG.svg = d3.select("#calendar")
          .append("svg")
            .attr("class", "calendar")
            .attr("width", CG.width() )
            .attr("height", CG.height())
            .append("g");

        // clipping areas
        var defs = CG.svg.append("defs");
        defs.append("clipPath").attr("id", "clipArea")
          .append("rect")
            .attr("x", CG.padding.x)
            .attr("y", CG.padding.y)
            .attr("width", CG.width() - CG.padding.x - CG.padding.right)
            .attr("height", CG.height() - CG.padding.y - CG.padding.bottom);
    
        var clipCircles = defs.append("clipPath").attr("id", "clipCircles")
            .selectAll("circle")
            .data(cell).enter();
        clipCircles.append("circle")
            .attr("cx", function (d) { return d[0]; })
            .attr("cy", function (d) { return d[1]; })
            .attr("r", 13)
            .attr("transform", TM);
    
        // date header gradient
        /*
        var gradient = defs.append("linearGradient").attr("id", "dateHeaderGradient");
          gradient.append("stop")
            .attr("offset", "59%")
            .attr("stop-color", "#f4f4f4");
          gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#e0e4e7");
        */

        // add z regions
        CG.zBelow = CG.svg.append("g").attr("id", "below");
        CG.zMiddle = CG.svg.append("g").attr("id", "middle");
        CG.zAbove = CG.svg.append("g").attr("id", "above");
        CG.zMask = CG.svg.append("g").attr("id", "mask");

        // This adds the day of the week headings on top of the grid
        CG.headerGroup = CG.zBelow.append("svg:g").attr("class", "headers");
        CG.headerGroup.selectAll("rect")
             .data([0, 1, 2, 3, 4, 5, 6]).enter()
           .append("rect")
             .attr("class", function (d) { return "z" + d%2; })
             .attr("x", function (d) { return CG.padding.x + cell[d][0]; })
             .attr("y", function (d) { return CG.padding.y - 45 + cell[d][1]; })
             .attr("width", cw )
             .attr("height", 45 );
        CG.headerGroup.selectAll("text.eng")
             .data([0, 1, 2, 3, 4, 5, 6]).enter()
           .append("text").attr("class", "eng")
             .attr("x", function (d) { return cell[d][0] + 1*cw; })
             .attr("y", function (d) { return cell[d][1]; })
             .attr("dx", CG.padding.x - 13)
             .attr("dy", CG.padding.y - 15)
             .attr("text-anchor", "middle")
             .text(function (d) { return eng.days[d]; });
        CG.headerGroup.selectAll("text.hwn")
             .data([0, 1, 2, 3, 4, 5, 6]).enter()
           .append("text").attr("class", "hwn")
             .attr("x", function (d) { return cell[d][0] + 0*cw; })
             .attr("y", function (d) { return cell[d][1]; })
             .attr("dx", CG.padding.x + 10)
             .attr("dy", CG.padding.y - 15)
             .attr("text-anchor", "middle")
             .text(function (d) { return hwn.days[d]; });
     
        CG.tideTickGroup = CG.zBelow.append("svg:g");
        var tideRange = [0, 1, 2];
        var ticksTide = d3.range(0, CG.daysInMonth().length, 7);
        tideRange.forEach(function(_t){
            var tick = CG.tideTickGroup.selectAll("line.h" + _t)
                .data(ticksTide).enter();
            tick.append("text").attr("class", "tideTick t" + _t)
                .attr("x", function(d, i) { return cell[d][0]; })
                .attr("y", function(d, i) { return cell[d][1] + tideScale(_t); })
                .attr("dx", -4).attr("dy", 3)
                .attr("transform", T)
                .attr("text-anchor", "end")
                .text(function (d){ if(_t >= 0){ return _t + " ft"; } });
            /*tick.append("line").attr("class", "tideTick t" + _t)
                .attr("x1", function(d, i) { return cell[d][0]; })
                .attr("y1", function(d, i) { return cell[d][1] + tideScale(_t); })
                .attr("x2", function(d, i) { return cell[d][0] - 4; })
                .attr("y2", function(d, i) { return cell[d][1] + tideScale(_t); })
                .attr("transform", T);*/
        });
        var ticksTide2 = d3.range(6, CG.daysInMonth().length, 7);
        tideRange.forEach(function(_t){
            var tick = CG.tideTickGroup.selectAll("line.h" + _t)
                .data(ticksTide2).enter();
            tick.append("text").attr("class", "tideTick t" + _t)
                .attr("x", function(d, i) { return cell[d][0] + cw; })
                .attr("y", function(d, i) { return cell[d][1] + tideScale(_t); })
                .attr("dx", 4).attr("dy", 3)
                .attr("transform", T)
                .text(function (d){ if(_t >= 0){ return _t + " ft"; } });
            /*tick.append("line").attr("class", "tideTick t" + _t)
                .attr("x1", function(d, i) { return cell[d][0] + cw; })
                .attr("y1", function(d, i) { return cell[d][1] + tideScale(_t); })
                .attr("x2", function(d, i) { return cell[d][0] + cw + 4; })
                .attr("y2", function(d, i) { return cell[d][1] + tideScale(_t); })
                .attr("transform", T);*/
        });
        CG.tideGrid = CG.zAbove.append("svg:g");
        var tideRange = [0, 1, 2];
        /*tideRange.forEach(function(_t){
            CG.tideGrid.selectAll("line.t" + _t)
                .data(CG.daysInMonth()).enter()
              .append("line").attr("class", "tide t" + _t)
                .attr("x1", function(d, i) { return cell[i][0] + 1; })
                .attr("x2", function(d, i) { return cell[i][0] + cw - 1; })
                .attr("y1", function(d, i) { return cell[i][1] + tideScale(_t); })
                .attr("y2", function(d, i) { return cell[i][1] + tideScale(_t); })
                .attr("transform", T);
        });*/
        CG.tideZero = CG.zBelow.append("svg:g")
              .selectAll("rect")
                .data(CG.daysInMonth()).enter()
              .append("rect").attr("class", "tideZero")
                .attr("x", function(d, i) { return cell[i][0] + 1; })
                .attr("y", function(d, i) { return cell[i][1] + tideScale(0); })
                .attr("width", cw).attr("height", tideScale(-.5)-tideScale(0))
                .attr("transform", T);
     

        CG.tickHourGroup = CG.zBelow.append("svg:g");
        var hourTick = [{h: 6, label: "6am"}, {h: 12, label: "12pm"}, {h: 18, label: "6pm"}, {h: 24, label: "12am"}];
        var ticksDays = d3.range(CG.daysInMonth().length - 7, CG.daysInMonth().length);
        hourTick.forEach(function(_h){
            var tick = CG.tickHourGroup.selectAll("line.h" + _h.h)
                .data(ticksDays).enter();
            tick.append("text").attr("class", "hourTick h" + _h.h)
                .attr("x", function(d, i) { return cell[d][0] + _h.h*cw/24; })
                .attr("y", function(d, i) { return cell[d][1] + ch; })
                .attr("dy", 15)
                .attr("transform", T)
                .attr("text-anchor", "middle")
                .text(function (d) { return _h.label; });
            tick.append("line").attr("class", "hourTick h" + _h.h)
                .attr("x1", function(d, i) { return cell[d][0] + _h.h*cw/24; })
                .attr("y1", function(d, i) { return cell[d][1] + ch; })
                .attr("x2", function(d, i) { return cell[d][0] + _h.h*cw/24; })
                .attr("y2", function(d, i) { return cell[d][1] + ch + 4; })
                .attr("transform", T);
        });
        CG.hourGroup = CG.zBelow.append("svg:g");
        var hour6 = [6, 12, 18, 24];
        hour6.forEach(function(_h){
            tideRange.forEach(function(_t){
                var gline = CG.hourGroup.selectAll("line.h" + _h + ".t" + _t)
                    .data(CG.daysInMonth()).enter();
                gline.append("line").attr("class", "hour6 h" + _h + " t" + _t)
                    .attr("x1", function(d, i) { return cell[i][0] + _h*cw/24 - 0; })
                    .attr("y1", function(d, i) { return cell[i][1] + tideScale(_t); })
                    .attr("x2", function(d, i) { return cell[i][0] + (_h - 6)*cw/24 + 1; })
                    .attr("y2", function(d, i) { return cell[i][1] + tideScale(_t); })
                    .attr("transform", T);
                gline.append("line").attr("class", "hour6 h" + _h + " t" + _t)
                    .attr("x1", function(d, i) { return cell[i][0] + _h*cw/24 - 0; })
                    .attr("y1", function(d, i) { return cell[i][1] + tideScale(_t) + 3; })
                    .attr("x2", function(d, i) { return cell[i][0] + _h*cw/24 - 0; })
                    .attr("y2", function(d, i) { return cell[i][1] + tideScale(_t) - 3; })
                    .attr("transform", T);
            });
        });
        
        //DOTS
        /*var rGridScale = d3.scale.linear().domain([-.75, 1.75]).range([6, 24]);
        hour6.forEach(function(_h){
            tideRange.forEach(function(_t){
                CG.hourGroup.selectAll("circle.h" + _h + ".t" + _t)
                    .data(CG.daysInMonth()).enter()
                  .append("circle").attr("class", "hour6 h" + _h + " t" + _t)
                    .attr("cx", function(d, i) { return cell[i][0] + _h*cw/24; })
                    .attr("cy", function(d, i) { return cell[i][1] + tideScale(_t); })
                    .attr("r", rGridScale )
                    .attr("transform", T);
            });
        });*/
        /*hour6.forEach(function(_h){
            CG.hourGroup.selectAll("line.h" + _h)
                .data(CG.daysInMonth()).enter()
              .append("line").attr("class", "hour6 h" + _h)
                .attr("x1", function(d, i) { return cell[i][0] + _h*cw/24; })
                .attr("x2", function(d, i) { return cell[i][0] + _h*cw/24; })
                .attr("y1", function(d, i) { return cell[i][1]; })
                .attr("y2", function(d, i) { return cell[i][1] + ch; })
                .attr("transform", T);
        });*/
        
        /*var hour1 = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23];
        hour1.forEach(function(_h){
            CG.hourGroup.selectAll("line.h" + _h)
                .data(CG.daysInMonth()).enter()
              .append("line").attr("class", "hour1 h" + _h)
                .attr("x1", function(d, i) { return cell[i][0] + _h*cw/24; })
                .attr("x2", function(d, i) { return cell[i][0] + _h*cw/24; })
                .attr("y1", function(d, i) { return cell[i][1]; })
                .attr("y2", function(d, i) { return cell[i][1] + ch; })
                .attr("transform", T);
        });*/


        // Draw date header boxes
        CG.dateHeader = CG.zAbove.selectAll(".dateHeader rect, .dateHeader line")
            .data(cell).enter()
          .append("g").attr("class", "dateHeader");
        
        CG.dateHeader.append("rect")
            .attr("x", function (d) { return d[0] + 0; })
            .attr("y", function (d) { return d[1] + 0; })
            .attr("width", cw - 0)
            .attr("height", CG.cellHeader - 0)
            .attr("transform", T);
        /*CG.dateHeader.append("line")
            .attr("x1", function (d) { return d[0]; })
            .attr("y1", function (d) { return d[1] + CG.cellHeader; })
            .attr("x2", function (d) { return d[0] + cw; })
            .attr("y2", function (d) { return d[1] + CG.cellHeader; })
            .attr("transform", T);
        */

        // draw date boxes
        CG.dateBox = CG.zMask.append("svg:g").attr("class", "dateBox");
        CG.dateBox.selectAll("rect")
            .data(cell).enter()
          .append("rect")
            .attr("x", function (d) { return d[0]; })
            .attr("y", function (d) { return d[1]; })
            .attr("width", cw)
            .attr("height", ch - 1)
            .attr("transform", T);

        var lineGroup = CG.zAbove.append("svg:g")
        var lines = lineGroup.attr("class", "dateGrid").selectAll("line")
            .data(cell).enter();
          lines.append("line")
            .attr("x1", function (d) { return d[0]; })
            .attr("x2", function (d) { return d[0] + cw; })
            .attr("y1", function (d) { return d[1]; })
            .attr("y2", function (d) { return d[1]; })
            .attr("transform", T);
          lines.append("line")
            .attr("x1", function (d) { return d[0]; })
            .attr("x2", function (d) { return d[0]; })
            .attr("y1", function (d) { return d[1]; })
            .attr("y2", function (d) { return d[1] + 40; })
            .attr("transform", T);


        // Day number labels
        CG.dateTitleGroup = CG.zAbove.append("svg:g");
        CG.dateTitleGroup 
             .selectAll("text")
             .data(daysInMonthToDisplay).enter()
           .append("text");

        // Moon cycle labels
        CG.dateMoonCycle = CG.zAbove.append("svg:g");
        CG.dateMoonCycle 
             .selectAll("text")
             .data(daysInMonthToDisplay).enter()
           .append("text");
    }

    function renderDaysOfMonth(_data) {
        $('#currentMonth').text(CG.monthToDisplayAsText());
        $('#hawaiianMonth').text(hwn.months[CG.monthToDisplay()]);
        $('#currentYear').text(CG.yearToDisplay());
        
        var sd = _data.slice(0);
        var firstDate = CG.days()[0].date,
            zeroDate = d3.time.day.offset(firstDate, -1),
            start = -1;
        sd.forEach(function(d, i){
            if(zeroDate < d.rise && firstDate > d.rise ){
                start = i;
            }
        });
        console.debug("start", start, firstDate, zeroDate, sd);
        if(start > -1){
            var filteredDays = CG.days(sd.slice(start, start + 7*CG.weeksInMonth())),
                cw = CG.cellWidth(),
                T = "translate(" + CG.padding.x + "," + CG.padding.y + ")";

            CG.dateTitleGroup.selectAll("text")
                .data(filteredDays)
                .attr("class", "dateTitle")
                .attr("x", function (d,i) { return d.x; })
                .attr("y", function (d,i) { return d.y; })
                .attr("dx", 10)
                .attr("dy", 30)
                .attr("transform", T)
                .text(function (d) { return d.number; }); // Render text for the day of the week

            CG.dateMoonCycle.selectAll("text")
                .data(filteredDays)
                .attr("class", "dateMoonLabel")
                .attr("x", function (d, i) { return d.x + cw; })
                .attr("y", function (d, i) { return d.y; })
                .attr("dx", -50)
                .attr("dy", 27)
                .attr("text-anchor", "end")
                .attr("transform", T)
                .text(function (d, i) { return hwn.moon[d.phase - 1]; });

            CG.dateBox.selectAll("rect")
                .data(filteredDays)
                .attr("class", function(d){ return d.current ? "" : "mask"; });
        }
    }

    function drawMoonPhase(_data) {
        $("g.moonCycle").remove();
        var R = 13,
            cw = CG.cellWidth(),
            TM = "translate(" + (CG.padding.x + cw - 20) + "," + (CG.padding.y + .5*CG.cellHeader) + ")";
        
        var firstDate = CG.days()[0].date;
        var zeroDate = d3.time.day.offset(firstDate, -1);
        
        var start = -1;
        _data.forEach(function(d, i){
            if(zeroDate < d.rise && firstDate > d.rise ){
                start = i;
            }
        });
        if(start > -1){
            var filteredDays = CG.days(_data.slice(start, start + 7*CG.weeksInMonth()));
            var moonGrouplet = CG.zAbove.selectAll(".moonCycle circle")
                .data(filteredDays).enter()
              .append("g")
                .attr("class", "moonCycle")
                .attr("clip-path", "url(#clipCircles)")
                .attr("transform", "translate(-10)");

            //NOTE: full moon = 1; new moon = 0;
            // <path d="M100 0  A50 50 0 1 1 100 100  45 50 0 1 0 100 0z" />

            moonGrouplet.append("circle")
                .attr("class", function(d){
                    var f = d.moon;
                    if(0 <= f && f < .25 ){         return "black";
                    }else if(.25 <= f && f < .5 ){  return "white";
                    }else if(.5 <= f && f < .75 ){  return "white";
                    }else if(.75 <= f && f <= 1 ){  return "black";
                    }else{return f;
                    }
                })
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })
                .attr("r", R)
                .attr("transform", TM);
    
             moonGrouplet.append("ellipse")
                .attr("class", function(d){
                    var f = d.moon;
                    if(0 <= f && f < .25 ){         return "white";
                    }else if(.25 <= f && f < .5 ){  return "black";
                    }else if(.5 <= f && f < .75 ){  return "black";
                    }else if(.75 <= f && f <= 1 ){  return "white";
                    }else{return f;
                    }
                })
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })
                .attr("ry", R)
                .attr("rx", function (d) { 
                    var f = d.moon;
                    var a = .033;
                    if(0 <= f && f < .25 ){         return R*(1 - 4*f + a);
                    }else if(.25 <= f && f < .5 ){  return R*(4*f - 1 - a);
                    }else if(.5 <= f && f < .75 ){  return R*(3 - 4*f + a);
                    }else if(.75 <= f && f <= 1 ){  return R*(4*f - 3 - a);
                    }else{return f;
                    }
                    /*var RR = Math.abs(Math.cos(f * Math.PI * 2));
                    return R * RR*RR*RR*RR;*/
                })
                .attr("transform", TM);   
    
             moonGrouplet.append("rect")
                .attr("class", function(d){
                    var f = d.moon;
                    if(0 <= f && f < .25 ){         return "white";
                    }else if(.25 <= f && f < .5 ){  return "black";
                    }else if(.5 <= f && f < .75 ){  return "black";
                    }else if(.75 <= f && f <= 1 ){  return "white";
                    }else{return f;
                    }
                })
                .attr("x", function (d) { 
                    var f = d.moon;
                    if(0 <= f && f < .25 ){         return d.x - 2.2*R;
                    }else if(.25 <= f && f < .5 ){  return d.x + 0;
                    }else if(.5 <= f && f < .75 ){  return d.x - 2.2*R;
                    }else if(.75 <= f && f <= 1 ){  return d.x + 0;
                    }else{return f;
                    }
                })
                .attr("y", function (d) { return d.y; })
                .attr("width", 2.2*R).attr("height", CG.cellHeader)
                .attr("transform", "translate(" + (CG.padding.x + cw - 20) + "," + (CG.padding.y) + ")");
        
             moonGrouplet.append("circle")
                .attr("class", "rim")
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })
                .attr("r", R)
                .attr("transform", TM);
    
        }
    }

    function writeTime(_date){
        var hour = _date.getHours();
        hour = hour > 12 ? hour - 12 : hour;

        var min = _date.getMinutes();
        min = min < 10 ? "0" + min : min;

        return (hour === 0 ? 12: hour) + ":" + min + "" + (_date.getHours() > 11 ? "pm" : "am");
    }
    function drawSunBlocks(_data) {

        $("g.sunData").remove();
        CG.drawSun = CG.zAbove.append("svg:g").attr("class", "sunData").attr("clip-path", "url(#clipArea)");

        var dim = CG.daysInMonth();
        for(var w = 0; w < CG.weeksInMonth(); w++){
            timeScale.domain([dim[w * 7][2], d3.time.second.offset(d3.time.day.offset(dim[(w * 7) + 6][2], 1), -1)]);

            var filteredData = _data.filter(function(_d){
                var d = _d;
                if(d.rise && d.set){
                    return d3.time.day.offset(d.rise, 1) > dim[(w * 7)][2] && d3.time.day.offset(d.set, -1) < dim[(w * 7) + 6][2];
                }else{
                    return false;
                }
            });

            var sunGrouplet = CG.drawSun.selectAll("rect.w" + w)
                .data(filteredData).enter()
              .append("g");

            var Y = w * CG.cellHeight() + CG.cellHeader + 28,
                H = 18,
                T = "translate(" + CG.padding.x + "," + CG.padding.y + ")";

            sunGrouplet.append("line")
                .attr("class", "w" + w)
                .attr("x1", function (d) { return timeScale(d.rise); })
                .attr("x2", function (d) { return timeScale(d.set); })
                .attr("y1", Y)
                .attr("y2", Y)
                .attr("transform", T);
            sunGrouplet.append("line")
                .attr("class", "w" + w)
                .attr("x1", function (d) { return timeScale(d.rise); })
                .attr("x2", function (d) { return timeScale(d.rise); })
                .attr("y1", Y+.5*H).attr("y2", Y + 0)
                .attr("transform", T);
            sunGrouplet.append("line")
                .attr("class", "w" + w)
                .attr("x1", function (d) { return timeScale(d.set); })
                .attr("x2", function (d) { return timeScale(d.set); })
                .attr("y1", Y+.5*H).attr("y2", Y + 0)
                .attr("transform", T);
            sunGrouplet.append("text")
                .attr("dx", 3).attr("dy", .65*H)
                .attr("x", function (d) { return timeScale(d.rise); })
                .attr("y", Y)
                .attr("transform", T)
                .text(function(d, i){ return writeTime(d.rise); });
            sunGrouplet.append("text")
                .attr("text-anchor", "end")
                .attr("dx", -3).attr("dy", .65*H)
                .attr("x", function (d) { return timeScale(d.set); })
                .attr("y", Y)
                .attr("transform", T)
                .text(function(d, i){ return writeTime(d.set); });
            sunGrouplet.append("text")
                .attr("class", "symbol")
                .attr("dx", -4).attr("dy", .75*H)
                .attr("x", function (d) { return timeScale(d.rise) + .5*timeScale(d.set) - .5*timeScale(d.rise); })
                .attr("y", Y)
                .attr("transform", T)
                .text("☀");
        };
        
    }
    function drawMoonBlocks(_data) {

        $("g.moonData").remove();
        CG.drawMoon = CG.zAbove.append("svg:g").attr("class", "moonData").attr("clip-path", "url(#clipArea)");

        var dim = CG.daysInMonth();
        for(var w = 0; w < CG.weeksInMonth(); w++){
            timeScale.domain([dim[w * 7][2], d3.time.second.offset(d3.time.day.offset(dim[(w * 7) + 6][2], 1), -1)]);

            var filteredData = _data.filter(function(d){
                if(d.rise && d.set){
                    return d3.time.day.offset(d.rise, 1) > dim[(w * 7)][2] && d3.time.day.offset(d.set, -2) < dim[(w * 7) + 6][2];
                }else{
                    return false;
                }
            });

            var moonGrouplet = CG.drawMoon.selectAll("rect.w" + w)
                .data(filteredData)
                .enter()
              .append("g");

            var Y = w * CG.cellHeight() + CG.cellHeader + 5,
                H = 18,
                T = "translate(" + CG.padding.x + "," + CG.padding.y + ")";

            moonGrouplet.append("line")
                .attr("class", "w" + w)
                .attr("x1", function (d) { return timeScale(d.rise); })
                .attr("x2", function (d) { return timeScale(d.set); })
                .attr("y1", Y + H)
                .attr("y2", Y + H)
                .attr("transform", T);
            moonGrouplet.append("line")
                .attr("class", "w" + w)
                .attr("x1", function (d) { return timeScale(d.rise); })
                .attr("x2", function (d) { return timeScale(d.rise); })
                .attr("y1", Y + .5*H).attr("y2", Y + H)
                .attr("transform", T);
            moonGrouplet.append("line")
                .attr("class", "w" + w)
                .attr("x1", function (d) { return timeScale(d.set); })
                .attr("x2", function (d) { return timeScale(d.set); })
                .attr("y1", Y + .5*H).attr("y2", Y + H)
                .attr("transform", T);
            moonGrouplet.append("text")
                .attr("dx", 3).attr("dy", .75 * H)
                .attr("x", function (d) { return timeScale(d.rise); })
                .attr("y", Y)
                .attr("transform", T)
                .text(function(d, i){ return writeTime(d.rise); });
            moonGrouplet.append("text")
                .attr("text-anchor", "end")
                .attr("dx", -3).attr("dy", .75 * H)
                .attr("x", function (d) { return timeScale(d.set); })
                .attr("y", Y)
                .attr("transform", T)
                .text(function(d, i){ return writeTime(d.set); });
            moonGrouplet.append("text")
                .attr("class", "symbol")
                .attr("dx", -6).attr("dy", .65*H)
                .attr("x", function (d) { return timeScale(d.rise) + .5*timeScale(d.set) - .5*timeScale(d.rise); })
                .attr("y", Y)
                .attr("transform", T)
                .text("☾");
        };

    }
    function drawTideGraph(_data){

        $("g.tideData, g.tideGraph").remove();
        CG.drawTide = CG.zMiddle.append("svg:g").attr("class", "tideData").attr("clip-path", "url(#clipArea)");

        var dim = CG.daysInMonth(),
            ch = CG.cellHeight(),
            tideArea = d3.svg.area()
                .interpolate("monotone")
                .x(function(d) { return timeScale(d.date); })
                .y0(ch + 2)
                .y1(function(d) { return tideScale(d.height); });

        for(var w = 0; w < CG.weeksInMonth(); w++){
            timeScale.domain([dim[w * 7][2], d3.time.second.offset(d3.time.day.offset(dim[(w * 7) + 6][2], 1), -1)]);

            var filteredData = _data.filter(function(d){
                if(d.date){
                    return d3.time.day.offset(d.date, 1) > dim[(w * 7)][2] && d3.time.day.offset(d.date, -2) < dim[(w * 7) + 6][2];
                }else{
                    return false;
                }
            });

            CG.drawTide.append("path")
                //.data(filteredData)
                .attr("class", "tideGraph")
                //.attr("clip-path", "url(#clip-" + this.id + ")")
                .attr("d", tideArea(filteredData))
                .attr("transform", "translate(" + CG.padding.x + "," + (CG.padding.y + w * ch) + ")");


            //var tideGrouplet = CG.drawTide.selectAll("circle.w" + w)
            /*var tideGrouplet = CG.zAbove.selectAll("circle.w" + w)
                .data(filteredData).enter()
              .append("g").attr("class", "tideGraph").attr("clip-path", "url(#clipArea)");

            tideGrouplet.append("circle")
                .attr("class", "w" + w)
                .attr("cx", function (d) { return timeScale(d.date); })
                .attr("cy", function (d) { return w * ch + tideScale(d.height); })
                .attr("r", 2)
                //.attr("height", 5)
                .attr("transform", "translate(" + CG.padding.x + "," + CG.padding.y + ")");
            */
        }
    }

});