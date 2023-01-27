const OSC = require("osc-js");

const config = { wsServer: {host: "161.23.53.107"}, udpClient: { host: "localhost", port: 22345 } };
const osc = new OSC({ plugin: new OSC.BridgePlugin(config) });
console.log("Start OSC bridge!")
osc.open();

osc.on('/noisy',(message)=>console.log(message.args[0]))
