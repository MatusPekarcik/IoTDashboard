import React from 'react';
import * as utils from "../utils.jsx"
import { myData } from '../../components';
import { PlusSquare, Cog, Trash2, Download, AlertCircle, Upload} from "lucide-react";
import { phthaloGreenToolTip,phthaloGreen } from '../MyConst'
import {Tooltip,Popconfirm} from 'antd';



class DashboardList extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            dashboardList: myData.dashboards,
            dashboardListVis: true,
            isHoveredIdx: -1,
            isHoveredAdd: false,


        
        };  
    }



    toggleVisibility = (obj,index, enb) => {
      switch(obj){
        case "dashboardFormVis" :{
          const Command = new CustomEvent('Command', {
            detail: { type:"dashboardFormVis", index:index } // Optional data to pass with the event
          });
          window.dispatchEvent(Command);
          break;
        }

        case "bracket" :{
          this.setState({isHoveredIdx: enb ? index : -1});
          break;
        }

        case "add" :{
            this.setState({isHoveredAdd: enb});
            break;
          }
      }
    } 
   
    onDelete = (index) => {
      const dashid = myData.dashboards[index].dashid;
      utils.notifyError(async ()=>{
        await myData.delDashboard(dashid);
        this.setState({dashboardList: myData.dashboards},()=>{});
      })

      this.forceUpdate();
    }

    
    
    render(){
        return(
        <>    
          
          {this.state.dashboardListVis && (
            <div className="flex-1 flex-col  text-white center-container relative slideAnimation ">
            
              <h1 className=" main_label text-[32px] pb-5 ">
                Your Dashboards
              </h1>

              
            
              {this.state.dashboardList.map((structure, index) => (
                <div className={`flex justify-between items-center BrokerBracket mt-3 cursor-pointer ${this.state.isHoveredIdx == index ? "phthalo-green"  : "" }`} key={index} 
                onMouseEnter={this.toggleVisibility.bind(this,"bracket",index,true)}
                onMouseLeave={this.toggleVisibility.bind(this,"bracket",index,false)}>
                  <Tooltip placement="left" color={phthaloGreen} title={structure.dashdesc}>  
                    <div className='flex flex-row items-center justify-between ml-1'>
                    <p className='pl-2 text-white'>{structure.dashname}</p></div>  
                  </Tooltip> 
                  <div className='flex flex-row'>
                    
                    <Tooltip placement="topRight" color={phthaloGreen} title="Edit dashboard">  
                      <div onClick={this.toggleVisibility.bind(this,"dashboardFormVis", index)} className='mr-1 cursor-pointer'>{<Cog size={24} />}</div>
                    </Tooltip>                
                    <Popconfirm
                    title={<span className="customPopconfTtl">Delete the dashboard</span>}
                    description={<span className="customPopconfDsc">Are you sure to delete this dashboard?</span>}
                    placement="right"
                    icon={<AlertCircle color="#ff0000" size={24} className='pr-1'/>}
                    okText={<span className="customPopconfDsc">Yes</span>}
                    cancelText={<span className="customPopconfDsc">No</span>}
                    okButtonProps={{ style: { background: 'green' } }}
                    cancelButtonProps={{ className: "cancelButtonProps" }}
                    onConfirm={this.onDelete.bind(this, index)}
                    >
                    <Tooltip placement="topRight" color={phthaloGreen} title="Delete dashboard">
                      <div className='mr-1 cursor-pointer '>{<Trash2 size={24} />}</div>
                    </Tooltip>
                    </Popconfirm>
                  </div>
                  
                </div>
              ))} 
              {(this.props.has_acc || this.state.dashboardList.length == undefined) && (
                <div className={`flex flex-row justify-center items-center BrokerBracket mt-3 cursor-pointer ${this.state.isHoveredAdd ? "phthalo-green"  : "" }`}
                 onMouseEnter={this.toggleVisibility.bind(this,"add",-1,true)}
                 onMouseLeave={this.toggleVisibility.bind(this,"add",-1,false)}>
                    
                        <>
                          <Tooltip color={phthaloGreen} title="Add dashboard">
                            <div className=' text-white  cursor-pointer ml-2 ' onClick={this.toggleVisibility.bind(this,"dashboardFormVis",-1)}>  {<PlusSquare size={24} />}</div> 
                          </Tooltip>
                          
                        </>
                     

                </div>   
              )}
            </div>  
          )} 
            
            
            
              
               

         
            
        </>
        )
    }
}

export default DashboardList;