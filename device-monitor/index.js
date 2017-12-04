
console.log('Nevexo - RandomLittleProjects - DeviceMonitor\nISC License \n\n')
var config = require('./config.json') // Load config
var states = {} //Used to track the state of a device.
var hosts = [] //A simple array of IPs to monitor
var ping = require('ping') //Used to check if the device is dead/aline
var mqtt = require('mqtt') //OK, you know what MQTT is.
var client
var checker
//Setup Functions
function getID(ip) { //Gets the devID from a devices IP
	return config.devices[ip]
}

function loop() {
	checker = setInterval(function() {
		hosts.forEach(function(host){
			ping.sys.probe(host, function(isAlive){
				if (isAlive) {
					console.log('[' + getID(host) + '] Is up.')
					stateUpdate(getID(host), true)
				}else {
					console.log('[' + getID(host) + '] Is down.')
					stateUpdate(getID(host), false)
				}
			});
		});
	}, config.generalConfig.scanInterval * 1000)
}

function login(mode) {
	console.log('[MQTT] Now logging in. Mode: ' + mode)
	client = mqtt.connect(config.mqtt.server)
	client.on('connect', function () {
		console.log('[MQTT] Connection is up! Enter loops.')
		if (mode != false) {
			console.log('[MQTT] Dirty shutdown. Re-executing stateChange...')
			stateUpdate(mode[0], mode[1])
		}
		loop()
	})

}

function stateUpdate(devID, state) {
	//console.log("DEVID: " + devID + " Requesting state change to " + state) 
	if (client.connected) {
		//Check the state of the ping against the states array
		//To make sure that devices have actually just joined
		//Instead of just being detectected twice.
		if (state == true && states[devID] != true) {
			console.log('[MQTT] Publishing to: ' + config.mqtt.topic + devID + " - " + config.generalConfig.stateWhenConnected)
			client.publish(config.mqtt.topic + devID, config.generalConfig.stateWhenConnected)
			states[devID] = true
			console.log('['+devID + '] Has changed to the UP state')
		}else if (state == false && states[devID] != false) {
			console.log('[MQTT] Publishing to: ' + config.mqtt.topic + devID + " - " + config.generalConfig.stateWhenDisconnected)
			client.publish(config.mqtt.topic + devID, config.generalConfig.stateWhenDisconnected)
			states[devID] = false
			console.log('['+devID + '] Has changed to the DOWN state')
		}
	}else {
		clearInterval(checker) //Kill the scanner if the MQTT service is dead.
		login([devID, state]) //Prepeare to re-execute when the MQTT reconnects.
	}
	
}
//Setup MQTT



//Setup Devices
console.log('Registered Devices:')

for (var key in config.devices){
	console.log("DevID: " + config.devices[key] + " DevIP: " + key)
	var devID = config.devices[key]
	states[devID] = false
	hosts.push(key)
	
}
login(false) //Login cleanly.

//Intervals.
