const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require('body-parser');

const Arduino = require('./arduino');
const saveRecord = require('./recordhandler')

app.use(express.static("static"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/yft-data", (req, res) => {
    res.send(require("./YFTData.json"))
})


app.post("/arduino/:action", (req, res)=> {
    const action = req.params.action;

    if(action == "red"){
        Arduino.sendRedLightSignal();
        res.send("red");
        return;
    }

    if(action == "green"){
        Arduino.sendGreenLightSignal();
        res.send("green");
        return;
    }

    if(action == "yellow"){
        Arduino.sendYellowLightSignal();
        res.send("yellow");
        return;
    }

    if(action == "off"){
        Arduino.sendTurnOffSignal();

        saveRecord(
            req.body.eventCategory, 
            req.body.eventName, 
            req.body.team, 
            req.body.startTime, 
            req.body.performanceTime, 
            req.body.participant)

        res.send("off");
        return;
    }

    if(action == "connect"){
        Arduino.performConnection();
        res.send("done");
        return;
    }

    res.send("error");
})

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
})