import React, { createContext, useState }  from "react";
import { Bar,Line } from "react-chartjs-2";
import 'chartjs-adapter-date-fns';

// import Chart from 'chart.js/auto';
// import { CategoryScale, LinearScale, BarController, BarElement } from 'chart.js';
import { Speedmeter } from "./Speedmeter";
import { Speedy } from "./Speedy.jsx";
import myData from "../MyData.jsx";


export var textConfig = {
  fontFamily : 'System',
  fontSize : 20,
  fontStyle : 'normal',
  fontColor : 'black',

  hdrVisible : true,
  hdrFontFamily : 'System',
  hdrFontSize : 20,
  hdrFontStyle : 'normal',
  hdrFontColor : 'gray'
}


export class IoTText extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    let opt = {...textConfig,...this.props.options};
    let v = this.props.values;
    let width_td = 100/v.length;

    let hdrs =!opt.hdrVisible?undefined:opt.labels.map((lb,idx)=>
      <th key={idx} style={{
        color: opt?.hdrFontColor?opt.hdrFontColor:opt.colors[idx],
        width:`${width_td}%`,
        textAlign:"center",
        fontSize:`${opt.hdrFontSize}px`, 
        fontStyle: opt.hdrFontStyle,
        fontFamily: opt.hdrFontFamily
      }}>
        {lb}
      </th>
      )


    let values = v.map((v,idx)=>
      <td key={idx} style={{
        color:opt?.fontColor?opt.fontColor:opt.colors[idx],
        width:`${width_td}%`,
        textAlign:"center",
        fontSize:`${opt.fontSize}px`, 
        fontStyle: opt.fontStyle,
        fontFamily: opt.fontFamily
      }}>
        {v}
      </td>
      )

    return (
          <table className="iot_control iot_text" width="100%"> 
          
            <thead>
              <tr>
                {hdrs}
              </tr>
            </thead>
            <tbody>
              <tr>
                {values}
              </tr>
            </tbody>
          
          </table>  
     
      )
  }
  }
  


export class IoTSpeedy extends React.Component {
constructor(props) {
            super(props);
}
render() {
    return (
        <div className=" border-red-500 h-full"> 
        <Speedy needleValue={this.props.value} title={this.props.title}  max={150} min={-150}
        options={{

        }}/>
        </div>  
    
    )
}
}
    
export class IoTSpeedy2 extends React.Component {
  constructor(props) {
              super(props);
  }
  render() {
    let visual = this.props.vsl;
    let t = visual.topics[0];
      return (
          <div className=" border-red-500 h-full"> 
          <Speedmeter needleValue={this.props.value}  title={this.props.title} 
          options={{
            parkValue: -150,
            min: visual.min,
            max: visual.max,
            scaleBrWidth: 0,
            gridDisplay: false,
            scaleFontSize: 20,
            textFontColor: undefined,
            areaBrWidth: 0,
            valueBrWidth: 0,
            needleColor: "white",
            needleEyeColor: "black",
            needleWidth: "3%",
            needleBrColor: "white",
            textFontFamily: "Poppins",
            textFontStyle: 400,
            scaleFontFamily: "Poppins",
            scaleFontStyle: "normal",
            areas:[visual.greenZone,visual.orangeZone,visual.redZone,visual.purpleZone],
            labelPadTop: 8,
            labelPadBottom: 0,
            labelColor: t?.color,
            labelFontFamily: "Poppins",
            labelFontStyle: 400,
            labelFontSize: 16,
      
            label: `${t?.topicname}(${t?.brokername})`

          }}/>
          </div>  
      
      )
  }
  }

export class IoTBar extends React.Component {

    
constructor(props) {
    super(props);
    
};

render () {

//    if (this.props.topicname=='pes') {
//        console.log('BAR0.render :'+this.props.topicvalue )
//    };

//this.props.value.map(v=>parseFloat(v)

let data = {
    labels: [this.props.title],
/*
    datasets: [
      {
        label: "Sales",
        data: [] ,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        barThickness: 20
      },
      {
        label: "Sales",
        data: [30] ,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        barThickness: 20
      },
    ],
*/    
  };

 
// v=this.props.value.slice(0,25)}            // ak je najnovšia hodnota na začiatku

let v=this.props.value?.slice(-34);          // ak je najnov3ia hodnota na konci

//const v=this.props.value;
if (v==undefined) v=[];

data.datasets = v.map(v=>
  ({ label: 'LABEL',
     data: [v],
     backgroundColor: "rgba(255, 99, 132, 0.2)",
     borderColor: "rgba(255, 99, 132, 1)",
     borderWidth: 1,
     barThickness: 15
  })
);   

let options = {
    responsive: true,
    animation:false,
    maintainAspectRatio: false,
   // aspectRatio: 1.5,
    scales: {
        y: {
          beginAtZero: true,
          // max: 100,
          ticks: {
            color: 'white',
            display: true
        }
        },

        x: {
         // beginAtZero: false,
          // max: 100,
          ticks: {
           
            display: false,
          },
       
        },
        
      },
    plugins: {
      legend: {
        position: 'none',           // top | right
      },
      title: {
        display: false,
        text: 'Názov grafu',
      },
    },
  } 

  // data.labels[0] = this.props.title;
  // data.datasets[0].data = this.props.value.map(v=>parseFloat(v));

  // console.log('bardata:',data.datasets[0].data);

    return (
    <div className="h-full"> 
       <Bar options={options} data={data}/>
    </div>  
)
}

}


export class IoTLine extends React.Component {

    
  constructor(props) {
      super(props);
  
  };
  
  render () {
  
  let data = this.props.data;
 // if (data.labels==undefined) data.labels = data.datasets[0].data;
 // return <Line data={chartData} options={{ scales: { x: { type: 'linear', time: { min: minX, max: maxX } } } }} />;

  let options = {
      responsive: true,
      animation: false,
      maintainAspectRatio: false,
      
      //aspectRatio: 1.5,
      scales: {
        
        x: {type:this.props.type, time:{min:this.props.min,max:this.props.max}, display:false},

        y: {
          beginAtZero: true,
          display: true,
          title: {
              display: false,
              text: 'Y Axis',
          },
          ticks: {
              color: 'white',
              display: true
          }
          
        }
      } 
    
      /*
      scales: {
          y: {
            beginAtZero: true,
            // max: 100,
            ticks: {
              display: true
            }
          },
          
        },
        
      plugins: {
        legend: {
          position: 'none',           // top | right
        },
        title: {
          display: false,
          text: 'Názov grafu',
        },
      },*/
    }   
  
      return (
      
         <Line options={options} data={data}/>
     
  )
  }
  
  }
  


// Chart.register(CategoryScale, LinearScale, BarController, BarElement);
