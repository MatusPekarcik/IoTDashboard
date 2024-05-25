import React, { Component } from "react";

import Chart from 'chart.js/auto';
import { Doughnut } from "react-chartjs-2";


// import Data from "./Data.json";

const getPercentFrom = (val,base) => {
      
  if (isNaN(val)) { 
    let i=val.indexOf('%'); 
    if (i>0) { 
      let v = val.substring(0,i);
      return  base*v/100;
    };
  };
  return val;
}

export class Speedy extends Component {

  componentDidMount() {

    Chart.register({
      id: 'id_speedy',
      afterDraw: (chart) => {

        if (chart.config.type!='doughnut') return;

        let nv = chart.config.data.datasets[0].needleValue;
        if (isNaN(nv)) {
          if (nv) { } else return; 
        }    
        else {
          if (nv<0) return;
        };

        // vykreslenie ihly 

        
        let nw = chart.config.data.datasets[0].needleWidth;      
        let nc = chart.config.data.datasets[0].needleColor;
        let nec = chart.config.data.datasets[0].needleEyeColor;

        let dataTotal = chart.config.data.datasets[0].data.reduce(
          (a, b) => a + b,
          0
        );


        nv = getPercentFrom(nv, dataTotal);
        if(isNaN(nv)) nv=0;


        let angle = Math.PI + (1 / dataTotal) * nv * Math.PI;
        let ctx = chart.ctx;
        
        let cw = chart.chartArea.right - chart.chartArea.left;
        let ch = chart.chartArea.bottom - chart.chartArea.top;
        
        var dx =0, dy=0;
        if (ch>cw/2) dy = (ch-cw/2)/2;
        if (cw>2*ch) dx = (cw-2*ch)/2;
        
        let cx = chart.chartArea.left + cw/2;
        let cy = chart.chartArea.bottom - dy;

        let r = ch - 2*dy;
        
        nw = getPercentFrom(nw,r);
        
        
       
/*
        // testovacie rámčeky

        ctx.strokeStyle = "red"; // rámček okolo celej chartArea
        ctx.lineWidth = 2;
        var w = chart.chartArea.right - chart.chartArea.left;
        var h = chart.chartArea.bottom - chart.chartArea.top;
        ctx.strokeRect(chart.chartArea.left, chart.chartArea.top, w, h);

        ctx.strokeStyle = "gray";  // rámček len okolo polkruhu
        ctx.lineWidth = 2;
        var w = chart.chartArea.right - chart.chartArea.left;
        var h = chart.chartArea.bottom - chart.chartArea.top;
        ctx.strokeRect(chart.chartArea.left+dx, chart.chartArea.top+ dy, w-2*dx, h-2*dy);
*/

        ctx.translate(cx, cy);
        ctx.rotate(angle);

        // needle
        ctx.beginPath();
        ctx.moveTo(0, - nw);
        ctx.lineTo(r, 0);
        ctx.lineTo(0, nw);
        ctx.fillStyle = nc;
        ctx.fill();
        ctx.rotate(-angle);
        
        ctx.translate(-cx, -cy);
       
        // needle eye
        ctx.beginPath();
        ctx.arc(cx, cy, nw, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, nw/2, 0, Math.PI * 2);
        ctx.fillStyle = nec;
        ctx.fill();
        
      }
    }); 
  }


  render() {

    let data = {
      labels: ["Green", "Yellow", "Red"],
      datasets: [
        {
          data: [33.33, 33.33, 33.33],
          needleValue: 0,
          backgroundColor: ["lightgreen", "#FFCE56", "red"],
          hoverBackgroundColor: ["lightgreen", "#FFCE56", "red"],

          needleValue: 0,
          needleWidth: "2%",                                       
          needleColor: "white",
          needleEyeColor: "black"
        }
      ],
    };
    let options = {
        responsive: true,
        maintainAspectRatio: false,
        //aspectRatio: 1.5,
   
        layout: {
          padding: {
          bottom: 3
          }
        },
        plugins: {
          legend: {
            position: 'left',           //'bottom', 
            display: false              // zobrazenie legendy ->  data.labels
          },
          title: {
            display: false,
            text: 'Názov grafu',
          },
          tooltip: {
            enabled: false              // otravný hint
          },
        },
        rotation: -90,                  // Math.PI, -135
        circumference:  180,            // Math.PI,  270
        cutout: '80%',                  // % vnutornej vyrezanej kru6nice ]
    
    };
    
    // console.log('Speedy: '+nv+':'+isNaN(nv));
    data.datasets[0].needleValue = this.props.needleValue;; 
    options.plugins.title.text = this.props.title;; 
    
    return (
        <Doughnut data={data} options={options} />
    );
  };
} 

