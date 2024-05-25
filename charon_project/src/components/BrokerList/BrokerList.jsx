import React from 'react';
import "./BrokerList.css";
import { myData } from '../../components';
import { PlusSquare, Cog, Trash2, CheckCircle2, AlertCircle, Circle} from "lucide-react";
import { phthaloGreenToolTip,phthaloGreen } from '../MyConst'
import { Tooltip,Popconfirm } from 'antd';



class BrokerList extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            brokerList: myData.brokers,
            brokerListVis: true,
            isHoveredIdx: -1,
            isHoveredAdd: false,

        
        };  
    }

/*
    componentDidMount() {
        console.log('didMount')
        window.addEventListener('Command',this.handleCustomEvent);
    }
    
    componentWillUnmount() {
        console.log('Unmount')
        window.removeEventListener('Command', this.handleCustomEvent);

    }


    handleCustomEvent = (event) => {
        const type = event.detail.type;
        switch(type){
          case "cnctForm" :{
            console.log("som v cnctForm");
            this.toggleVisibility("cnctForm");
            break;
          }
        }
        
      };  
*/
    toggleVisibility = (obj,index, enb) => {
      switch(obj){
        case "cnctFormVis" :{
          const Command = new CustomEvent('Command', {
            detail: { type:"cnctFormVis", index:index } // Optional data to pass with the event
          });
          window.dispatchEvent(Command);
          break;
        }

        case "bracket" :{
          this.setState({isHoveredIdx: enb ? index : -1});
          break;
        }

        case "add" :{
          
          console.log("som v add",enb);
          this.setState({isHoveredAdd: enb});
          break;
        }
        

      }
    } 
   
    onDelete = (index) => {
      myData.delBroker(index);
      this.forceUpdate();
    }

    onConnect = (index) => {
      ///tu som skoncil
    }
    

    getStsColor = (broker) => {
      let stsColor = "black";
      switch (myData.mqtts[broker.name]?.msts){
        case 'on'  : {stsColor = "green"; break;}
        case 'err' : {stsColor = "red"; break;}
        case 'end' : {stsColor = "gray"; break;}
        case 'rcn' : {stsColor = "blue"; break;}
        case 'dis' : {stsColor = "orange"; break;}
        case 'off' : {stsColor = "gray"; break;}
        case 'inv' : {stsColor = "red"; break;}
        case 'set' : {stsColor = "green"; break;}
        case 'crt' : {stsColor = "blue"; break;}
      }
      return stsColor;
    }

    render(){


       
        return(
        <>    
          
          {this.state.brokerListVis && (
            <div className="flex-1 flex-col  text-white center-container relative slideAnimation ">
            
              <h1 className=" main_label text-[32px] pb-5 ">
                Your brokers
              </h1>

              
            
              {this.state.brokerList.map((structure, index) => (
                
               
                
                <div className={`flex justify-between items-center BrokerBracket mt-3 cursor-pointer ${this.state.isHoveredIdx == index ? "phthalo-green"  : "" }`} key={index} 
                onMouseEnter={this.toggleVisibility.bind(this,"bracket",index,true)}
                onMouseLeave={this.toggleVisibility.bind(this,"bracket",index,false)}>
                  {/*<Tooltip placement="left" color={phthaloGreen} title="Tu bude status">  */}
                    <div onClick={this.onConnect.bind(this,index)} className='flex flex-row items-center justify-between ml-1'>
                    <Circle size={24} color={this.getStsColor(structure)}/>
                    <p className='pl-2 text-white'>{structure.name}</p>
                    
                    
                    </div>  
                 {/* </Tooltip> */}
                  <div className='flex flex-row'>
                    <Tooltip placement="topRight" color={phthaloGreen} title="Edit broker">  
                      <div onClick={this.toggleVisibility.bind(this,"cnctFormVis", index)} className='mr-1 cursor-pointer'>{<Cog size={24} />}</div>
                    </Tooltip>                
                    <Popconfirm
                    title={<span className="customPopconfTtl">Delete the broker</span>}
                    description={<span className="customPopconfDsc">Are you sure to delete this broker?</span>}
                    placement="right"
                    icon={<AlertCircle color="#ff0000" size={24} className='pr-1'/>}
                    okText={<span className="customPopconfDsc">Yes</span>}
                    cancelText={<span className="customPopconfDsc">No</span>}
                    okButtonProps={{ style: { background: 'green' } }}
                    cancelButtonProps={{ className: "cancelButtonProps" }}
                    onConfirm={this.onDelete.bind(this, index)}
                    >
                    <Tooltip placement="topRight" color={phthaloGreen} title="Delete broker">
                      <div className='mr-1 cursor-pointer '>{<Trash2 size={24} />}</div>
                    </Tooltip>
                    </Popconfirm>
                  </div>
                  
                </div>
              ))} 

              
              
                <div className={`flex justify-center items-center BrokerBracket mt-3 cursor-pointer ${this.state.isHoveredAdd ? "phthalo-green"  : "" }`}
                 onMouseEnter={this.toggleVisibility.bind(this,"add",-1,true)}
                 onMouseLeave={this.toggleVisibility.bind(this,"add",-1,false)}>
                  <Tooltip color={phthaloGreen} title="Add broker">
                    <div className=' text-white  cursor-pointer' onClick={this.toggleVisibility.bind(this,"cnctFormVis",-1)} >  {<PlusSquare size={24} />}</div> 
                  </Tooltip>
                </div>  
            
             
            </div>  
            
          )} 
            
            
            
              
               

         
            
        </>
        )
    }
}

export default BrokerList;