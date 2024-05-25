"use client";
import React from 'react';
import "./Visual.css";
import { myData } from '../../components';
import * as utils from "../utils.jsx"
import { Cog, Trash2, AlertCircle, Send, TableProperties, Snowflake, Download } from "lucide-react";
import { bckgrnd_tile, bckgrnd_mirr } from '../../assets';
import { phthaloGreenToolTip,phthaloGreen } from '../MyConst'
import { Tooltip,Popconfirm } from 'antd';
import { IoTBar, IoTLine, IoTSpeedy, IoTSpeedy2, IoTText } from './IoTControls';
import { CardBody, CardContainer, CardItem } from "../3Dcard/3d-card.jsx";
import { MyCardItem, MyCardBody, MyCardContainer } from "../3Dcard/MyCardItem.jsx";


class Visual extends React.Component{
  
    constructor(props){
        super(props);
        this.state = {
          use3D: false,
        };  
    }

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
    const data = event.detail;
    
    switch(type){

      case "3D" :{
         //console.log("som vo found CnctEvent");
          this.toggle3D();
          break;
      }
    }
  }

    getIntArray = (x) => {
        const result = [];
        for(let i = 1; i<= x; i++){
            result.push(i);

        }
        return result;
    }

    toggle3D = () => {
      this.state.use3D = !this.state.use3D;
      this.forceUpdate();
    }

    toggleVisibility = (obj,index) => {
        switch(obj){
          case "frozen":{

            myData.visuals[this.props.index].frozen = myData.visuals[this.props.index].frozen == -1 ? Date.now() : -1;
            myData.store();
            this.forceUpdate();
          break;
          }
          case "visualFormVis" :{
            const Command = new CustomEvent('Command', {
              detail: { type:"visualFormVis", index:index } // Optional data to pass with the event DOPLNIT DOBRY INDEX
            });
            window.dispatchEvent(Command);
            break;
          }
          case "valuesTable" :{
            const Command = new CustomEvent('Command', {
              detail: { type:"valuesTable", index:index } // Optional data to pass with the event DOPLNIT DOBRY INDEX
            });
            window.dispatchEvent(Command);
            break;
          }
          
        }
      } 

    onDelete = (index) => {
        myData.delVisual(index);
        myData.myCommand("refresh");
    } 

    onPublish = () => { 
       
        utils.notifyError(()=>{
          let val = myData.visuals[this.props.index].publ_value;
        //  console.log("publish",this.props.index,val);
          myData.mqtt_publish(this.props.index,val);
          utils.message('refresh');
        })
      }
      
     
      onChange = (event) => {
         myData.visuals[this.props.index].publ_value = event.target.value;
         console.log("onChang");
         myData.store(myData.dashboard.autosave);
         utils.message('refresh');
      }

      exportTable = (index) =>{
        myData.exportVisualData( index, true );
       // myData.exportVisualData(myData.visuals[index]);


      }


      
      


    render(){
        let visual = this.props.structure;
        visual.publ_enb = true;
        let xmax,xmin,xx,lb;


        if (visual.rng) {
          
          xmax = visual.frozen == -1 ? Date.now() : visual.frozen;
          xmin = xmax - visual.rng * 1000;        
      
          xx = visual.topics.reduce(
            (acc, t)=>acc.concat(myData.getValue(visual.name,t?.brokername,t?.topicname,'T',xmin).map(v=>v.x)), 
            [xmin-1,xmax+1]);
            
            lb = Array.from(new Set(xx)).sort((x1, x2) => x1 - x2);
          
        }
        else
        {
          xx = visual.topics.reduce(
            (acc, t)=>acc.concat(myData.getValue(visual.name,t?.brokername,t?.topicname,'T').map(v=>v.x)), 
            []);
        
            lb = Array.from(new Set(xx)).sort((x1, x2) => x1 - x2);  

          xmin = Math.min(...lb);
          xmax = Math.max(...lb);
        
        }
       
        


        return(
        <div className=" rounded-md mt-5 mr-3 ml-3 mb-5 relative z-[298] ">
        <MyCardContainer use3D = {this.state.use3D} className="inter-var rounded-md bg-black ">  
        <MyCardBody use3D = {this.state.use3D} className=" relative rounded-md group/card hover:shadow-10x5 hover:shadow-100/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full  h-full   border  ">
        <div className="w-full myHeighy rounded-md   myBorder p-2 flex flex-col "style={{ backgroundImage: `url(${bckgrnd_mirr})` }}>
       
                <MyCardItem
                use3D = {this.state.use3D}
                translateZ="50"
                className=" w-full h-10   text-white flex justify-between items-center "
                >
                    <div className='flex flex-row items-center justify-between ml-3  '>
                        <Tooltip placement="topRight" color={phthaloGreen} title={this.props.structure.note}>  
                          <p className=' text-white myText2  border-red-400'>{this.props.structure.name}</p>
                        </Tooltip> 
                    </div>
                  
               
                    <div className='flex flex-row  border-red-400 mr-3'> 
                        <Tooltip placement="topRight" color={phthaloGreen} title="Freeze" >  
                            <div onClick={this.toggleVisibility.bind(this,"frozen")} className='mr-1 cursor-pointer   group-hover/card:shadow-custom'><Snowflake size={24} color={this.props.structure.frozen == -1 ? 'white' : 'cyan'}/></div>
                        </Tooltip> 
                        <Tooltip placement="topRight" color={phthaloGreen} title="Export table" >  
                            <div onClick={this.exportTable.bind(this,this.props.index)} className='mr-1 cursor-pointer   group-hover/card:shadow-custom'><Download size={24} /></div>
                        </Tooltip>
                        <Tooltip placement="topRight" color={phthaloGreen} title="Values table">  
                            <div onClick={this.toggleVisibility.bind(this,"valuesTable", this.props.index)} className='mr-1 cursor-pointer   group-hover/card:shadow-custom'>{<TableProperties size={24} />}</div>
                        </Tooltip> 
                        <Tooltip placement="topRight" color={phthaloGreen} title="Edit visual">  
                            <div onClick={this.toggleVisibility.bind(this,"visualFormVis", this.props.index)} className='mr-1 cursor-pointer   group-hover/card:shadow-custom'>{<Cog size={24} />}</div>
                        </Tooltip> 
                        <Popconfirm
                        title={<span className="customPopconfTtl">Delete the visual</span>}
                        description={<span className="customPopconfDsc">Are you sure to delete this visual?</span>}
                        placement="right"
                        icon={<AlertCircle color="#ff0000" size={24} className='pr-1'/>}
                        okText={<span className="customPopconfDsc">Yes</span>}
                        cancelText={<span className="customPopconfDsc">No</span>}
                        okButtonProps={{ style: { background: 'green' } }}
                        cancelButtonProps={{ className: "cancelButtonProps" }}
                        onConfirm={this.onDelete.bind(this, this.props.index)}
                        >
                            <Tooltip placement="topRight" color={phthaloGreen} title="Delete visual">
                                <div className=' cursor-pointer  group-hover/card:shadow-custom'>{<Trash2 size={24} />}</div>
                            </Tooltip>
                        </Popconfirm>  
                    </div> 
                   
                </MyCardItem>
                {(visual.type != 'speed' && visual.type != 'text') && 
                <MyCardItem
                use3D = {this.state.use3D}
                translateZ="80"
                className=" w-full flex justify-between items-center "
                >
                    <div className=' items-center justify-between border-blue-500 w-full mr-3 ml-3'>
                        <div className=' myRemark  grid grid-cols-3  '>{
                          visual.topics.map((t,index) => (
                            <div key={index} className='flex border-rose-500  items-center justify-start 'style={{color: t.color}}>
                              
                                {myData.getValue(visual.name,t.brokername,t.topicname,0) ? myData.getValue(visual.name,t.brokername,t.topicname,0) : "-"}
                              
                            </div>          

                          ))}</div>
                    </div>
                </MyCardItem>
                }
                <MyCardItem use3D = {this.state.use3D} translateZ="115" className="w-full h-full flex items-center justify-center mb-2 mt-2 rounded-md ">
                <div className=' w-full h-full flex items-center justify-center '>
                    <div className=' myBg graphBordr w-full h-full rounded-md mx-2 group-hover/card:shadow-custom '>
                    {visual.type == 'text' && 

                <div className=' h-full flex items-center justify-center '>
                    <IoTText  
                    values={visual.topics.map(t=>myData.getValue(visual.name,t.brokername,t.topicname,0))} 
                    options={{
                    labels : visual.topics.map(t=> `${t.topicname}(${t.brokername})`),
                    colors : visual.topics.map(t=>t.color),
                    fontSize : 24,
                    fontFamily : 'Poppins',
                    fontStyle : 400,
                    fontColor : "white",
      
                    hdrFontSize : 16,
                    hdrFontColor : undefined,         
                    hdrFontStyle : 'light',
                    hdrFontFamily: 'Poppins',
                    hdrVisible : true
                    }}/>
                </div>
                    }
                    {visual.type == 'bar' && 
                      <IoTBar value={myData.getValue(visual.name,visual.topics[0].brokername,visual.topics[0].topicname)} title={"BAR"}/>  
                    }
                    {visual.type == 'speed2' && 
                      <IoTSpeedy value={myData.getValue(visual.name,visual.topics[0].brokername,visual.topics[0].topicname,0)} title={"SPD"}/>  
                    }
                    {visual.type == 'speed' && 
                      <IoTSpeedy2 value={myData.getValue(visual.name,visual.topics[0].brokername,visual.topics[0].topicname,0)} title={"SPD2"} vsl={visual}/>  
                    }
                    {visual.type == 'line' && 
                      <IoTLine title={"Line"} min={new Date(xmin)} max={new Date(xmax)} type='time'
          
          data={{
            
            //  labels: this.genIntArray(35),
              labels:   lb,
              datasets: visual.topics.map( (t)=>{ return {
                label: `${t?.topicname}(${t?.brokername})`,
                fill: false,
                tension: 0.3,
                // showLine: false,
                borderColor: t.color,
                backgroundColor: t.color,
                pointHoverBorderColor: "white",
                pointHitRadius: 5,

                borderWidth: 3,         // size of line
                radius: 2,           // size of point
                pointStyle: 'circle',
                /*
                'circle'
                'cross'
                'crossRot'
                'dash'
                'line'
                'rect'
                'rectRounded'
                'rectRot'
                'star'
                'triangle'
                false
                */

       
                
                data : myData.getValue(visual.name,t?.brokername,t?.topicname,'T',xmin).map(v=>({x:new Date(v.x),y:v.y}))


                }})

            }}/> } 
                    </div>
                    </div>
                </MyCardItem> 
                <MyCardItem
                use3D = {this.state.use3D}
                translateZ="100"
                className=" w-full h-10  text-white "
                >
                     <div className=" w-full flex items-center justify-center  ">
                        <h1 className=" myText2 text-white ml-5 w-full flex items-center justify-center rounded-md ">
                        
                        {visual?.publ_enb &&
                            <>
                            <div className="flex flex-row justify-between items-center pwBracket">
                                <input className="formBracket text-black"
                                
                                name={`publishValue${this.props.index}`}
                                placeholder="Publish value"
                                value = {visual?.publ_value}
                                onChange={this.onChange} 
                                /> 
                            </div>
                            <button className='text-white cursor-pointer mx-2' onClick={this.onPublish}>
                                {<Send size={24} />}
                            </button>
                            </>
                        }
                        {!visual?.publ_enb &&
                            <a className="">800</a>
                        }    
                        </h1>
                    </div>
                </MyCardItem> 
            </div>
        </MyCardBody>
        </MyCardContainer> 
        </div>
        )   
    }



}    
export default Visual;
