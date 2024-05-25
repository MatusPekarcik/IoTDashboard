import {Get_started_button_hover,bckgrnd,bckgrnd_mirr, Get_started_button, Charon_logo_darkmode,Charon_logo_lightmode,robotic_hand_dark_mirror,robotic_hand_dark, Hand_blue2, Hand_rvrs, Main_page_logo_blue3, Main_page_logo_linear, Hand_blue3, Blue_cube, Blue_cube2} from '../assets';
import styles from '../style';
import React from 'react';
import "./CF_handle/ConnectForm.css"





class Hero extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      isHovered: false,

  
  };  
  }


  handleCommand = () => {
    const Command = new CustomEvent('Command', {
      detail: { type:"CnctEvent" ,user_id: -1} // Optional data to pass with the event  //-1 cause user not registered
    });
    window.dispatchEvent(Command);
  };

  toggleVisibility = (obj) => {
    switch(obj){
      case "btn" :{
        this.setState({isHovered: !this.state.isHovered});
        break;
      }
    }
  } 
  

  render(){
    return(
      <div className={`flex md:flex-row flex-col-reverse  border-red-700`}>
          
        {/*LEFT SIDE*/}
        <div className={`relative flex-1 ${styles.flexStart}  border-green-700 `}> 
          
          <img src={bckgrnd_mirr} alt="bckgrnd_left" className='fadein absolute '/> 
          <img src={robotic_hand_dark} alt="hand_dark" className="handAnimation hand_margin relative border-purple-500"/>  
          {/*BUTTON*/}
          <button onClick={this.handleCommand} className="absolute GetStartedMargin z-30 scale-100 handAnimation fadein sm:pr-0 pr-2"> 
            <img src={this.state.isHovered ? Get_started_button_hover : Get_started_button } alt="hand_dark" className="relative "
            onMouseEnter={this.toggleVisibility.bind(this,"btn")}
            onMouseLeave={this.toggleVisibility.bind(this,"btn")}/>
          </button>

        </div>
        
        {/*RIGHT SIDE*/}
        <div className={`relative flex-1  border-green-600 `}>

          <img src={bckgrnd_mirr} alt="bckgrnd_right" className='fadein absolute horizontal-mirror'/> 
          <img src={robotic_hand_dark_mirror} alt="hand_dark_mirror" className="handAnimation hand_margin_mirror relative border-purple-500"/>
          <img src={Charon_logo_darkmode} alt="logo" className="absolute top-0 left-0 logomargin logoWH handAnimation fadein " />*
        
        </div>
        
      </div>
    )
  }
}

export default Hero