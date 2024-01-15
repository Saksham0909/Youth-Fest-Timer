const fs = require('fs');
const RECORD_FILE = "./record.csv"

function getTime(date){
    if(!date) {
        date = new Date();
    }else{
        date = new Date(date)
    }
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${monthNames[date.getMonth()-1]} - ${date.toLocaleTimeString()}`;
}

function appendRecord(eventCategory, eventName, team, startTime, performanceTime, participant){
    fs.appendFileSync(RECORD_FILE, `\n${eventCategory},${eventName},${team}, ${participant ? participant : ""},${getTime(startTime)}, ${getTime()},${performanceTime}`);
}

function addHeader(){
    fs.writeFileSync(RECORD_FILE, "Event Category, Event Name, Team Name, Participants, Start Time, End Time, Performance Time")
}

function saveRecord(eventCategory, eventName, team, startTime, performanceTime, participant){
    if(!fs.existsSync(RECORD_FILE)){
        addHeader();
    }

    appendRecord(eventCategory, eventName, team, startTime, performanceTime, participant)
}

module.exports = saveRecord;


