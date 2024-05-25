import React from 'react';
import { myData } from '../../components';
import {cnf_btn ,cnf_btn_hover, hide, view ,} from '../../assets';
import {notification} from 'antd';
import { CheckCircle2Icon } from 'lucide-react';

import { freeBrokers } from '../MyConst';


const DUP_NAME = "Broker name already exists";


class ConnectForm extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      user_id: -1,  // -1 because is not logged in user
      ConnectionOPT: myData.getBroker(this.props.idx),
      fbidx: 0,
      //mandatory fields
      Errors:{  name: false,
                host: false,
                port: false,    
      }, 
      pwVisibility: false,
      isHovered: false

    };



  }

  onSelectFreeBroker = (idx)=>{}

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
      case "pw" :{
        this.setState({pwVisibility: !this.state.pwVisibility});
        break;
      }
      case "path" :{
        this.setState({pathVisibility: !this.state.pathVisibility}); 
        break;
      }

      case "cnf_btn" :{
        this.setState({isHovered: !this.state.isHovered}); 
        break;
      }
    }
  }

  handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    if(name == "name" || name == "host" || name == "port"){
      this.setState({Errors:{...this.state.Errors, [name]: false}});
    }
    this.setState({ConnectionOPT:{...this.state.ConnectionOPT, [name]: value}});
    
   
  }

  handleFreeBroker = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    console.log(name,value);
    this.setState({fbidx:value});


  }

  confirmFb = () => {
    let b = freeBrokers[this.state.fbidx];
    this.setState({ConnectionOPT:{port: b.port, 
                                  host: b.host, 
                                  protocol: b.protocol,
                                  name: b.label,
                                  basepath: b.basepath       }});


  }

  validateForm = (OPT) => {
    var err = {...this.state.Errors};
    const name = OPT.name;
    const host = OPT.host;
    const port = OPT.port; 
   
    err.name = !name;
    err.host = !host;
    err.port = !port;
    

    this.setState({Errors : err});
    return !(err.name || err.host || err.port);
  }

  handleSubmit = (event) => {
    event.preventDefault();
    if(!this.validateForm(this.state.ConnectionOPT)){
      return;
    }
    
    try{
    
      myData.setBroker(this.state.ConnectionOPT,this.props.idx);
      const Command = new CustomEvent('Command', {
        detail: { type:"brokerListVis" } // Optional data to pass with the event
      });
      window.dispatchEvent(Command);

    }
    catch(error){
      
      this.openNotificationWithIcon("error","Your brokers",DUP_NAME); 

    }
  }


  render(){

    let mi = freeBrokers.map((b,index)=>(
      <option value={index} key={index}> {b.label} </option>
    ));
      
    return (
      
      <form onSubmit={this.handleSubmit}>
      <div className="relative slideAnimation z-70">
        
        
        
          <h1 className=" main_label text-[32px] pb-3 ">
            Connect your broker
          </h1>
        
        
        <div className=" sm:ml-20 sm:mr-20 customWidth">
          <div className="pb-4">
                            
            {/*NAME*/}
            <label className="formLabel"><span className="red_star">*</span><span>Name:</span></label>
            <div className="flex justify-between items-center pwBracket ">
            <input className={this.state.Errors.name ? "formBracket_err"  : "formBracket" }
              type="text"
              name="name"
              placeholder="Enter your name"
              value={this.state.ConnectionOPT.name || ""}
              onChange={this.handleChange}
            />
            </div>

            {/*HOST*/}
            <label className="formLabel"><span className="red_star">*</span><span>Host:</span></label>
            <div className="flex justify-between items-center pwBracket ">
            <input className={this.state.Errors.host ? "formBracket_err"  : "formBracket" }
              type="text"
              name="host"
              placeholder="Host"
              value={this.state.ConnectionOPT.host || ""}
              onChange={this.handleChange}
            />
            </div>

            {/*PORT*/}
            <label className="formLabel"><span className="red_star">*</span><span>Port:</span></label>
            <div className="flex justify-between items-center pwBracket ">
            <input className={this.state.Errors.port ? "formBracket_err"  : "formBracket" } 
              type="text"
              name="port"
              placeholder="Port"
              value={this.state.ConnectionOPT.port || ""}
              onChange={this.handleChange}
            />
            </div>

            {/*USERNAME*/}
            <label className="formLabel">Username:</label>
            <div className="flex justify-between items-center pwBracket ">
            <input className="formBracket" 
              type="text"
              name="username"
              placeholder="Username"
              value={this.state.ConnectionOPT.username || ""}
              onChange={this.handleChange}
            />
            </div>

            {/*PASSWORD*/}
            <label className="formLabel">Password:</label>
            <div className="flex justify-between items-center pwBracket">
              <input className="formBracket"
                type={this.state.pwVisibility ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={this.state.ConnectionOPT.password || ""}
                onChange={this.handleChange}  
              />
              {this.state.pwVisibility ? 
                <img src={view} alt="view" onClick={this.toggleVisibility.bind(this,"pw")} className='cursor-pointer mx-2'/>
              :
                <img src={hide} alt="hide" onClick={this.toggleVisibility.bind(this,"pw")} className='cursor-pointer mx-2'/>
              }
            </div>

            {/*PROTOCOL + PATH*/}
            <label className="formLabel">Protocol:</label>
            <div className="flex justify-between items-center pwBracket">
              <select className='selectBracket'
                value={this.state.ConnectionOPT.protocol || ""}
                name="protocol" onChange={this.handleChange}>
                <option value="mqtt">mqtt://</option>
                <option value="ws">ws://</option>
              </select>  
              {this.state.ConnectionOPT.protocol == "ws" ? 
                <input className="formBracket_protocol" 
                type="text"
                name="basepath"
                placeholder="Path"
                value={this.state.ConnectionOPT.basepath || ""}
                onChange={this.handleChange}
              />
              :
                <div className="formBracket"/>
              }
            </div>

            {/*Free brokers*/}
            
            <label className="formLabel">Free brokers:</label>
            <div className="flex justify-between items-center pwBracket">
              <select className='selectBracket'
                value={this.state.fbidx}
                name="fbidx" onChange={this.handleFreeBroker}>
                  {mi}                
              </select>  
              
              <CheckCircle2Icon size={24} color="green" className='cursor-pointer mx-2' onClick={this.confirmFb}/>
            </div>
            
                

          </div>
        </div>
        
        {/*SUBMIT BUTTON*/}
        <div className="sm:ml-20 sm:mr-20 ">
          <div className="pb-4 pt-4">
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

export default ConnectForm


