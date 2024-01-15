//Arduino.js for backend (server)
const {SerialPort} = require('serialport');
// const { comPort } = require('./arduino');

const isWindows = process.platform == "win32";
var connectionDone = false;

const Arduino = {
    comPort: undefined,
    serial: undefined,
    state: false,
    _write: function (data) {
        if (this.serial) {
            // console.log("Called");
            try {
                this.serial.write(data);
            } catch (error) {}
        }
    },

    sendGreenLightSignal: function () {
        console.log("Green Light Signal");
        this._write('G');
    },

    sendRedLightSignal: function () {
        console.log("Red Light Signal");
        this._write('R');
    },

    sendYellowLightSignal: function () {
        console.log("Yellow Light Signal");
        this._write('Y');
    },

    sendTurnOffSignal: function () {
        console.log("Turn Off Signal");
        this._write('L');
    },

    performConnection: async function () {
        if(isWindows && connectionDone) return;
        connectionDone = true;

        // const arduinoPort = await getArduinoComPort();
        // console.log(arduinoPort);
        // if (!arduinoPort) return false;

        // try {
        //     const serial = new SerialPort(arduinoPort, 9600);
        //     if (!serial) return false;

        //     serial.on('error', err => {
        //         if (typeof err == 'object') {
        //             if (err.disconnected == true) {
        //                 Arduino.state = false;
        //             }
        //         }

        //         console.log(err);
        //     })

        //     Arduino.serial = serial;
        //     Arduino.comPort = arduinoPort;
        //     Arduino.state = true;
        //     console.log("Connected!");
        //     return true;
        // } catch (error) {
        //     console.log(error);
        //     return false;
        // }



        // //connect arduino

        if(Arduino.state) return;

        const comPorts = await SerialPort.list();
        const portsCount = comPorts.length;


        for (var i = 0; i < portsCount; i++) {
            const port = comPorts[i].path;

            if ( (!isWindows && port.includes('usbserial')) || ( isWindows && comPorts[i].manufacturer == 'wch.cn')) {
                Arduino.comPort = port;

                try {
                    const serial = new SerialPort({path : port, baudRate : 9600});
                    Arduino.backupSerial = Arduino.serial;
                    Arduino.serial = serial;



                    

                    serial.on('error', err => {
                        console.log(err);
                        const errStr = err.toString();
                        if(errStr.includes("Cannot")){
                            if(!Arduino.serial) Arduino.state = false;
                            if(!Arduino.backupSerial) Arduino.false;

                            Arduino.serial = Arduino.backupSerial;

                        }else {
                            if(err.disconnected){
                                Arduino.state = false;
                            }
                        }
                    })

                    // console.log(Arduino);
                    console.log("Connected");
                } catch (error) {
                    console.log(`=== Arduino Connection Failed! ===\n${error}`);
                }

                break;
            }
        }
    }

};

async function getArduinoComPort() {
    const comPorts = await SerialPort.list();
    const portsCount = comPorts.length;
    
    for (var i = 0; i < portsCount; i++) {
        const port = comPorts[i].path;


        if (port.includes('usbserial') || port.includes('CH340') || (comPorts[i].manufacturer && comPorts[i].manufacturer === 'wch.cn'))
            return port;
    }

    return undefined;
}

async function isArduinoConnected() {
    if (!Arduino) return false;
    if (!Arduino.serial) return false;

    try {
        const ardPort = await getArduinoComPort();
        return ardPort && Arduino.serial.isOpen;
    } catch (error) {
        console.log(error);
        return false;
    }
}


// getArduinoComPort().then(console.log)


module.exports = Arduino;