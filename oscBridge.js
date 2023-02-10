const OSC = require("osc-js");
const {networkInterfaces} = require('os');
const nets = networkInterfaces();

const en0 = nets.en0;
let ip = "localhost";
en0.forEach((obj)=>{
if(obj.family==="IPv4") ip = obj.address
})

console.log(ip)

const config = { wsServer: {host: ip}, udpClient: { host: "localhost", port: 22345 } };
const osc = new OSC({ plugin: new OSC.BridgePlugin(config) });
console.log("Start OSC bridge!")
osc.open();

// uncomment to check if messages are received from interface
// osc.on('/speed',(message)=>console.log(message))
