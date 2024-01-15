$.post("/arduino/connect")

const appData = {
    whistle: new Audio('audio/whistle.mp3'),
    buzzer: new Audio('audio/Buzzer.mp3'),
    beep: new Audio('audio/Beep.mp3')
};

function _isButtonDisabled(btnSelector){ 
    return $(btnSelector).attr('data-disabled') == "true"
}

function _disableButton(btnSelector){
    const btn = $(btnSelector);
    btn.attr('data-disabled', "true");
    btn.addClass('disabled');
}

function _enableButton(btnSelector){
    const btn = $(btnSelector);
    btn.attr('data-disabled', "false");
    btn.removeClass('disabled');
}

function timeStr(time) {
    if (typeof time != "string") return "Not string";
    const timeSplits = time.split(":");

    var result = "";

    for (var i = 0; i < timeSplits.length && i < 2; i++) {
        const timePart = timeSplits[i];

        if (timePart.length >= 2) {
            result += timePart;
        } else {
            result += "0" + timePart;
        }

        if (i == 0) {
            result += ":";
        }
    }

    if (i == 1) {
        result += "00"
    }

    return result;

}

function secsToTimeStr(secs) {
    const mins = Math.floor(secs / 60);
    const mSecs = secs % 60;

    var result = "";


    if (mins < 10) {
        result += `0${mins}`
    } else {
        result += mins;
    }

    result += ":";

    if (mSecs < 10) {
        result += `0${mSecs}`
    } else {
        result += mSecs;
    }

    return result;

}

function timeStrToSecs(time) {
    const timeSplits = time.split(":");
    if (timeSplits.length == 0) return 0;

    try {
        const mins = parseInt(timeSplits[0]);

        if (timeSplits[1]) {
            try {
                const secs = parseInt(timeSplits[1]);
                return mins * 60 + secs;
            } catch (secsErr) {
                return mins * 60; //ignore secs
            }
        } else {
            return mins * 60;
        }

    } catch (error) {
        return 0;
    }
}

function startTimer() {
    if (appData.elapsedTime) return;

    const elapsedTime = document.querySelector("#elapsedTime");
    if (!elapsedTime) return;

    resetTimer();
    appData.startTimeStr = new Date().toString();

    if(appData.participants){
        if($('#radPc1')[0].checked){
            appData.pc = "Participant-1";
        }else{
            appData.pc = "Participant-2";
        }
    }

    _disableButton("#timerStartBtn");
    _disableButton("#timerResetBtn");
    _enableButton("#timerStopBtn");

    appData.whistle && appData.whistle.play();
    
    Arduino && Arduino.sendGreenLightSignal();

    appData.elapsedTime = 1;
    // appData.maxTimeSecs = 185; //(tested ok)
    appData.elapsedTimeInterval = setInterval(() => {

        //late beep HotFix!
        if (appData.elapsedTime == appData.minTimeSecs - 1) {
            setTimeout(() => appData.beep && appData.beep.play(), 500); //HotFix, start beep 500ms ahead of minTime (500ms delayed of minTime - 1)
        } else if (appData.elapsedTime == appData.minTimeSecs) {
            //trigger yellow state
            _triggerYellowState(elapsedTime);
        } else if (appData.elapsedTime == appData.maxTimeSecs) {
            //trigger red state
            _triggerRedState(elapsedTime);
        }

        elapsedTime.innerHTML = secsToTimeStr(appData.elapsedTime++);
    }, 1000);

}

function stopTimer() {

    _disableButton("#timerStartBtn");
    _enableButton("#timerResetBtn");
    _disableButton("#timerStopBtn");

    appData.elapsedTime = undefined;
    if (appData.elapsedTimeInterval) {
        clearInterval(appData.elapsedTimeInterval);
    }

    Arduino && Arduino.sendTurnOffSignal();
}

function resetTimer() {

    _enableButton("#timerStartBtn");
    _enableButton("#timerResetBtn");
    _disableButton("#timerStopBtn");

    const elapsedTime = document.querySelector('#elapsedTime');
    if (elapsedTime) {
        elapsedTime.innerHTML = "00:00"
        $(elapsedTime).css('background-color', 'transparent');
        $(elapsedTime).css('color', 'black')
    }
}

function _triggerYellowState(timer) {
    // appData.beep && appData.beep.play();
    timer && $(timer).css('background-color', 'gold');

    Arduino && Arduino.sendYellowLightSignal();
}

function _triggerRedState(timer) {
    appData.buzzer && appData.buzzer.play();

    if (timer) {
        const mTimer = $(timer);
        mTimer.css('background-color', 'transparent');
        mTimer.css('color', 'red');
    }

    Arduino && Arduino.sendRedLightSignal();
}

function restoreArduinoState(){
    if(appData.elapsedTime == undefined) return;

    if(appData.elapsedTime < appData.minTimeSecs) {
        Arduino && Arduino.sendGreenLightSignal();
        return;
    }

    if(appData.elapsedTime < appData.maxTimeSecs) {
        Arduino && Arduino.sendYellowLightSignal();
        return;
    }

    Arduino && Arduino.sendRedLightSignal();
}

$(document).ready(function () {
    const _urlParams = new URLSearchParams(window.location.search);
    appData.category = _urlParams.get('category');
    appData.event = _urlParams.get("event");
    appData.minTime = _urlParams.get("minTime");
    appData.maxTime = _urlParams.get("maxTime");
    appData.team = _urlParams.get('team');
    appData.participants = _urlParams.get('participants')

    if(appData.participants){
        $('.participant-selector').show();
        appData.pc = "Participant-1";
    }else{
        $('.participant-selector').hide();

    }

    appData.minTimeSecs = timeStrToSecs(appData.minTime);
    appData.maxTimeSecs = timeStrToSecs(appData.maxTime);

    const eventName = document.querySelector(".event-name");
    if (eventName && appData.event) {
        eventName.innerHTML = appData.event;
    }
    const teamName = document.querySelector(".team-name");
    if (teamName && appData.team) {
        teamName.innerHTML = `Team Code '${appData.team}'`;
    }

    const minTime = document.querySelector('#minTime');
    if (minTime) {
        if (appData.minTime) {
            minTime.innerHTML = timeStr(appData.minTime) + " mins";
        } else {
            minTime.innerHTML = "--:--";
        }
    }

    const maxTime = document.querySelector('#maxTime');
    if (maxTime) {
        if (appData.maxTime) {
            maxTime.innerHTML = timeStr(appData.maxTime) + " mins";
        } else {
            maxTime.innerHTML = "--:--";
        }
    }


    const reconnectBtn = $('.yft-title');
    reconnectBtn.on('click', ()=> {
        const eventTeamName = $('.event-team-name');
        eventTeamName.css('box-shadow', '0px 1px 0px 2px rgb(179 179 179)');
        setTimeout(()=> {
            eventTeamName.css('box-shadow', '0px 1px 6px 2px rgb(179 179 179)');
        }, 100)

        
        $.post("/arduino/connect");
        restoreArduinoState();

    })
 
})