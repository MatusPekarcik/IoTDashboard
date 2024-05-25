import React from 'react';
import axios from 'axios';
import {notification} from 'antd';
import {lgn_btn, lgn_btn_hover, hide, view, head, hide_white, view_white, head_white} from '../../assets';

const PORT = 3001;
const LGN_SUCCESS = "User was signed up successfully.";

class LoginForm extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      ConnectionOPT:{ email: undefined,
                      password: undefined,             
      }, 
      //mandatory fields
      Errors:{  email: false,
                password: false,         
      }, 
      pwVisibility: false,
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
      case "pw" :{
        this.setState({pwVisibility: !this.state.pwVisibility});
        break;
      }  
      case "lgn_btn" :{
        this.setState({isHovered: !this.state.isHovered});
        break;
      }  
    
      }
  }

  handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    if(name == "email" || name == "password"){
      this.setState({Errors:{...this.state.Errors, [name]: false}});
    }
    this.setState({ConnectionOPT:{...this.state.ConnectionOPT, [name]: value}});
   
  }


/*  validateForm = (OPT) => {
    var err = {...this.state.Errors};
    const email = OPT.email;
    const password = OPT.password;
  
   
    err.email = !email;
    err.password = !password;
    
    //dokoncit validate podmienky

    this.setState({Errors : err});
    return !(err.email || err.password);
  }*/

  handleLogin = async (OPT) => { 
    var err = {...this.state.Errors};
    const email = OPT.email;
    const password = OPT.password;
    
    err.email = !email;
    err.password = !password;
    
    try {
        const response = await axios.post(`http://localhost:${PORT}/login`, {
        email: this.state.ConnectionOPT.email,
        password: this.state.ConnectionOPT.password,
      });
      if (response.data.success) {
        // Optionally, do something here if signup was successful
        this.openNotificationWithIcon("success","Login",LGN_SUCCESS); 
        return response.data.data.id;
      } else {
        // Optionally, handle the error or return false
        this.openNotificationWithIcon("error","Login",response.data.error.message);
        err.email = true;
        err.password = true;
        this.setState({Errors : err});
        return undefined;
      }

      

    } catch (error) {
      console.error('Error during login(catch):', error.message);
      // Handle network or other errors here
      return undefined;
    }
  };

  handleSubmit = async(event) => {
    event.preventDefault();
    var user_id = await this.handleLogin(this.state.ConnectionOPT);
    console.log("user_id: ",user_id);
    if(!user_id){
      return;
    }
    const Command = new CustomEvent('Command', {
      detail: { type:"CnctEvent" ,user_id: user_id} // Optional data to pass with the event
    });
    window.dispatchEvent(Command);
  }


  render(){
    return (
      
      <form onSubmit={this.handleSubmit}>
      <div className="relative slideAnimation z-70 ">
        
        
        
          <h1 className=" main_label text-[32px] pb-3 pl-3">
            Login
          </h1>
          
        
        <div className=" sm:ml-20 sm:mr-20 customWidth">
          <div className="pb-4">
                            
            {/*EMAIL*/}
            <label className="formLabel"><span className="red_star">*</span><span>Email:</span></label>
            <div className={`flex justify-between items-center ${this.state.Errors.email ? "pwBracket_err"  : "pwBracket" } `}>    
            <input className={this.state.Errors.email ? "formBracket_err"  : "formBracket" }
              type="text"
              name="email"
              placeholder="Email"
              value={this.state.ConnectionOPT.email || ""}
              onChange={this.handleChange}
            />
              <img src={`${this.state.Errors.email ? head_white  : head }`}  alt="head" className='mx-2'/>
            </div>
            

            {/*PASSWORD*/}
            <label className="formLabel"><span className="red_star">*</span><span>Password:</span></label>
            <div className={`flex justify-between items-center ${this.state.Errors.password ? "pwBracket_err"  : "pwBracket" } `}>
            <input className={this.state.Errors.password ? "formBracket_err"  : "formBracket" }
                type={this.state.pwVisibility ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={this.state.ConnectionOPT.password || ""}
                onChange={this.handleChange}  
              />
              {this.state.pwVisibility ? 
                <img src={`${this.state.Errors.password ? view_white  : view }`} alt="view" onClick={this.toggleVisibility.bind(this,"pw")} className='cursor-pointer mx-2'/>
              :
                <img src={`${this.state.Errors.password ? hide_white  : hide }`} alt="hide" onClick={this.toggleVisibility.bind(this,"pw")} className='cursor-pointer mx-2'/>
              }
            </div>

            
            

          </div>
        </div>
        
        {/*SUBMIT BUTTON*/}
        <div className="sm:ml-20 sm:mr-20">
          <div className="pb-4 pt-4">
            <button type="submit">
              <img src={this.state.isHovered ? lgn_btn_hover : lgn_btn } alt="lgn_btn" className=""
              onMouseEnter={this.toggleVisibility.bind(this,"lgn_btn")}
              onMouseLeave={this.toggleVisibility.bind(this,"lgn_btn")}/>
            </button>
          </div>
        </div>
      </div>
      </form>
      
    )
  }
}

export default LoginForm


