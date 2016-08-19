document.addEventListener("deviceready", onDeviceReady, false);

//http://stackoverflow.com/questions/6507293/convert-xml-to-string-with-jquery
function xmlToString(xmlData) { 
    var xmlString;
    //IE
    if (window.ActiveXObject){
        xmlString = xmlData.xml;
    }
    // code for Mozilla, Firefox, Opera, etc.
    else{
        xmlString = (new XMLSerializer()).serializeToString(xmlData);
    }
    return xmlString;
}

function processWeather(xml) {
    var dayOfWeek = ["Today", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var ctr = $("<div/>", {"class": "list-group"});
    $("#weather-info").empty().append(ctr);
    
    $(xml).find('area[aac="WA_PT053"]').children("forecast-period").each(function(i, v){
        var d = new Date($(v).attr("start-time-local"));
        var day = d.getDay() + 1;
        var dayStr = i > 0 ? dayOfWeek[day] : dayOfWeek[0];
        if (i == 0) {
            window.localStorage.setItem("cachedDay", d.getDay().toString());
        }
        
        var ent = $("<a/>", {"class" : "list-group-item", "href" : "#day" + i.toString()});
        ent.append($("<h4/>", {"class" : "list-group-item-heading"}).text(dayStr));
        
        var precis = $(v).find("text[type='precis']").text();
        var pop = " ☔ " + $(v).find("text[type='probability_of_precipitation']").text()
        var min = $(v).find("element[type='air_temperature_minimum']");
        var max = $(v).find("element[type='air_temperature_maximum']");
        
        min = min.length ? "Min " + min.text() + "." : "";
        max = max.length ? " Max " + max.text() + "." : "";
        
        precis = precis + " " + min + max + pop;
        
        ent.append($("<p/>", {"class" : "list-group-item-text"}).text(precis));
        
        ctr.append(ent);
        console.log(v);
        return i<4;
    });
}

function getWeather() {
    $("#fetch").addClass("disabled").removeClass("text-success text-warning");
    
    $.ajax({
        type: "GET",
        url: "https://asweather-jtanx.rhcloud.com/perth-xml.php",
        dataType: "xml",
        success: function(xml) {
            processWeather(xml)
            window.localStorage.setItem("cachedWeather", xmlToString(xml));
            $("#fetch").removeClass("disabled").addClass("text-success");
            navigator.vibrate([500]);
        },
        error: function(e) {
            console.log(e);
            alert("Could not fetch any weather information; please try again.", null, "Error");
            $("#fetch").removeClass("disabled").addClass("text-warning");
            navigator.vibrate([100, 700]);
        },
    });
}

function onDeviceReady() {
    window.alert = navigator.notification.alert;
    StatusBar.show();
    $("#fetch").click(getWeather);
    
    var cachedWeather = window.localStorage.getItem("cachedWeather");
    var cachedDay = window.localStorage.getItem("cachedDay");
    
    if (cachedWeather) {
        processWeather($.parseXML(cachedWeather));
    }
    
    if (cachedWeather && cachedDay) {
        var cd = parseInt(cachedDay, 10);
        if (cd != (new Date()).getDay()) {
            console.log("Refreshing weather!");
            getWeather();
        }
    } else {
        console.log("cachedDay not found, refreshing weather!");
        getWeather();
    }
}
