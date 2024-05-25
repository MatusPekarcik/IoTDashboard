import { createContext } from "react";


export const qosOptions = [        // https://www.hivemq.com/blog/mqtt-essentials-part-6-mqtt-quality-of-service-levels/
  { label: "0", value: 0, },       // at most once  - najviac raz
  { label: "1", value: 1, },       // at least once - najmenej raz
  { label: "2", value: 2, },       // exactly once  - práve raz 
]

export const iotTypes = [
  {label: "Speedmeter",value:"speed"},
  {label: "Text",value:"text"},
  {label: "Bar",value:"bar"},
  {label: "Line",value:"line"},
]

export const tsmtTypes = [
  {label: "Random",value:"random"},
  {label: "Constant",value:"const"},
  {label: "Linear",value:"linear"},
  {label: "Sinus",value:"sinus"},
  {label: "Bow",value:"bow"},
  {label: "Parabola",value:"para"},
]

export const freeBrokers = [
  {label: "HiveMQ",      value:"hive",      host:'broker.hivemq.com',     protocol:'ws', port:'8000',basepath:'mqtt'},
  {label: "EMQX",        value:"emqx",      host:'broker.emqx.io',        protocol:'ws', port:'8083',basepath:'mqtt'},
  {label: "Mosquitto",   value:"mosquitto", host:'test.mosquitto.org',    protocol:'ws', port:'8080',basepath:'mqtt'},
  {label: "MQTT HQ",     value:"mqtthq",    host:'public.mqtthq.com',     protocol:'ws', port:'8083',basepath:'mqtt'},
  //{label: "Dioty",       value:"dioty",    host:'mqtt.dioty.co',         protocol:'mqtt', port:'8880',basepath:'mqtt'},
 // {label: "CloudMQTT",   value:"cloudmqtt", host:'m11.cloudmqtt.com',     protocol:'ws', port:'32903',basepath:'mqtt'},
 // {label: "Flespi",      value:"flespi",    host:'mqtt.flespi.io',        protocol:'ws', port:'8883',basepath:'mqtt'},
 
]


export const mqttOptions = {
  keepalive: 60,                           // 30
  protocolId: "MQTT",           // "MQIsdp" (pre protocolVersion = 3), // "MQTT" pre protoclVerion = 4 a 5
  protocolVersion: 4,             // 3: funguje HiveMQ, Mosquitto, MQTT HQ, nefunguje EMQX
                                  // 4: fungujú HiveMQ, Mosquitto, EMQX, MQTT HQ
                                  // 5: funguje HiveMQ, Mosquitto, EMQX, nefunguje MQTT HQ

  clean: true,
  reconnectPeriod: 5*1000,
  connectTimeout:  30*1000,
  /*
     Položka "will" (vôľa) v MQTT options definuje správu, ktorá sa automaticky odosle na špecifikované tému (topic) v prípade,
     že klient MQTT neočakávane stratí spojenie s MQTT brokerom. Tento mechanizmus sa nazýva "Last Will and Testament" 
     (posledná vôľa a testament) a je užitočný na signalizovanie iným klientom alebo systémom, že daný klient prestal byť dostupný.
  */
  will: {
    topic: "WillMsg",
    payload: "Connection closed abnormally..!",
    qos: 0,
    retain: false,
  },
  rejectUnauthorized: false
}



export const phthaloGreenToolTip = 'linear-gradient(to right,#256e4b,#1f5b3e,#184831,#123524,#0c2217)';
export const phthaloGreen = 'linear-gradient(to right,#256e4b,#1f5b3e,#184831,#123524,#0c2217,#050f0a,#000000)';
export const topicColorsDft = ['blue','green','yellow','red','brown'];
