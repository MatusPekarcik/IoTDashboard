import React from 'react';
import { myData } from '../../components';
import * as utils from "../utils.jsx"
import {cnf_btn,cnf_btn_hover, hide, view} from '../../assets';
import {notification} from 'antd';

const DUP_NAME = "Dashboard name already exists";


class DashboardForm extends React.Component{
  
  constructor(props){
    super(props);
    //console.log(myData.dashboards[this.props.idx]);
    this.state = {
      user_id: -1,  // -1 because is not logged in user
      dashboard: myData.dashboards[this.props.idx],
      //mandatory fields
      Errors:{  name: false,
                   
      }, 
     
      isHovered: false,

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

  handleChange = (event) => {
  console.log(event);
    const name = event.target.name;
    const value = event.target.value;
    
    if(name == "name"){
      this.setState({Errors:{...this.state.Errors, [name]: false}});
    }
    this.setState({dashboard:{...this.state.dashboard, [name]: value}});
  }

  validateForm = (DSH) => {
    var err = {...this.state.Errors};
    const dashname = DSH.dashname;
    
    err.name = !dashname;
    
    

    this.setState({Errors : err});
    return !(err.name);
  }

  handleSubmit = (event) => {
    event.preventDefault();
    if(!this.validateForm(this.state.dashboard)){
      return;
    }
    
    try{
    //toto uloyit dashboard
      utils.notifyError(async ()=>{
        
        await myData.save(this.state.dashboard,false,true);
        myData.store(false);
        const Command = new CustomEvent('Command', {
          detail: { type:"dashboardListVis" } // Optional data to pass with the event
        });
        window.dispatchEvent(Command);
      })
      

    }
    catch(error){
      
      this.openNotificationWithIcon("error","Your dashboards",DUP_NAME); 

    }
  }


  render(){
    return (
      
      <form onSubmit={this.handleSubmit}>
      <div className="relative slideAnimation z-70">
        
        
        
          <h1 className=" main_label text-[32px] pb-3 ">
            Add dashboard
          </h1>
        
        
        <div className=" sm:ml-20 sm:mr-20 customWidth">
          <div className="pb-4">
                            
            {/*NAME*/}
            <label className="formLabel"><span className="red_star">*</span><span>Name:</span></label>
            <div className="flex justify-between items-center pwBracket ">
            <input className={this.state.Errors.name ? "formBracket_err"  : "formBracket" }
              type="text"
              name="dashname"
              placeholder="Enter dashboard name"
              value={this.state.dashboard.dashname || ""}
              onChange={this.handleChange}
            />
            </div>

            {/*NOTE*/}
            <label className="formLabel"><span>Note:</span></label>
            <div className="flex justify-between items-center pwBracket ">
            <input className={this.state.Errors.host ? "formBracket_err"  : "formBracket" }
              type="text"
              name="dashdesc"
              placeholder="Note"
              value={this.state.dashboard.dashdesc || ""}
              onChange={this.handleChange}
            />
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

export default DashboardForm


