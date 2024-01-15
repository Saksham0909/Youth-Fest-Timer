$.post("/arduino/connect")

const appData = {
    selectedCategory : undefined,
    events : undefined,
    selectedEvent : undefined
}

function timeStr(time){
    if(typeof time != "string") return "Not string";
    const timeSplits = time.split(":");

    var result = "";

    for(var i=0; i < timeSplits.length && i < 2; i++){
        const timePart = timeSplits[i];

        if(timePart.length >= 2){
            result += timePart;
        }else{
            result += "0" + timePart;
        }

        if(i == 0){
            result += ":";
        }
    }

    if(i == 1){
        result += "00"
    }

    return result;

}

function onEventCategorySelectionHandler(e){

    const teamsList = document.querySelector(".content > .teams-list");
    if(teamsList){
        $(teamsList).fadeOut();
    }

    const categoriesList = document.querySelector(".content > .events-categories > ul");
    if(!categoriesList) return;

    const categories = categoriesList.children;
    for(var i=0; i < categories.length; i++){
        const category = categories.item(i);

        if(e === category){
            category.classList.add("selected");
            appData.selectedCategory = category.innerHTML.toLowerCase().replaceAll(' ','');
        }else{
            category.classList.remove("selected");
        }
    }

    if(!_yftData) return;

    const eventKey = appData.selectedCategory;
    const events = _yftData.events[eventKey];
    appData.events = events;
    
    const eventsList = $(".content > .events-list > ul");
    if(!eventsList) return;

    //clear previous events list
    eventsList.empty();

    for(var i=0; i< events.length; i++){
        const event =  events[i];
        eventsList.append(`<li data-event-index="${i}" onclick="onEventSelectionHandler(this)">${event.name}</li>`)
    }
    
}

function onEventSelectionHandler(e){
    const eventIndex = $(e).attr("data-event-index");
    if(!appData.events || isNaN(eventIndex)) return;

    const selectedEvent = appData.events[eventIndex];
    if(!selectedEvent) return;

    appData.selectedEvent = selectedEvent;

    const minTime = document.querySelector("#minTime");
    if(minTime){
        if(selectedEvent.minTime)
            minTime.innerHTML = timeStr(selectedEvent.minTime) + " mins";
        else 
            minTime.innerHTML = "--:--";
    }

    const maxTime = document.querySelector("#maxTime")
    if(maxTime){
        if(selectedEvent.maxTime)
            maxTime.innerHTML = timeStr(selectedEvent.maxTime)  + " mins";
        else
            maxTime.innerHTML = "--:--";
    }

    const eventName = document.querySelector('.content > .teams-list > .event-name');
    if(eventName){
        eventName.innerHTML = selectedEvent.name;
    }

    const teamsListSection = document.querySelector(".content > .teams-list");
    if(teamsListSection){
        $(teamsListSection).fadeIn();
    }

    const teamsList = $(".content > .teams-list > ul");
    if(!teamsList) return;

    //clear previous events list
    teamsList.empty();

    const teams = selectedEvent ? selectedEvent.teams : undefined;
    if(!teams) return;

    for(var i=0; i< teams.length; i++){
        const team =  teams[i];
        teamsList.append(`<li data-team-index="${i}" onclick="onTeamSelectionHandler(this)">${team}</li>`)
    }

}

function onTeamSelectionHandler(e){
    const teamIndex = $(e).attr("data-team-index");
    if(isNaN(teamIndex)) return;

    const _nextData = {
        category : appData.selectedCategory,
        event : appData.selectedEvent.name,
        minTime : appData.selectedEvent.minTime,
        maxTime : appData.selectedEvent.maxTime,
        team : appData.selectedEvent.teams[teamIndex],
        participants : appData.selectedEvent.participants
    }

    window.location = "timer.html?" + $.param(_nextData);
}

function onRulesButtonClickedHandler(){
    const rulesModalTitle = $('#rulesModalTitle');
    if(rulesModalTitle && appData.selectedEvent){
        rulesModalTitle.html(`Rules - ${appData.selectedEvent.name}`)
    }

    const rulesList = $('#rulesList');
    if(rulesList){
        //remove prev rules
        rulesList.empty();

        if(appData.selectedEvent && appData.selectedEvent.rules ) {
            const rulesCount = appData.selectedEvent.rules.length;

            for(var i=0; i < rulesCount; i++){
                const rule = appData.selectedEvent.rules[i];

                // console.log(rule);

                var newRule = rule.replaceAll(' ', "&nbsp;");
                newRule = newRule.replaceAll('\t', "&nbsp;&nbsp;&nbsp;&nbsp;")
                newRule = newRule.replaceAll('#s', ' ');


                rulesList.append(`<li><p>${newRule}</p></li>`);
            }
        }
    }
}

$(document).ready(()=> {

    const yftTitle = $("header>.yft-title");
    const categoriesList =  $(".content > .events-categories > ul");
    const pageHeading = $('.page-heading');

    $.getJSON("/yft-data", (data)=>{
        window._yftData = data;
        if(yftTitle){
            yftTitle.html(data.yftTitle);
        }

        yftTitle.on('click', ()=> {
            $.post("/arduino/connect")

            pageHeading.css('font-weight', 'bold');
            setTimeout(()=> {
                pageHeading.css('font-weight', 'normal');
            }, 100)
        })

        if(categoriesList){
            //Remove all previous elements
            categoriesList.empty();

            //Add new elements
            const categories = data.eventCategories;
            for(var i=0; i < categories.length; i++){
                const category = categories[i];

                categoriesList.append(`<li onClick="onEventCategorySelectionHandler(this)"}>${category}</li>`)
                
            }
        }


    });
});