import React from 'react'
import styles from "./style";
import { Hero, Nav, Info, Line, Foundation, myData } from './components';
import { bckgrnd } from './assets';
import { ThreeDCardDemo } from './components/3Dcard/ThreeDCardDemo';
import { HoverEffect } from "./components/HoverFx/card-hover-effect";


class App extends React.Component{
 
  constructor(props){
    super(props); 
    this.state = {
      active: false //ma byt true
    };
    myData.dashboard.screen = "App";
  };

  

  componentDidMount() {
    console.log('didMount')
    window.addEventListener('Command', this.handleCustomEvent);
    if (myData.brokers.length==0) {
      myData.restore();
      console.log(myData.dashboards);
      if(myData.dashboard.screen == "Foundation"){
        const Command = new CustomEvent('Command', {
          detail: { type:"CnctEvent" } // Optional data to pass with the event  //-1 cause user not registered
        });
        window.dispatchEvent(Command);
      }
    }
  }

  componentWillUnmount() {
    console.log('Unmount')
    window.removeEventListener('Command', this.handleCustomEvent);

  }

  handleCustomEvent = (event) => {
    const type = event.detail.type;
    switch(type){
      case "CnctEvent" :{
       // this.toggleVisibility("active");
        break;
      }
      case "Logout" :{
        this.toggleVisibility("active");
        break;
      }
    } 
  };  

  toggleVisibility = (obj) => {
    switch(obj){
      case "active" :{
        if(!this.state.active){
          myData.dashboard.screen = "App";
          myData.store();
        }
        this.setState({active: !this.state.active});
        break;
      }
    }
  }
  
  render(){ 
    return(
      <>
      
        <div className="bg-primary2 w-full overflow-hidden  ">
        
        
        
        
        
          {/*Invisible components */}
          <Foundation/>
        
          {this.state.active && ( 
          <>
        
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
              <div className={`${styles.boxWidth}`}>
                {/*Menu*/}
                <Nav/> 
              </div>
            </div>
        

        
            {/*Line*/}
            <Line/>
        
        
        
            <div className={`bg-primary2 ${styles.flexStart}`}>
              <div className={`w-full`}> {/*${styles.boxWidth}*/}
                {/*Hero component*/}
                <Hero/>
              </div>
            </div>
        

            {/*Line*/}
            <Line/>

        
            <div className={`bg-primary2 ${styles.flexStart}`}>
              <div className={`w-full ${styles.boxWidth}`}>  
                {/*Patch notes*/}
                <Info/>
                {/*<ThreeDCardDemo />*/}
              </div>
            </div>
      
          </>
          )}
         
        </div>
      
      </>
    )  
  } 
}



export default App;