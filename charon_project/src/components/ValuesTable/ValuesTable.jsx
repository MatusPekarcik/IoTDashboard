import React from "react";
import myData from "../MyData";
import { format } from 'date-fns';


class ValuesTable extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            


        
        };  
    }
    render(){
        let maxRows = 0;
        let visual = myData.getVisual(this.props.idx);
        
        {visual.topics.map(t => {
            let len = myData.getValue(visual.name,t.brokername,t.topicname).length;
            if(len > maxRows) maxRows = len;
        })}
        let rows = [];
        
        for (var i=0; i<maxRows; i++){
            rows.push(
                <tr key={i}>
                    
                    {visual.topics.map(t => (
                        myData.getValueT(visual.name,t.brokername,t.topicname,i))).map((v,ii) => (
                            <>
                            <td key={ii} className="text-white pl-3">
                                
                                    
                                        
                                        {v?.x ? format(v.x,"dd.MM.yyyy HH:mm:ss.SSS"): "" }
                                       
                                    
                             </td><td  style={{color: visual.topics[ii].color, textAlign:"right",paddingLeft:"12px"}}>  
                                    
                                        {v?.y}
                                        
                                    
                                
                            </td>
                            </>
                    ))}
                   
                </tr>
            )
        }       
        return(
            <>
                <table  className=" ">
                    
                    <thead>
                        <tr>
                            {visual.topics.map((t,index) => (
                                <>
                                <th className="text-white  " key={index}>
                                    {t.topicname}
                                </th>
                                <th></th>
                                </>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>

                </table>            
            
            </>
        )


        
    }
}    
export default ValuesTable;