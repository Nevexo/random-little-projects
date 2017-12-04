# Network Device Monitor
### Written in: NODE.JS 8 - RELIES ON: MQTT BROKER
#### USECASE: SMART HOME

This project has a very specific use-case, to turn the lights/smart relays on/off when I enter/leave my house. 

This avoids needing motion sensors around the house and some tracking to montior when people leave/enter the house - so I don't get plunged into darkness randomly.

As HomeAssistant will be doing all of the logic (turning the light on 5 seconds after connection and off again 3 minutes later) this program literally pings devices in the config.json file
every 5 seconds until they go offline/online while monitoring their state. It will then publish this to MQTT via the requested channels/servers.

### Config file

#### MQTT
In my usecase, this program is tracking the location of my device, either HOME or AWAY. So I'm using /location/deviceName
The program will append the device ID to the end of any topic. Change the code if you don't want that.
```json
topic: "/location/"
```


The config file for MQTT is fairly self-explanitary, but this is how devices work:
```json
"devices":  {
	"Ip.Address.0.1": "DeviceID"
}
```
The device ID will be sent when the device leaves/joins

The response sent to the MQTT broker will be:

For 'ExamplePhone' connecting to the network
```json
TOPIC: ExamplePhone MESSAGE: CONNECT
```
For 'ExamplePhone' disconnecting from the network:
```json
TOPIC: /location/ExamplePhone MESSAGE: DISCONNECT
```
Fairly easy to grasp.

There are some other options under the GeneralConfig object like scanInterval which is how often to check for new devices (In Seconds)

### EXAMPLE CONFIG

```json
{
	"mqtt": {
		"server": "mqtt://MQTT-SERVER",
		"topic": "/location/"
	},
	"generalConfig": {
		"scanInterval": 10,
		"stateWhenConnected": "{'loc': 'HOME'}",
		"stateWhenDisconnected": "{'loc': 'AWAY'}"
	},
	"devices": {
		"10.0.0.4": "nevexo",
		"10.0.0.78": "someoneelselol"
	}
}```