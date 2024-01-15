// Arduino.js for frontend (client)
const Arduino = {
    currentState : undefined,
    _postArduinoSignal : function(action, data){
        if(!$) return;

        $.post(`/arduino/${action}`, data, (err, result) => {
            if(err || result == "error"){
                this.currentState = undefined;
            }else{
                this.currentState = result;
            }
        })
    },

    sendGreenLightSignal : function(){
        this._postArduinoSignal("green");
    },

    sendRedLightSignal : function(){
        this._postArduinoSignal("red");
    },

    sendYellowLightSignal : function(){
        this._postArduinoSignal("yellow");
    },

    sendTurnOffSignal : function(){
        this._postArduinoSignal("off", {
            eventCategory : appData.category,
            eventName : appData.event,
            team : appData.team,
            startTime : appData.startTimeStr,
            performanceTime : document.querySelector('#elapsedTime').innerHTML,
            participant : appData.pc
        });
    }


}