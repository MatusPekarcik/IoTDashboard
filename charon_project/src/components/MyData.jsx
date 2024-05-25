import mqtt from 'mqtt';
import { format } from 'date-fns';
import { mqttOptions } from './MyConst';
import * as utils from './utils'
import tinycolor from 'tinycolor2';

const topicColors_dft = ['blue','green','yellow','red','brown'];
const MAXTOPICROWS = 10000;

export class MyData {

enbServer = false;

topicColors_dft = [];

dashboard =  {
  screen   : "",
  userid   : 0,
  username : '',

  dashid : 0,
  dashname : '',
  dashdesc : '',
  dashdt : undefined,

  dy_visualList    : 0,
  dy_brokerList    : 0,
  dy_dashboardList : 0,

 
}  

brokers = [];
visuals = [];
dashboards = [];

values  = [];
mqtts   = [];   // mqtt clients
tsmts   = [];   // transmitters
autosave = true;
dirty    = false;
isOn     = false;
restored = false;


myCommand(type){
  const Command = new CustomEvent('Command', {
    detail: { type:type } // Optional data to pass with the event
  });
  window.dispatchEvent(Command);

}

log(...args) {
  // console.log(...args);
}

//////////////////////////////////////////////////////////////////////////////////////// visuals
vfyVisual(visual,idx) {

    if (!visual.name)    throw new Error(`Invalid visual name "${visual.name}"`);    

    for (var i=0; i<visual.topics.length; i++) {
      const t = visual.topics[i];
      if (!t.topicname)  throw new Error(`Topic name must be entered`);
      if (!t.brokername) throw new Error(`Invalid broker name of topic "${t.topicname}"`);
      if (!t.color)      throw new Error(`Invalid color of topic "${t.topicname}" from "${t.brokername}"`);      
   
      for (var j=i+1; j<visual.topics.length; j++) {
        if (t.topicname==visual.topics[j].topicname && t.brokername==visual.topics[j].brokername )
          throw new Error(`Duplicate topic "${t.topicname}" from broker "${t.brokername}"`);
      }

    }

    for (var i=0; i<this.visuals.length; i++) {
        if (i!=idx && visual.name==this.visuals[i].name) 
          throw new Error(`Visual "${visual.name}" already exists`);      
    }

}

getVisual(idx) {
  if (idx == -1) return this.newVisual();
  if (idx < this.visuals.length)
    {
      const tt = this.visuals[idx].topics.map( t=>({...t}));
      return {...this.visuals[idx], topics: tt };
    }
  
  throw new Error(`Visual index out of range`);    

}

/*
newVisual( ) {
  return { 
      name : 'New visual '+(this.visuals.length+1),
      type : 'text',
      topics : [{
        topicname: 'New topic',
        brokername: this.brokers[0]?.name,
        qos : 0,
        color : this.topicColors_dft[0]
      }]
    
  }
}
*/

newVisual( ) {
  return { 
      name : undefined,
      type : 'text',
      note : undefined,
      rng : 30, 
      frozen : -1,
      topics : [{
        topicname: undefined,
        brokername: this.brokers[0]?.name,
        qos : 0,
        color : this.topicColors_dft[0]
      }],
      frequency: undefined,
      ttype: "Random",
      tqos: "0",
      dx: undefined,
      amplitude: undefined,
      noise: undefined,
      min: undefined,
      max: undefined,
      greenZone : 25,
      orangeZone: 25,
      redZone: 25,
      purpleZone: 25,
    
  }
}



// return 
// - count of brokername/topicname in visuals (except visual[idx])
// - highest qos
// - index of last visual with this topic

topic_cnt = (brokername,topicname,idx) => {
  let cnt=0, qos=0, ii=-1;  
  for (var i=0; i<this.visuals.length;i++ ) if (i!=idx) 
    for (var t of this.visuals[i].topics) 
      if (t.brokername==brokername && t.topicname==topicname) 
        { ii=i, cnt++; if (t.qos>qos) qos=t.qos }
    
return [cnt,qos,ii];  
}

// visual: visual to add (idx=-1), or to update (idx>=0)
// idx:    deleted visual (idX>=0)
subscribeVisual = (visual, idx) => {
  this.log('subscribeVisual',visual,idx);

  let tt;                                                                           // tt: topics from deleted/replaced visual
  if (idx>=0) tt = this.visuals[idx].topics.slice();                                // only shallow copy

  // subscribe, if topic to add or update

  if (visual!=undefined)                                                            // if visual is undefined, only delete
    for (const t of visual.topics ) {

      // this.log(`[Topic] ${t.brokername} ${t.topicname}` );

      let m = this.mqtts[t.brokername];  if (!m) continue;                          // disconnected broker
      let [cnt,qos,ii] = this.topic_cnt(t.brokername,t.topicname,-1); 

//      this.log(`Topic ${t.brokername} ${t.topicname} => cnt${cnt}, qos${qos}` );

      if (cnt==1 && ii==idx && qos!=t.qos) qos=-1;                                  // changed qos and no other topic
                                                                                    // force resubscribe !

      if (cnt==0 || qos<t.qos) {                                                    // need to (re) subscribe 
        if (cnt>0) this.mqtt_subscribe_topic(m,t.topicname,t.qos,false);            // unsubscribe, because lower qos 
        cnt=0;                                                                      // force subscribe
      }  
      
      if (cnt==0) this.mqtt_subscribe_topic(m,t.topicname,t.qos,true);              // subscribe

      if (!tt) continue;                                                            // no topics to replaced 

      // replaces - preserve unsubscribe topics, when was updated and already subscribed
      var i=tt.length; 
      while (i>0) { i--; if (tt[i].brokername==t.brokername && tt[i].topicname==t.topicname) tt.splice(i,1) }

    }  
    
  //  unsubscribe, if topic to delete or replaced

  if (idx!=-1) 
    for (const t of tt) {
       let m = this.mqtts[t.brokername]; if (!m) continue;                          // disconnected broker
       let [cnt,qos] = this.topic_cnt(t.brokername,t.topicname,idx);
       if (cnt==0) this.mqtt_subscribe_topic(m,t.topicname,undefined,false);        // unused broker.topic 
    }
  
    this.log('subscribeVisual end');  
}

setVisual(visual,idx) {

    this.vfyVisual(visual,idx);
    this.subscribeVisual(visual, idx);

    if (idx==-1) this.visuals.push(visual)
    else this.visuals[idx] = visual;        

    this.store();
    
    this.setTransmitters(idx,true);
}

delVisual(idx) {
    this.setTransmitters(idx,false);
    this.subscribeVisual(undefined,idx);     // no visual to add, visuals[idx] to delete
    this.visuals.splice(idx,1);
  
    this.store();
}

visual_sts(idx,sts) {

}

setVisuals(visuals) {

    this.setTransmitters(-1,false);
    this.visuals = visuals;
    this.setTransmitters(-1,true);

}

//////////////////////////////////////////////////////////////////////////////////////// brokers
vfyBroker(broker,idx) {

  if (!broker.name) throw new Error('Blank broker name');
  if (!broker.host) throw new Error('Host not entered');
  if (!broker.port) throw new Error('Invalid port');

  for (var i=0; i<this.brokers.length; i++) {
    if (i!=idx && broker.name==this.brokers[i].name)        
      throw new Error(`Broker "${broker.name}" already exists`);      
  }
  
}

/*
newBroker() {
  return {
    name:     'My broker', 
    certif:   false,
    encrypt:  false,
    protocol: 'ws',
    host:     'broker.emqx.io',
    port:     8083,
    username: '',
    password: '',
    basepath: 'mqtt'
  }
}
*/

newBroker() {
  return {
    name:     '', 
    certif:   false,
    encrypt:  false,
    protocol: 'ws',
    host:     '',
    port:     "",
    username: '',
    password: '',
       }  
}  


getBroker(idx) {
  if (idx == -1) return this.newBroker();
  if (idx < this.brokers.length) return {...this.brokers[idx]};

  throw new Error(`Broker index out of range`);    
}


setBroker(broker,idx) {    
  this.vfyBroker(broker,idx);
  if (idx==-1) this.brokers.push(broker)
  else { 
         let b = this.brokers[idx];
        
         let connected = this.mqtts[b.name]?.client!=undefined;
         if (connected) this.mqtt_disconnect(idx);

         this.brokers[idx] = broker;
        
         if (broker.name!=b.name) {   // name changed           
           for (const v of this.visuals) 
             for (const t of v.topics ) 
               if (t.brokername==b.name) t.brokername = broker.name;

/*  toto sa dá použiť, len ak sa zmenilo LEN meno brokera.  Ináč sa musí disconectnúť a spustiť znovu
         const m = this.mqtts[b.name];  if (m!=undefined) { 
                   this.mqtts[broker.name]=m;
                   m.brokername=broker.name;  
                   // this.mqtt_setup(m.client,broker.name);  toto sa nedá použiť!        
                   //   client.on("xxx", funkcia) neodregistuje predchádzajúcu funkciu, 
                   //   volá všetky funkcie zaregistrované cez client.on("xxx", funkcia)
                   //   odregistrovať sa funkcia dá cez client.off("xxx",funkcia) alebo client.removeListener("xxx",funkcia)
                   delete this.mqtts[b.name]};
*/
         const v = this.values[b.name]; if (v!=undefined) { this.values[broker.name]=v; 
                   delete this.values[b.name]};
        
/*
          const t = this.tsmts[b.name];  if (t!=undefined) { this.tsmts[broker.name]=t;  
                   this.setTransmitters()
                   delete this.tsmts[b.name] };
*/         

         } // name changed  
         
       if (connected) this.mqtt_connect(idx);  
       }  
  
  this.store();
}



delBroker(idx) {

  this.mqtt_disconnect(idx);
  const bname = this.brokers[idx].name;
  
  delete this.values[bname];

  this.brokers.splice(idx,1);
  this.store();
}

setBrokers(brokers) {

  this.brokers = brokers;

}

getBrokerIdx(name) {
   
    for (var i=0; i<this.brokers.length; i++) {
      if (name==this.brokers[i].name) return i;
    }      
  
  return -1;  
}

  
//////////////////////////////////////////////////////////////////////////////////////// values
getVisualNames(brokername,topicname) {
  let res=[]
  for (const v of this.visuals)  
    for (const t of v.topics) 
      if (t.brokername==brokername && t.topicname==topicname)
        res.push({visualName: v.name, frozen: v.frozen });
  return res;
}

setValue(brokername,topicname,value) {
    

  let vnames = this.getVisualNames(brokername,topicname);

  let bvals = this.values[brokername];
  if (bvals==undefined) bvals = this.values[brokername] = [];
    
  let tvals = bvals[topicname];
  if (tvals==undefined) tvals = bvals[topicname] = [];

  for (let v of vnames) 
    if(v.frozen == -1){
      let vvals = tvals[v.visualName];
      if (vvals==undefined) vvals = tvals[v.visualName] = [];
      if (vvals.push({y:value, x:Date.now() })>MAXTOPICROWS) vvals.shift(); 
    }

}

getValue(visualname,brokername,topicname,index,xmin) {
  let 
  vals = this.values[brokername];  if (vals==undefined) vals=[];
  vals = vals[topicname];          if (vals==undefined) vals=[];
  vals = vals[visualname];         if (vals==undefined) vals=[];

  if (index=='T')       return xmin?vals.filter(v=>v.x>=xmin):vals; 

  if (index==undefined) return vals.map(v => v.y);

  else return vals[vals.length-index-1]?.y;          
}


getValueT(visualname,brokername,topicname,index) {
  let 
  vals = this.values[brokername];  if (vals==undefined) vals=[];
  vals = vals[topicname];          if (vals==undefined) vals=[];
  vals = vals[visualname];         if (vals==undefined) vals=[];

  return vals[vals.length-index-1];          // ak je najnovšia hodnota posledná

}


//////////////////////////////////////////////////////////////////////////////////////// dashboard
async getDashboards() {
  
  if (!this.enbServer) return;
  if (!this.dashboard.userid) throw new Error('The user is not logged in');

  const res = await utils.post('dashboard_list',{userid:this.dashboard.userid});
  if(!res.success) throw new Error(res.error.message);
  this.dashboards = res.data;
}

async delDashboard(dashid) {
  await utils.post('dashboard_delete',{userid: myData.dashboard.userid, dashid:dashid});
  await this.getDashboards();
}

async openDashboard(dashid) {
  if (!this.dashboard.userid) throw new Error('The user is not logged in');

  const res = await utils.post('dashboard_open',{userid:myData.dashboard.userid, dashid:dashid});

  if (res.success) {
    if (res.data.length==0) throw new Error('Dashboard not found');

    this.dashboard.dashid   = res.data[0].dashid;
    this.dashboard.dashname = res.data[0].dashname;
    this.dashboard.dashdesc = res.data[0].dashdesc;
    this.dashboard.dashdt   = res.data[0].dashdt;
    // neviem, ako je to možné, ale netreba robiť JSON.parse(d.dashdata)
    const d = res.data[0].dashdata;

    this.mqtt_disconnect(-1);
    this.values=[];
    this.setDashboard(d.brokers,d.visuals);
    this.mqtt_connect(-1);
    this.store(false);
    this.dirty = false;

  } else throw new Error(res.error.message);


}

async save( dashboard, saveas, edit )  {
  // data = formDashboard.values = { dashid, dashname, description }
  if (!this.enbServer) {
    this.dashboard.dashname = dashboard.dashname;
    this.dashboard.dashdesc = dashboard.dashdesc;
    this.dashboards[0] = dashboard;
    return;
  } 

  if (!this.dashboard.userid)   throw new Error('The user is not logged in');
  if (!dashboard.dashname)      throw new Error('Dashboard name is empty');

  dashboard.userid = this.dashboard.userid;
  
  if (!edit) {
    if (saveas) dashboard.dashid=0;
    if (dashboard.dashid==0||dashboard.dashid==this.dashboard.dashid)  
      dashboard.dashdata = JSON.stringify({brokers:this.brokers,visuals:this.visuals});
    
  }  

  const res = await utils.post('dashboard_save',dashboard);  delete dashboard.dashdata;
  var e = (!res.success)?res.error.message:'';
    
  if (res.error?.errcode=='ER_DUP_ENTRY') 
    switch (utils.parseSQLDuplicKey(e).toLowerCase()) {
    case 'i1': {e=`Dashboard "${dashboard.dashname}" already exists`; break};
  };

  if (e!='') throw new Error(e);

  if (dashboard.dashid==0) { dashboard.dashid = res.data.insertId; this.dashboard.dashid = dashboard.dashid }

  if ( this.dashboard.dashid == dashboard.dashid ) { 
    this.dashboard.dashname = dashboard.dashname;
    this.dashboard.dashdesc = dashboard.dashdesc; 
    this.dirty = false;

  }
 
  if (edit) this.getDashboards();
}

store( enbAutosave=true ) {
  const data = {
    brokers:   this.brokers, 
    visuals:   this.visuals,
    dashboard: this.dashboard,
  }

  localStorage.setItem('myDashboard', JSON.stringify(data));
  this.log('store:',data);

  if (enbAutosave && this.autosave && this.dashboard.dashid!=0) 
    this.save(this.dashboard)
  else this.dirty=true;

}

restore() {

    var data =  JSON.parse(localStorage.getItem('myDashboard'));  
    this.log('restore:',data);
    if (!data) data = {}; 
    if (data.brokers==undefined) data.brokers=[];
    if (data.visuals==undefined) data.visuals=[];
    if (data.dashboard==undefined) data.dashboard = {
      userid:0,
      username:'',
      dashid:0,
      dashname:'Dashboard',
      dashdesc:'Dashboard description'
    }

    console.log('DDDX',data);
    
    this.dashboards = [data.dashboard];
    this.dashboard = data.dashboard;
    this.setDashboard(data.brokers,data.visuals);

}

clearSession = () => {
   localStorage.removeItem('myDashboard');
}

exportVisualData( index, withTime=true ) {

  const visual = this.visuals[index]; if (!visual) return;

  const data = visual.topics.map( t=> myData.getValue(visual.name,t.brokername,t.topicname,'T'));
  const mx = data.reduce((acc,d)=>Math.max(acc,d.length),0);  if (mx==0) return;
 
  const hdr = visual.topics.map(t=>(withTime?'time,':'')+'"'+t.topicname+':'+t.brokername+'"').join(',');
  

  let i=0,ss="",jj=visual.topics.length;
  while (i<mx) {
    let j=0;
    while (j<jj) {
      if (j>0) ss=ss+','; 
      let val = data[j][i];
      if (val==undefined) {
        if(withTime) ss=ss+','; 
      }
      else {
        //if(withTime) ss=ss+ format(new Date(val.x),"dd.MM.yyyy HH:mm:ss.SSS") + ',';
        if(withTime) ss=ss+ format(val.x,"dd.MM.yyyy HH:mm:ss.SSS") + ',';
        
        ss=ss+val.y.toString(); 
      }
      j++;
    }
    ss=ss+'\n'; i++;
  }

  const csvContent = "data:text/csv;charset=utf-8," + hdr+'\n'+ss;

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);  
  link.setAttribute("download", "data.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/*
exportVisualData( visual ) {
  let data = visual.topics.map( t=>( 
   { topic: `${t.brokername}:${t.topicname}`,
     data: this.getValue(visual.name,t.brokername,t.topicname)
   }

  ) );
  this.export(visual.name,data);
}*/

exportDashboard(fn) {
  this.export( fn+'.json', {
    brokers:this.brokers,
    visuals:this.visuals,
    dashname:this.dashboard.dashname,
    dashdesc:this.dashboard.dashdesc
  })
}

export(fn, data) {
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const file = new File([blob], "topics.json", { type: "application/json" });
    const fileUrl = URL.createObjectURL(file);
    const downloadLink = document.createElement("a");
    downloadLink.href = fileUrl;
    downloadLink.download = fn;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
}




import() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";  
    fileInput.onchange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      
      const dd = JSON.parse(event.target.result);
      
      this.values=[];
      this.setDashboard(dd.brokers,dd.visuals);
      this.dashboard.dashid = 0;
      this.dashboard.dashname = dd?.dashname;
      this.dashboard.dashdesc = dd?.dashdesc;
      this.dashboard.dashdt = undefined;
      this.store(true);
      };
    reader.readAsText(file);
    };
    document.body.appendChild(fileInput);
    fileInput.click();
    fileInput.remove();
}

newDashboard() {
  this.dashboard = { ...this.dashboard,  // preserve userid, username, 
    dashid: 0,
    dashname: '',
    dashdesc: '',
    dashdt: undefined, 

    dy_brokerList:0,
    dy_visualList:0,
    dy_dashboardList:0,
  }

  this.values=[];
  this.setDashboard([],[]);
}

setDashboard(brokers,visuals) {

    this.mqtt_disconnect(-1); 

    brokers=brokers.map(b=>({...b,actstate:b.actstate=='on'?'set':b.actstate}));
    visuals=visuals.map(v=>{
      if (v.rcvr_enb==undefined) v.rcvr_enb=true;
      if (v.tsmt_enb==undefined) v.tsmt_enb=false;
    
        if(v.topics==undefined) { v.topics=[
          { brokername : v.brokername,   
            topicname : v.topicname,
            qos : v.qos
          }] };
  
        delete v.brokername;
        delete v.topicname;
        delete v.qos;   
        delete v.rcv_enb;
        return v;
      }); 
   
    this.setVisuals(visuals);
    this.setBrokers(brokers);

    this.mqtt_connect(-1); 
    utils.message('refresh');
}

//////////////////////////////////////////////////////////////////////////////////////////////////
user_login = async (data)=>  {
  const res = await utils.post('user_login',data);

  if (!res.success) throw new Error(res.error.message);


  if (res.data.length==1 && res.data[0].pswOk==1) {
      myData.dashboard.userid   = res.data[0].id;
      myData.dashboard.username = res.data[0].name;
    } 
  else throw new Error('Invalid username or password')

}

user_logout = ()=>  {
  myData.dashboard.userid = 0;
  myData.dashboard.username = '';
}
user_signin = async (data)=> {
  if (data.password!=data.password2) throw new Error('Password confirmation does not match');
  const res = await utils.post('user_signin',data);

  var e = (!res.success)?res.error.message:'';

    
  if (res.error?.errcode=='ER_DUP_ENTRY') {
    switch (utils.parseSQLDuplicKey(e).toLowerCase()) {
    case 'i1': {e='Username is already used'; break};
    case 'i2': {e='E-mail already used'; break};
    }
  }
  
  if (e!='') throw new Error(e);

}

//////////////////////////////////////////////////////////////////////////////////////////////////

mqtt_publish (visual_idx,val) {
  let v = this.visuals[visual_idx];
  
  v.topics.map((t)=>{
    const m = this.mqtts[t.brokername]; if (!m?.client) { utils.message('mqtt_refresh');  return};
    m.client.publish(t.topicname,val.toString(),t.qos);
  })
}

mqtt_transmit(visual_idx) {
 
  const visual = this.visuals[visual_idx];  
  const t      = this.tsmts[visual.name];
 
  var val = 0;
  switch (visual.tsmt_type) {
   case 'const':   { val=1; break}
   case 'linear':  { if (t.x>1) t.x=0; val = t.x; break}
   case 'sinus':   { val = Math.sin(t.x); break}
   case 'bow':     { val = Math.pow(1-Math.pow(Math.abs((t.x % 2)-1),2),0.5); break}

   case 'para':    { if (t.x>1) t.x=0; val = (4*t.x-2)*(4*t.x-2)/4; break}
   case 'gauss':   { const sigma = 1,
                     val = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-(((t.x % 10) ) ** 2) / (2 * sigma ** 2)); break }

  default: val = Math.random();   // random
  }
 
  
  t.x = t.x + visual.tsmt_dx;

  if (visual.tsmt_noise) {
    val = val + (visual.tsmt_noise/100) * (Math.random()-0.5);    
  }

  val = val*visual.tsmt_ampl;
 
  this.mqtt_publish(visual_idx,val.toFixed(2));


  // mqtt.client.publish(tname,val.toString(),visual.qos);

  // this.mqtt_notif('info',bname,tname,`transmit: ${val}`)

}

mqtt_transmit_old(visual_idx) {
 
  const visual = this.visuals[visual_idx];  if (visual==undefined) return;
  const bname  = visual.topics[0]?.brokername;
  const mqtt   = this.mqtts[bname];  if (mqtt==undefined) return;  if(!mqtt.client) return;
  const tname  = visual.topics[0]?.topicname;
  const t      = this.tsmts[visual.name];
  const qos    = visual.topics[0]?.qos;

  var val = 0;
  switch (visual.tsmt_type) {
   case 'const':   { val=1; break}
   case 'linear':  { if (t.x>1) t.x=0; val = t.x; break}
   case 'sinus':   { val = Math.sin(t.x); break}
   case 'bow':     { val = Math.pow(1-Math.pow(Math.abs((t.x % 2)-1),2),0.5); break}

   case 'para':    { if (t.x>1) t.x=0; val = (4*t.x-2)*(4*t.x-2)/4; break}
   case 'gauss':   { const sigma = 1,
                     val = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-(((t.x % 10) ) ** 2) / (2 * sigma ** 2)); break }

  default: val = Math.random();   // random
  }

  t.x = t.x + visual.tsmt_dx;

  if (visual.tsmt_noise) {
    val = val + (visual.tsmt_noise/100) * (Math.random()-0.5);    
  }

  val = Math.round(val*visual.tsmt_ampl,2);

  mqtt.client.publish(tname,val.toString(),visual.qos);

//  this.mqtt_notif('info',bname,tname,`transmit: ${val}`)

}

setTransmitters( idx, enb=true, x=0.0 ) {
  if (this.visuals==undefined) return;

  if (idx>=0) {
    var v = this.visuals[idx];  
    var t = this.tsmts[v.name];
    if (t==undefined) 
      { if (v.tsmt_enb && enb ) { 
           // start transmitter
           this.tsmts[v.name] = {
             id   : setInterval( ()=>{                     
                    this.mqtt_transmit(idx);
                    // this.mqtt_notif('info',v.topics[0].brokername,v.topics[0].topicname,`transmit:${v.name}`)             
                    },v.tsmt_fq*1000),
             fq   : v.tsmt_fq,
             x    : x,
           }
           this.log('add transmitter:',v.name);
        }        
      }
    else
      { if (v.tsmt_enb && enb) 
        {
            // change transmitter type or frequency -> need reset
            if (t.fq!=v.tsmt_fq) {          
               this.setTransmitters(idx,false);  // stop transmitter
               this.setTransmitters(idx,true,t.x);   // start transmitter
            }
            else
            {  // change params only
              
            }

        }
        else
        { // stop transmitter
            clearInterval(t.id);
            delete this.tsmts[v.name];
            this.log('del transmitter:',v.name, v.tsmt_enb, enb);
        }            
      }    
  }
  else 
    for (var i=0; i<this.visuals.length; i++) this.setTransmitters(i,enb);
}

//////////////////////////////////////////////////////////////////////////////////////// MQTTs

// idx==-1 : all
mqtt_disconnect(idx) {
  var cnt = 0;
  for (var i=0; i<this.brokers.length; i++) {
    if (idx>=0 && i!=idx) continue;
    
    const b = this.brokers[i]; this.brokers[i].actstate = 'off';
    const mqtt = this.mqtts[b.name];  if (!mqtt?.client) continue;
      
    try {
      this.mqtt_subscribe_all(mqtt,false);  
      mqtt.client.end()} 
    catch (err){console.log('MQTT disconnect:',err.message)};
    cnt++; 

    delete this.mqtts[b.name];
    }
    this.isOn = (this.mqtts.length!=0);  
  if (cnt>0) utils.message('refresh');  
}

// idx==-1 : all
/*
mqtt_connect(idx) {

    this.log('mqtt_connect enter:',this.brokers,idx,this.mqtts);   

    for (var i=0; i<this.brokers.length; i++) {
      const b = this.brokers[i];

      if (idx<0)  { if (b.actstate!='on'&&b.actstate!='err'&&b.actstate!='set') continue };
      if (idx>=0) { if (idx!=i) continue };
            
      const enc=b.encrypt?'s':'';
      var host = (b.protocol=='wq'&&b.basepath)?'':`/${b.basepath}`; 
      host = `${b.protocol}${enc}://${b.host}:${b.port}${host}`;
   
      const opt = { ...mqttOptions,
        username: b.username,
        password: b.password
      } 

      this.brokers[i].actstate = 'on';

      var m = this.mqtts[b.name]; 

      if (m?.client) { 
        if (m.msts=='on')  continue; 
        if (m.msts=='crt') continue;           
        this.mqtt_disconnect(idx)
      }

      this.log('creating mqtt client:',b.name,m);
      try {
        m = this.mqtts[b.name] = { client:mqtt.connect(host, opt), msts:'', err:'',brokername:b.name } ;
      }
      catch (err) { console.log('MQTT connect: ',err.message); m.client=undefined};

      if (m.client) {

        this.mqtt_setup(m);
        this.mqtt_change_sts(m, 'crt','MQTT created'); 
        this.isOn = true;

      }
      else {
        this.log('Connect failed',b.name,m.client);
        this.mqtt_change_sts(m, 'inv','MQTT connect failed'); 
      }  
    }
    this.log('mqtt_connect leave:',this.brokers,idx,this.mqtts);   
    
}*/
// idx==-1 : all
mqtt_connect(idx) {
  let forceFail=false;
  // console.log('mqtt_connect enter:',this.brokers,idx,this.mqtts);   

  for (var i=0; i<this.brokers.length; i++) {
    const b = this.brokers[i];

    // console.log(b,i,idx);

    if (idx<0)  { if (b.actstate!='on'&&b.actstate!='err'&&b.actstate!='set') continue };
    if (idx>=0) { if (idx!=i) continue };
          

    let prot = b.protocol.replace(':','');    
    let p=prot;        
    let path = (prot=='ws'&&b.basepath)?`/${b.basepath}`:''; 
    if (b.encrypt) prot=prot+'s';
    prot=prot+':';
    var host = `${prot}//${b.host}:${b.port}${path}`;
    
    // const url = new URL(host);
  
    let opt = {...mqttOptions, 
      clientId: `mqttx_${Math.random().toString(16).substr(2, 8)}`,
      protocol: p,
      defaultProtocol: p,
      port:     b.port,
      pathname: path,
      path:     path,
      host:     `${b.host}:${b.port}`,
      hostname: b.host,
      href:     `${prot}//${b.host}:${b.port}${path}`,
      origin:   `${prot}//${b.host}:${b.port}`,
      username: b.username,
      password: b.password,
    } 

    delete opt.protocol;
    delete opt.defaultProtocol;
    
    opt.protocol = p;
    opt.defaultProtocol = p;

    console.log('CONNECT:',b.name, host, b.protocol, prot, path, opt.protocol, opt.defaultProtocol, opt );
    
    this.brokers[i].actstate = 'on';
    var m = this.mqtts[b.name]; 

    if (m?.client) { 
      if (m.msts=='on')  continue; 
      if (m.msts=='crt') continue;       
      console.log('DISCONNECT - 1');    
      this.mqtt_disconnect(idx)
    }

    if (!forceFail) {
    try {
      m = this.mqtts[b.name] = { client:mqtt.connect(opt), msts:'', err:'', brokername:b.name };
      console.log('   opt:',opt);
    }
    catch (err) { console.log('MQTT connect: ',err.message); m.client=undefined}
    } else m = {client:undefined};

    if (m?.client) {
      this.mqtt_setup(m);
      this.mqtt_change_sts(m, 'crt','MQTT created('+opt.protocol+')'); 
      this.isOn = true;
    }
    else {
      console.log('Connect failed',b.name,m?.client);
      this.mqtt_change_sts(m, 'inv','MQTT connect failed'); 
    }  
  }
//  this.log('mqtt_connect leave:',this.brokers,idx,this.mqtts);   
  
}


mqtt_setup = (mqtt) => {

    mqtt.client.on("connect",    () => {
      
      this.log('CONNECTED TO MQTT:',mqtt.brokername);
 
      this.mqtt_subscribe_all(mqtt, true);  
      this.mqtt_change_sts(mqtt,'on','MQTT connected');       
      
    })

    mqtt.client.on("error",   (error)=> {
      this.mqtt_change_sts(mqtt,'err',`MQTT error: ${error}`);
    })
    mqtt.client.on("close",  ()=> {
      this.mqtt_change_sts(mqtt,'end','MQTT connection closed');
    })
    mqtt.client.on("reconnect", ()=> {
      this.mqtt_change_sts(mqtt,'rcn','MQTT reconnect');
    })
    mqtt.client.on("disconnect", ()=> {
      this.mqtt_change_sts(mqtt,'dis','MQTT disconnected');
    })
    mqtt.client.on("offline", ()=> {
      this.mqtt_change_sts(mqtt,'off','MQTT connection is offline');
    })
    mqtt.client.on("message",   (topic,msg)=> {
      // const payload = { topic, msg: msg.toString() };

      // this.log("MQTT message:",mqtt.brokername,topic,msg.toString());

      myData.setValue(mqtt.brokername,topic,msg.toString());
      //this.mqtt_notif('info',name,topic,msg.toString());
      utils.message('mqtt_refresh',{from:'mqtt_msg'});
      
    })

  }
  
mqtt_change_sts(mqtt,msts,err) {

  this.log('MQTT status: ',mqtt.brokername,`${msts}:${err}`);
  
  if (mqtt.msts==msts && mqtt.err==err) return;

  mqtt.msts = msts;
  mqtt.err = err;

  utils.message('mqtt_refresh',{from: 'mqtt_sts'});

}    

// subscribe/unsubsribe sa vykonáva len pre jeden broker (daný mqtt)
// ak je enb = true sa robí subscribe, ak false tak unsubscribe
// volá sa 1) po úspešnom connecte - subscribe (s enb = true)
//         2) pred disconnectom - unsubscribe  (s enb = false)
// ak sa rovnaký topic vyskytne vo viacerých visuáloch, subscribe/unsubscribe sa volá len raz, s najvyšším qos

mqtt_subscribe_topic = (mqtt,topicname,qos,enb) => {
  try {
  if (enb) mqtt.client.subscribe(topicname,qos,(err)=>{
    if (!err) this.log('*Subscribe:',mqtt.brokername,topicname,qos)
    else {
      this.mqtt_notif('error',mqtt.brokername,topicname,`Subscribe error:${err}`) 
      this.log('***** subscribe error',mqtt.brokername,topicname,qos,err)
   };    
 })
 else mqtt.client.unsubscribe(topicname,(err)=>{
    if (!err) this.log('*Unsubscribe:',mqtt.brokername,topicname)                
    else {
     this.mqtt_notif('error',mqtt.brokername,topicname,`Unsubscribe error:${err}`);   
     this.log('***** unsubscribe error',mqtt.brokername,topicname, err)
    }  
 })}
 catch (err) { 
  if (enb) {this.mqtt_notif('error',mqtt.brokername,topicname,`Subscribe error:${err.message}`) 
           this.log('***** subscribe error',mqtt.brokername,topicname,qos,err)
           }
  else {   this.mqtt_notif('error',mqtt.brokername,topicname,`Unsubscribe error:${err.message}`);   
           this.log('***** unsubscribe error',mqtt.brokername,topicname, err)
           }
}

}

mqtt_subscribe_all = (mqtt, enb=true) => {
    //const client = App.mqtt_client(broker.name); if (!client) return;

    if (!mqtt.client) return;

    const brokername = mqtt.brokername;

    this.log(`subscribe_all(${brokername}) begin`, enb);

    const tt=[];

    // hľadanie max.qos,  tt[topicname] = qos
    for (const v of this.visuals) 
      for (const t of v.topics) if (t?.brokername==brokername)
      { if (enb) { 
          var qos = tt[t.topicname];
          if (qos==undefined) qos = t.qos; else if (qos<t.qos) qos=t.qos;
          tt[t.topicname]=qos;      
          }
        else tt[t.topicname]=0;
      };


    // prechádzanie cez tt - eliminované duplikáty, nájdený požadovaný (najvyšší) qos  
    for (const key in tt) this.mqtt_subscribe_topic(mqtt,key,tt[key],enb); 
      
    this.log(`subscribe_all(${brokername}) end`, enb);  
     
  }

mqtt_notif(type,bname,tname,msg) {
  utils.message('mqtt_notif',{type:type,brokername:bname,topicname:tname,msg:msg});
}

} // end of class

export var myData = new MyData;

myData.topicColors_dft = topicColors_dft.map(c => tinycolor(c).toHexString() );

myData.dashboard.userid=1, 
myData.dashboard.username='AP';

export default myData;  

/*

broker : {
  
    name,
    certif,
    encrypt,
    protocol,
    host,
    basepath,
    username,   
    password,
    errmsg,
    actstate,      //

}

visual : {
    name,
    type,          //
    sts,           //   on | off
    topics: []
    tsmt_enb,
    tsmt_fq,
    tsmt_type,
    tsmt_dx
    tsmt_ampl
    tsmt_noise
    tsmt_qos

}

topic : {
    brokername
    topicname
    qos
    color
}


mqtts[broker.name]
mqtt : {
    client,


    msts,           //  crt : mqtt.connect úspešný, client bol vytvorený, ale ešte nezbehol on("connect")
                    //  inv : mqtt.connect zlyhal, client sa nevytvoril 
                    //  del : záznam mqtt vymazaný, aby sa mohol vyslať forceupdate
                    //  on  : po on("connect")    zelene
                    //  off : po on("offline")    sive
                    //  rcn : po on("reconnect")  modre
                    //  dis : po on("disconnect") sive
                    //  end : po on("close")      čierne
                    //  err : po on("error")      červene
  
    err             //  error message
    brokername      //  
}
     
tsmts[visual.name]
tsmt : {
     id,            // intervalId     
     fq,            // frekvencia,   pri jej zmene je nutné resetnúť transmitter
     x              // x-súradnica,  pri resete sa nastaví na nulu, inkrementuje sa o tsmt_dx
}

values[broker.name][topicname]

value: {
 y:              // value  
 x:              // datetime  

}

  
}


-- opravy ---
1) getVisual a getBroker musia vrátiť nie smerníky, ale kópie štruktúr (kboli zabezpečeniu, aby zmeny v brokers a visuals sa
   naozaj udiali len cez setBroker a setVisual)
2) ak sa zmení broker.name cez setBroker, musia sa zmeniť aj topic[i].brokername pre všetky visuals
3) ak sa zmení broker.name, musí sa to zohľadniť aj v poliach mqtts,tsmts a values, kde kľúčom je zmenené broker.name    


*/