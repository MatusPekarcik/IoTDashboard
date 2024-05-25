import React from 'react';
import "./ConnectForm.css";
import { myData } from '../../components';
import * as utils from "../utils.jsx"
import {cnf_btn,cnf_btn_hover} from '../../assets';
import { phthaloGreenToolTip,phthaloGreen, iotTypes, tsmtTypes } from '../MyConst'
import {notification, Tooltip, Popconfirm, ColorPicker} from 'antd';
import { PlusSquare, Trash2, AlertCircle } from "lucide-react";
import { toHexFormat } from 'antd/es/color-picker/color';




const ERR_NOTIF = "Error with updating visual";


class VisualForm extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      visual: myData.getVisual(this.props.idx),
     
      //mandatory fields
      Errors:{  name: false,        
      }, 
      isHovered: false,
      isLine: false,
    };



  }

  openNotificationWithIcon = (type,title,desc) => {
    var clsnm = "";
    if(type == "success"){
      clsnm = "custom-notification-success";
    }
    else{
      clsnm = "custom-notification-error";
    }
    notification[type]({
      message: title,
      description: desc,
      placement: "topRight",
      duration: 10,
      className: clsnm
      
      
      
    });
  };

  


  toggleVisibility = (obj) => {
    switch(obj){
      case "cnf_btn" :{
        this.setState({isHovered: !this.state.isHovered}); 
        break;
      }
    }
  }

  onTopicAdd = () => {
    console.log("som v ADD");
    var v = {...this.state.visual};
    var tt = v.topics.slice();
    tt.push({
      topicname: undefined,
      brokername: myData.brokers[0]?.name,
      qos : 0,
      //color : "#256e4b"

    })
    v.topics = tt;
    this.setState({visual: v}); 



  }

  onTopicDel = (idx) => {
    var v = {...this.state.visual};
    var tt = v.topics.map(t=>({...t}));
    tt.splice(idx,1);
    v.topics = tt;
    this.setState({visual: v}); 
    
  }

  handleColorChange = (name,index,value) => {
    console.log(name,index,value);
    value = value.toHexString();
    var v = this.state.visual;
    var tt = v.topics;
    tt[index][name] = value;
    v.topics = tt;
    this.setState({visual: v});

  }

  handleChange = (event) => {
    var name = event.target.name;
    var value = event.target.value;
    var index = -1;
    
    if(name.startsWith("brokername")){
      index = name.replace("brokername","");
      name = "brokername";
    }
    if(name.startsWith("topicname")){
      index = name.replace("topicname","");
      name = "topicname";
    }
    if(name.startsWith("qos")){
      index = name.replace("qos","");
      name = "qos";
    }
  /*
    if(name == "name"){
      this.setState({Errors:{...this.state.Errors, [name]: false}});
      return;
    }
*/

    let v = this.state.visual;

    if( index != -1 ){
      
      var tt = v.topics;
      tt[index][name] = value;
      v.topics = tt;

    }
    else {
      if(name == "tsmt_dx" || name == "tsmt_ampl" || name == "tsmt_fq" || name == "tsmt_noise" || name == "rng" ||
        name == "min" || name == "max" || name == "greenZone" || name == "orangeZone" || name == "redZone" || name == "purpleZone"){
        value = value == "" ? value : Number(value);
      }
      v[name] = value;
      if(name == "function"){
        v.tsmt_enb = (value=="Transmitter");
        v.publ_enb = (value=="Publisher");  
      }
    }
    
    this.setState({visual:v},() => {console.log("setState ", this.state.visual)} );




    

   /*
     
    if(value === "Line"){
      this.setState({isLine: true}); 
    }
    else if(value === "Text" || value === "Bar" || value === "Speedmeter" ){

      this.setState({isLine: false}); 
    }



    if(name == "function"){
      this.setState({visual:{...this.state.visual, tsmt_enb: value=="transmitter"}})
    }
   */
  }

  validateForm = (OPT) => {
    var err = {...this.state.Errors};
    const name = OPT.name;
    
    
   
    err.name = !name;
  
    

    this.setState({Errors : err});
    return !(err.name );
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    if(!this.validateForm(this.state.visual)){
      return;
    }
    
    try{
  
      let topics = {...this.state.visual.topics};
      let len = this.state.visual.topics.length;
      
      for (let i = 0; i < len; i++) {
        let mqtt = myData.mqtts[topics[i].brokername]
        if(mqtt == undefined){
          let idx = myData.getBrokerIdx(topics[i].brokername);
          if(idx == -1){throw new Error('Wrong broker name');}
          myData.mqtt_connect(idx);
          
        } 
      }

      await utils.notifyError(async ()=>{
        myData.setVisual(this.state.visual, this.props.idx);
        const Command = new CustomEvent('Command', {
          detail: { type:"visualFormVis" } // Optional data to pass with the event
        });
        window.dispatchEvent(Command);
      })
       
      
      
     
    }
    catch(error){
      
      this.openNotificationWithIcon("error","Visual",ERR_NOTIF); 
     
    }
  }
//

  render(){
    return (
      
      <form onSubmit={this.handleSubmit}>
      <div className="relative slideAnimation z-70  border-blue-500 ">
        
        
        
          <h1 className=" main_label text-[32px]  pb-3 pl-2">
          Visual
          </h1>
        
        
        <div className=" ml-24 mr-24 customWidth  border-purple-500">
          <div className="pb-4" >
                            
            
            {/*SUB/PUB/TRANS + NAME*/}
            <label className="formLabel "><span className="red_star">*</span><span>Function</span></label>
            <div className="flex justify-between items-center pwBracket">
              <select className='selectBracket'
              value={this.state.visual.function|| ""}
              name="function" onChange={this.handleChange}>
                <option value="Subscriber">Subscriber</option>
                <option value="Transmitter">Transmitter</option>
              </select>  
              <input className={this.state.Errors.name ? "formBracket_err"  : "formBracket" }
              type="text"
              name="name"
              placeholder="Enter name"
              value={this.state.visual.name || ""}
              onChange={this.handleChange}
              /> 
            </div>

            {/*NOTE*/}
            <label className="formLabel"><span>Note:</span></label>
            <div className="flex justify-between items-center pwBracket ">
            <input className= "formBracket" 
              type="text"
              name="note"
              placeholder="Write your note"
              value={this.state.visual.note || ""}
              onChange={this.handleChange}
            />
            </div>

            <div className="grid grid-cols-3 gap-1"> 
            {/*TYPE*/}
            <div className="flex flex-col justify-between ">
              <label className="formLabel">Visual type:</label>
                <div className="flex justify-between items-center pwBracket">
                  <select className='formBracket minWidth'
                  value={this.state.visual.type || ""}
                  name="type" onChange={this.handleChange}>
                    {iotTypes.map((t,index) => (
                        <option key={index} value={t.value}>{t.label}</option> 
                    ))}
                  </select>
                </div>
              </div>  
              
              {/*RANGE*/}
              {this.state.visual.type == "line" && (
                <div className="flex flex-col justify-between ">
                  <label className="formLabel">Range(sec):</label>
                  <div className="flex justify-between items-center pwBracket ">
                    <input className="formBracket minWidth " 
                      type="number"
                      name="rng"
                      placeholder="Seconds"
                      value={this.state.visual.rng}
                      onChange={this.handleChange}
                    />
                  </div>
                </div>  
              )}

              
              {this.state.visual.type == "speed" && (
              <>
                {/*MIN*/}
                <div className="flex flex-col justify-between ">
                  <label className="formLabel">Min:</label>
                  <div className="flex justify-between items-center pwBracket ">
                    <input className="formBracket minWidth " 
                      type="number"
                      name="min"
                      placeholder="Min value"
                      value={this.state.visual.min}
                      onChange={this.handleChange}
                    />
                  </div>
                </div> 

                {/*MAX*/}
                <div className="flex flex-col justify-between ">
                  <label className="formLabel">Max:</label>
                  <div className="flex justify-between items-center pwBracket ">
                    <input className="formBracket minWidth " 
                      type="number"
                      name="max"
                      placeholder="Max value"
                      value={this.state.visual.max}
                      onChange={this.handleChange}
                    />
                  </div>
                </div> 
                
                {/*GREEN ZONE*/}
                <div className="flex flex-col justify-between">
                 <label className="formLabel">Green zone %:</label>
                  <div className="flex justify-between items-center pwBracket ">
                    <input className="formBracket minWidth" 
                      type="number"
                      name="greenZone"
                      placeholder=""
                      value={this.state.visual.greenZone }
                      onChange={this.handleChange}
                    />
                  </div> 
                </div>  

                {/*ORANGE ZONE*/}
                <div className="flex flex-col justify-between">
                 <label className="formLabel">Orange zone %:</label>
                  <div className="flex justify-between items-center pwBracket ">
                    <input className="formBracket minWidth" 
                      type="number"
                      name="orangeZone"
                      placeholder="%"
                      value={this.state.visual.orangeZone }
                      onChange={this.handleChange}
                    />
                  </div> 
                </div>  

                {/*RED ZONE*/}
                <div className="flex flex-col justify-between">
                 <label className="formLabel">Red zone %:</label>
                  <div className="flex justify-between items-center pwBracket ">
                    <input className="formBracket minWidth" 
                      type="number"
                      name="redZone"
                      placeholder="%"
                      value={this.state.visual.redZone }
                      onChange={this.handleChange}
                    />
                  </div> 
                </div>  
                
                {/*PURPL ZONE*/}
                <div className="flex flex-col justify-between">
                 <label className="formLabel">Purple zone %:</label>
                  <div className="flex justify-between items-center pwBracket ">
                    <input className="formBracket minWidth" 
                      type="number"
                      name="purpleZone"
                      placeholder="%"
                      value={this.state.visual.purpleZone }
                      onChange={this.handleChange}
                    />
                  </div> 
                </div> 
              </>
              )}
            
            {this.state.visual.tsmt_enb && (
             <>
          {/*  <div className="grid grid-cols-3 gap-1">*/}
                {/*FREQUENCY*/}
                <div className="flex flex-col justify-between  border-red-500">
                  <label className="formLabel">Frequency:</label>
                  <div className="flex justify-between items-center pwBracket ">
                    <input className="formBracket minWidth " 
                      type="number"
                      name="tsmt_fq"
                      placeholder=""
                      value={this.state.visual.tsmt_fq }
                      onChange={this.handleChange}
                    />
                  </div>
                </div>  
              
                {/*TRANSMITTER TYPE*/}  
                <div className="flex flex-col justify-between ">
                  <label className="formLabel">Type:</label>
                  <div className="flex justify-between items-center pwBracket ">
                    <select className='formBracket minWidth '
                    value={this.state.visual.tsmt_type || ""}
                    name="tsmt_type" onChange={this.handleChange}>
                      {tsmtTypes.map((t,index) => (
                        <option key={index} value={t.value}>{t.label}</option> 
                    ))}
                    </select>
                  </div>
                </div>  

                {/*NOISE*/}
                <div className="flex flex-col justify-between">
                 <label className="formLabel">Noise:</label>
                  <div className="flex justify-between items-center pwBracket ">
                    <input className="formBracket minWidth" 
                      type="number"
                      name="tsmt_noise"
                      placeholder="%"
                      value={this.state.visual.tsmt_noise }
                      onChange={this.handleChange}
                    />
                  </div> 
                </div>  
            
                
           
                {/*DX*/}
                <div className="flex flex-col justify-between border-red-500">
                <label className="formLabel">DX:</label>
                <div className="flex justify-between items-center pwBracket ">
                  <input className="formBracket minWidth" 
                    type="number"
                    name="tsmt_dx"
                    placeholder=""
                    value={this.state.visual.tsmt_dx }
                    onChange={this.handleChange}
                  />
                </div>  
                </div>

                {/*AMPLITUDE*/}
                <div className="flex flex-col justify-between ">
                <label className="formLabel">Amplitude:</label>
                <div className="flex justify-between items-center pwBracket ">
                  <input className="formBracket minWidth" 
                    type="number"
                    name="tsmt_ampl"
                    placeholder=""
                    value={this.state.visual.tsmt_ampl }
                    onChange={this.handleChange}
                  />
                </div>  
                </div>

                        
                
                </>
            
              
           
              
            )}
            
            </div>  
            

            {/*BROKER NAME + TOPIC PATH / NAME*/}
  {this.state.visual.topics.map((topic,idx) => (
    <>
            <label className="formLabel BorderTop1 mt-3">Broker/Topic path:</label>
            <div className="flex justify-between items-center pwBracket ">
              <select className='selectBracket'
              value={topic.brokername || ""}
              name={`brokername${idx}`} 
              onChange={this.handleChange}>
              {myData.brokers.map((structure, index) =>  (
                  <option value={structure.name}>{structure.name}</option>
              ))}  
                
              </select>  
              <input className="formBracket_protocol" 
              type="text"
              name={`topicname${idx}`}
              placeholder="Topic path"
              value={topic.topicname || ""}
              onChange={this.handleChange}
              /> 
            </div>
           

            {/*QOS COLOR TRASH*/}
            <div className="grid grid-cols-3 justify-between items-center gap-3">
              

              {/*QOS*/}
              <div className="flex flex-col justify-between ">
              <label className="formLabel">QOS:</label>
                <div className="flex justify-between items-center pwBracket">
                  <select className='formBracket minWidth '
                  value={topic.qos || ""}
                  name={`qos${idx}`}
                  onChange={this.handleChange}>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </div> 
              </div>
              
              {/*COLOR*/}
              <div className="flex flex-col justify-between ">
                <label className="formLabel">Color:</label>
                <div className="flex justify-between items-center  minWidth">

                    <ColorPicker className="" name={`color${idx}`} size="large" trigger="hover" defaultValue="#1677ff" showText enabled value={topic?.color} onChange={this.handleColorChange.bind(this,"color",idx)}/>
                    
                </div> 
              </div>

              {this.state.visual.topics.length > 1 &&(
                <Popconfirm
                title={<span className="customPopconfTtl">Delete the topic</span>}
                description={<span className="customPopconfDsc">Are you sure to delete this topic?</span>}
                placement="right"
                icon={<AlertCircle color="#ff0000" size={24} className='pr-1'/>}
                okText={<span className="customPopconfDsc">Yes</span>}
                cancelText={<span className="customPopconfDsc">No</span>}
                okButtonProps={{ style: { background: 'green' } }}
                cancelButtonProps={{ className: "cancelButtonProps" }}
                onConfirm={this.onTopicDel.bind(this,idx)}
                >
                  {/*<Tooltip placement="topRight" color={phthaloGreen} title="Delete topic">*/}
                    
                  <div className="flex flex-col justify-between ">
                   <label className="formLabel">Delete topic:</label>
                    <div className="flex justify-between items-center pwBracket bg-red-600">
                      <a className='flex flex-row formBracket minWidth cursor-pointer justify-center items-center text-white bg-red-600'>
                        {<Trash2 size={24} color='white'/>}
                      </a>
                      
                    </div> 
                  </div>
                 {/* </Tooltip>*/}
                </Popconfirm> 
              )}
            </div>
  </>
 ))}           
            {/*///////////////////////////////////////////////////////////////*/}
            {(this.state.visual.type == "line" || this.state.visual.type == "text") && (
              <Tooltip color={phthaloGreen} title="Add topic">
                <div className=' text-white pt-4 cursor-pointer center-container' onClick={this.onTopicAdd}>  {<PlusSquare size={24} />}</div>      
              </Tooltip>
            )}

          </div>
        </div>
        
        {/*SUBMIT BUTTON*/}
        <div className="ml-24 mr-24">
          <div className="pb-4 ">
            <button type="submit">
              <img src={this.state.isHovered ? cnf_btn_hover : cnf_btn } alt="cnf_btn" className=""
              onMouseEnter={this.toggleVisibility.bind(this,"cnf_btn")}
              onMouseLeave={this.toggleVisibility.bind(this,"cnf_btn")}/>
            </button>
          </div>
        </div>
      </div>
      </form>
        
    )
  }
  
}

export default VisualForm


