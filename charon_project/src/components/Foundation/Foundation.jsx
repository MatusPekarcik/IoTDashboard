import React from "react";
import "./Foundation.css";
import * as utils from "../utils.jsx"
import { myData, VisualForm, ConnectForm, BrokerList, DashboardList, DashboardForm, ValuesTable } from '../../components';
import { bckgrnd_mirr, Visual_tile_add, bckgrnd_tile, bckgrnd_title } from '../../assets';
import App_sidebar, { SidebarItem } from "../App_sidebar/App_sidebar";
import { LayoutDashboard, Cog, Cast, CircleUser, Power, Upload ,PowerOff, Download, Box } from "lucide-react";
import { notification, Tooltip } from 'antd';
import { phthaloGreenToolTip,phthaloGreen } from '../MyConst'
import { close_icon } from '../../assets';
import { HoverEffect } from "../HoverFx/card-hover-effect.jsx";






class Foundation extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            

            active: true, //ma byt false
            connected_to_net: false,
            currActiveDashboard: "Dasboaad1",
            brokerIdx: -1,
            visualIdx: -1,
            dashboardIdx: -1,
            dashOn: true,
            valuesTableIdx: -1,
            
            
            UserINF:{
                user_id: -1,
                has_acc: false,
            },
            Visibility:{
                brokerListVis: false,
                dashboardListVis: false,
                cnctFormVis: false,
                dashboardFormVis: false, 
                visualFormVis: false,
                valuesTable: false,
            }
            
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

          case "CnctEvent" :{
             //console.log("som vo found CnctEvent");
              this.handleFirstStep(event);
              break;
          }
          case "Logout" :{
            console.log("som vo found Logout");
            this.Logout();
            break;
          }
          case "cnctFormVis" :{
            this.setState({brokerIdx: event.detail.index});
            this.toggleVisibility("cnctFormVis");
            break;
          }
          case "brokerListVis" :{
            this.toggleVisibility("brokerListVis");
            break;
          }
          case "dashboardListVis" :{
            this.toggleVisibility("dashboardListVis");
            break;
          }
          case "dashboardFormVis" :{
            this.setState({dashboardIdx: event.detail.index});
            this.toggleVisibility("dashboardFormVis");
            break;
          }
          case "visualFormVis" :{
            this.setState({visualIdx: event.detail.index});
            this.toggleVisibility("visualFormVis");
            break;
          }
          case "valuesTable" :{
            this.setState({valuesTableIdx: event.detail.index});
            this.toggleVisibility("valuesTable");
            break;
          }
          case "refresh" :{
            this.forceUpdate();
            break;
          }
          case "notify" :{
            this.openNotificationWithIcon(data.notify,"Error",data.title);
            break;
          }
          case "mqtt_refresh" :{
            this.forceUpdate();
            break;
          }
        }
        
      };  


    toggleVisibility = async (obj,index) => {
            switch(obj){
            case "disconnect" :{
                this.setState({connected_to_net: !this.state.connected_to_net});
                break;
            }
            case "active" :{
                if(!this.state.active){
                    myData.dashboard.screen = "Foundation";
                    myData.store();
                }
                this.setState({active: !this.state.active});
                break;
            }
            case "brokerListVis" :{
                this.state.Visibility.brokerListVis = !this.state.Visibility.brokerListVis;
                this.state.Visibility.cnctFormVis = false;
                this.forceUpdate();
                break;
            }
            case "dashboardListVis" :{
                this.state.Visibility.dashboardListVis = !this.state.Visibility.dashboardListVis;
                this.state.Visibility.dashboardFormVis = false; 
                await utils.notifyError(async ()=>{
                    console.log(myData.dashboards);
                    ///adsdasdasda
                    await myData.getDashboards();
                    console.log(myData.dashboards);
                });
                console.log("dash: ", myData.dashboards);
                this.forceUpdate();
                break;
            }
            case "cnctFormVis" :{
                this.state.Visibility.brokerListVis = false;
                this.state.Visibility.cnctFormVis = !this.state.Visibility.cnctFormVis;
                this.forceUpdate();
                break;
            }
            case "dashboardFormVis" :{
                this.state.Visibility.dashboardListVis = false;
                this.state.Visibility.dashboardFormVis = !this.state.Visibility.dashboardFormVis;
                this.forceUpdate();
                break;
            }
            case "visualFormVis" :{
                this.state.Visibility.visualFormVis = !this.state.Visibility.visualFormVis;
                this.forceUpdate();
                break;
            } 
            case "valuesTable" :{
                this.state.Visibility.valuesTable = !this.state.Visibility.valuesTable;
                this.forceUpdate();
                break;
            } 
            case "dashOn" :{
                this.state.dashOn = !this.state.dashOn;
                this.forceUpdate();
                break;
            } 
             
        }
    }

    handleFirstStep = (event) => {
       // this.toggleVisibility("active");
        console.log("user_id:", event.detail.user_id);
        const id = event.detail?.user_id;
        if(id == undefined) return;
        if(id < 0 ){
            //zavolaj raz funkciu na pridanie brokera a pouzi data co prisli lebo usr nma acc
            this.toggleVisibility("cnctFormVis");

        }
        else{
            
            this.setState({UserINF: {...this.state.UserINF, has_acc: true}});
            myData.dashboard.userid = id;
            //NACITAT dash z databazy
        }
        


    }
    turnOff = () => {
        this.toggleVisibility("dashOn");
        console.log("DashOn",this.state.dashOn);
       
    }

    Logout = () => {
        this.toggleVisibility("active");
        //myData.setBrokers([]);
        myData.store();
        const Command = new CustomEvent('Command', {
            detail: { type:"Logout" } // Optional data to pass with the event
          });
          window.dispatchEvent(Command);
    }

    onExport = () => {
        utils.notifyError(()=>{
          myData.exportDashboard(myData.dashboard.dashname);
        })
        this.forceUpdate();
      }
  
      onImport = () => {
        utils.notifyError(()=>{
          myData.import();
        })
        this.forceUpdate();
      }

     
    
    render(){
        

        return(
        <>    
        {this.state.active && (
        <>
            {this.state.Visibility.valuesTable && ( 
                <div className="modal z-[301]">
                    <div onClick={this.toggleVisibility.bind(this,"valuesTable")} className="overlay"></div> 
                    <div className="modal-content-scroll fadeinmodal mt-28 overflow-auto hide-scrollbar tableWH">
               
                    <div className=" ">
                        <ValuesTable idx={this.state.valuesTableIdx}/>
                    </div>   
                       

               
                        <button onClick={this.toggleVisibility.bind(this,"valuesTable")} className="absolute close-modal slideAnimation mr-10 ">
                            <img src={close_icon} alt="close_icon" className=' '/>                   
                        </button>

                     </div>
                </div>    
            )}

            {this.state.Visibility.dashboardListVis && ( 
                <div className="modal z-[301]">
                    <div onClick={this.toggleVisibility.bind(this,"dashboardListVis")} className="overlay"></div> 
                    <div className="modal-content fadeinmodal mt-8 ">
               
                    <div className="mt-14">
                        <DashboardList has_acc={this.state.UserINF.has_acc}/>    
                    </div>   
                       

               
                        <button onClick={this.toggleVisibility.bind(this,"dashboardListVis")} className="close-modal slideAnimation mr-5 ">
                            <img src={close_icon} alt="close_icon" className=' '/>                   
                        </button>

                     </div>
                </div>    
            )}


            {this.state.Visibility.brokerListVis && ( 
                <div className="modal z-[301]">
                    <div onClick={this.toggleVisibility.bind(this,"brokerListVis")} className="overlay"></div> 
                    <div className="modal-content fadeinmodal mt-8 ">
               
                        <div className="mt-14">
                            <BrokerList has_acc={this.state.UserINF.has_acc}/>
                        </div>   
                       

               
                        <button onClick={this.toggleVisibility.bind(this,"brokerListVis")} className="close-modal slideAnimation mr-5 ">
                            <img src={close_icon} alt="close_icon" className=' '/>                   
                        </button>

                     </div>
                </div>    
            )}

            {this.state.Visibility.visualFormVis && ( 
                <div className="modal z-[301]">
                    <div onClick={this.toggleVisibility.bind(this,"visualFormVis")} className="overlay"></div> 
                    <div className="modal-content fadeinmodal mt-24 overflow-auto hide-scrollbar tableWH  border-red-500">
               
                        
                    <div className="mt-16 ">
                       <VisualForm idx={this.state.visualIdx}/>
                    </div>
               
                        <button onClick={this.toggleVisibility.bind(this,"visualFormVis")} className="close-modal slideAnimation mt-16 mr-28 ">
                            <img src={close_icon} alt="close_icon" className=' '/>                   
                        </button>

                     </div>
                </div>    
            )}


            {this.state.Visibility.cnctFormVis && (        
                <div className="modal z-[301]">
                    <div onClick={this.toggleVisibility.bind(this,"brokerListVis")} className="overlay"></div> 
                    <div className="modal-content fadeinmodal mt-14">

                        <div className="mt-24">
                            <ConnectForm idx={this.state.brokerIdx}/> 
                        </div>
                        
                        <button onClick={this.toggleVisibility.bind(this,"brokerListVis")} className="close-modal slideAnimation mr-5 mt-10">
                            <img src={close_icon} alt="close_icon" className=''/>                   
                        </button>

                    </div>
                </div>                   
            )}

            {this.state.Visibility.dashboardFormVis && (        
                <div className="modal z-[301]">
                    <div onClick={this.toggleVisibility.bind(this,"dashboardListVis")} className="overlay"></div> 
                    <div className="modal-content fadeinmodal mt-14 ">
        
                        <DashboardForm idx={this.state.dashboardIdx}/> 
        
                        <button onClick={this.toggleVisibility.bind(this,"dashboardListVis")} className="close-modal slideAnimation mr-5 ">
                            <img src={close_icon} alt="close_icon" className=''/>                   
                        </button>

                    </div>
                </div>                   
            )}
            
            {/*HLAVNE OKNO*/}
            <div className={` z-100 flex flex-row `}>
               


               
                <App_sidebar>
                    
                    <div  onClick={this.toggleVisibility.bind(this,"dashboardListVis")}><SidebarItem icon = {<LayoutDashboard size={24} />} text = "Dashboards"/></div>
                    <div  onClick={this.toggleVisibility.bind(this,"brokerListVis")}>   <SidebarItem icon = {<Cast size={24} />} text = "Brokers"/></div>
                    <div  onClick={this.onImport}>                                      <SidebarItem icon = {<Upload size={24} />} text = "Import"/></div>
                    <div  onClick={this.onExport}>                                      <SidebarItem icon = {<Download size={24} />} text = "Export"/></div>
                    <div  onClick={()=>{const Command = new CustomEvent('Command',{
                                        detail: { type:"3D" } // Optional data to pass with the event
                                        });
                                        window.dispatchEvent(Command);}}>                <SidebarItem icon = {<Box size={24} />} text = "3D"/></div>
                    {/* <div  onClick={ myData.clearSession}>                                                <SidebarItem icon = {<Cog size={24} />} text = "Options"/></div>*/}
                   {/* <div  onClick={this.Logout}>                                        <SidebarItem icon = {<Power size={24} />} text = "Logout"/></div>*/}
                   
            
                </App_sidebar>   
                
                <div className={`  flex flex-col w-full md:ml-20 ml-20 ${this.state.dashOn ? ""  : "" } ` }>
                    <div className=" h-11 w-full flex items-center mt-3  rounded-md">
                        <h1 className={`customText text-white  myBorder2  mr-3 ml-3 w-full flex items-center justify-center  rounded-md phthalo-green`} style={{ backgroundImage: `url(${bckgrnd_title})` }}>
                            {/*
                            <div className="mr-3 cursor-pointer" onClick={this.turnOff}>
                                {this.state.dashOn ? 
                                <>
                                <Tooltip placement="bottom" color={phthaloGreen} title="Turn on dashboard">  
                                    {<PowerOff size={24} color="white"/>}
                                </Tooltip>    
                                </>
                                :
                                <>
                                <Tooltip placement="bottom" color={phthaloGreen} title="Turn off dashboard">      
                                    {<Power size={24} color="white"/>}
                                </Tooltip>    
                                </>
                             }
                                
                                
                            </div>
                            */}
                            <a className="mr-3">{myData.dashboards[0]?.dashname}</a>  
                        </h1>
                    </div> 
                    {/*ZOZNAM VISUALOV JE VO VNUTRI !*/}
                    <HoverEffect items={""} />
                </div>  
             
             </div>

        </>
        )}  
        </>
        )
    }
}

export default Foundation;