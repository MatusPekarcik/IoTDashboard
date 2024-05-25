import React, { Component } from 'react';

export var speedConfig = {
  min : 0,
  max : 100,
  parkValue : 0,

  circumference : 270,

  needleShift : 0.414,                          // koeficient pre posun oka ihly
                                                // závisí od circumference + ďalšie veci, ale ťažko vypočítať. 
                                                // je nutné nastaviť experimentálne
                                                // 0 - oko ihly je úplne dolu, 1 - úplne hore
  needleRadius: undefined,                      // 1 plná dlžka, 0 žiadna - ak jde undefined, vyráta sa, aby bola po mriežku                          

  needleWidth : '7%',
  needleColor : 'black',
  needleEyeColor : 'white',
  needleBrColor : 'lightgray',
  needleBrWidth : 3,

  textDisplay: true,
  textDP:2,                              // počet des.miest pre hodnotu pod ihlou, 
                                         // undefined: neupravuje sa počet des.miest, zobrazí sa hodnota "ako prišla" 
  textFontFamily:  'System',             // písmo a farba pre hodnotu pod ihlou
  textFontSize: 30,
  textFontStyle: 'bold',
  textFontColor: 'blue',
  textShift: 0.6,                        // 0: úplne dolu, 1: o riadok vyššie 

  areas: [40,30,20,10],
  areaBgColors: ["lightgreen", "#FFCE56", "red","purple","blue",'yellow','cyan'],

  scaleCount: 11,
  scaleDP: 0,                    // počet des.miest pre hodnoty po obvode
  scaleFontFamily : 'System',    // písmo a farba
  scaleFontSize:  15,
  scaleFontStyle: 'normal',
  scaleFontColor: 'gray',
  scaleBgColor: 'rgba(255, 0, 0, 0)',

  areaDisplay:   true,
  scaleDisplay:  true,
  gridDisplay:   true,
  valueDisplay:  true,
  
  areaBrWidth:   1,
  valueBrWidth:  1,
  gridBrWidth:   1,
  scaleBrWidth:  0,
  areaBrColor:   'black',
  valueBrColor:  'black',
  gridBrColor:   'black',
  scaleBrColor:  'black',
  
  gridColor1   : 'black',
  gridColor2   : 'white',
  valueColor   : undefined,                       // undefined: berie sa farba z areaColors
  valueBgColor : 'rgba(255, 0, 0, 0)',

  scaleThick:   25,                                // pomery medzi hrúbkami medzikruží
  gridThick:    5,
  valueThick:   25,
  areaThick:    10,
  cutoutThick:  50,

  labelDisplay: true,
  labelFontFamily: 'System',
  labelFontSize: 24,
  labelFontStyle: 'normal',
  labelColor: 'blue',
  labelPadTop: 5,
  labelPadBottom: 10
  
}

const getPercentFrom = (val,base) => {
      
  if (isNaN(val)) { 
    let i=val.indexOf('%'); 
    if (i>0) { 
      let v = val.substring(0,i);
      return base*v/100;
    };
  };
  return val;
}

function arc2(ctx,x,y,r1,r2,a1,a2,w,colStroke,colFill) {
  ctx.beginPath();
  
  ctx.arc(x,y,r1,a1,a2);
  ctx.lineTo(x+r2* Math.cos(a2), y+r2*Math.sin(a2));
  ctx.arc(x,y,r2,a2,a1,true);

  ctx.closePath();

  ctx.fillStyle = colFill;
  ctx.fill();

  if (w>0) {
    ctx.lineWidth = w;
    ctx.strokeStyle = colStroke?colStroke:'black';
    ctx.stroke();
  }
}

export class Speedmeter extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();

  }

  componentDidMount() {
    this.draw(); 
  }

  componentDidUpdate() {
    this.draw(); 
  }

  draw() {
    let opt = {...speedConfig, ...this.props.options};
    
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');

    let cw = canvas.clientWidth;  //let cw = chart.chartArea.right - chart.chartArea.left+1;
    let ch = canvas.clientHeight; //let ch = chart.chartArea.bottom - chart.chartArea.top+1;
    canvas.width = cw, canvas.height=ch;

    ctx.clearRect(0, 0, cw, ch);
    ctx.imageSmoothingEnabled =true;

    let cTop = 0;
    if (opt.labelDisplay) {
      cTop = opt.labelFontSize + opt.labelPadBottom + opt.labelPadTop;

      ctx.font = `${opt.labelFontStyle} ${opt.labelFontSize}px ${opt.labelFontFamily}`;
      ctx.fillStyle = opt.labelColor; 
      ctx.fillText(opt.label, Math.floor((cw-  ctx.measureText(opt.label).width)/2), opt.labelFontSize+opt.labelPadTop); 
    }  
    
    ch = ch-cTop;
   /*
    ctx.font = `8px Arial`;
    ctx.fillStyle = 'black';     
   
    ctx.fillText(`${cw}x${ch}`,0,8);
    
    ctx.strokeStyle = "red"; // rámček okolo celej chartArea
    ctx.lineWidth = 1;
    ctx.strokeRect(0, cTop, cw, ch);
  */  
////////////////////////////////////////
    
    if (!opt.rotation) opt.rotation = opt.circumference/2+90;

    let
    val = this.props.needleValue,
    min = this.props.min,
    max = this.props.max;

    if (isNaN(min)) min = opt.min;
    if (isNaN(max)) max = opt.max;

    if (isNaN(val)) val = opt.parkValue!=undefined?opt.parkValue:min;
    else if (val<min) val = min
    else if (val>max) val = max; 

    let nv  = (val-min)/(max-min),

    cc = 2*Math.PI*opt.circumference/360, 
    rot  = -opt.rotation*2*Math.PI/360;

    let k=1+Math.sqrt(Math.sin(cc/2));

    let dx = 0, dy = 0;
    if (ch>cw/k) dy = (ch-cw/k)/2;
    if (cw>k*ch) dx = (cw-k*ch)/2;

    let
    cx = cw/2,
    cy = cTop + ch - dy - opt.needleShift * ch,

    r = (ch - 2*dy)*(1-opt.needleShift);
    
    // určenie farby oblasti
    let v = opt.areas.reduce((a,b)=>a+b,0)*(val-min)/(max-min);
    let i = 0;
    while (i<opt.areas.length-1) {
       v = v-opt.areas[i]; if (v<0) break;
       i++;
     };
    let valColor = opt.areaBgColors[i%opt.areaBgColors.length];

    // hodnota
    v = this.props.needleValue;
    if (opt.textDisplay && v!=undefined) {

    if (opt.textDP!=undefined) {
      if (!isNaN(v)) v = Number(v).toFixed(opt.textDP);
    }
    
    ctx.font = `${opt.textFontStyle} ${opt.textFontSize}px '${opt.textFontFamily}'`;
    ctx.fillStyle = opt.textFontColor||valColor;     
    ctx.fillText(v, Math.floor(cx-ctx.measureText(v).width/2), Math.floor(cTop+ ch - opt.textShift*opt.textFontSize));
    }

    // cifernik
    ctx.drawArea = function(data,radius,k1,k2,bgColors,borderWidth,borderColors) {
              
      let i=0; let x=0; let a1=rot;
      let ttl = data.reduce((a,b) => a+b, 0);

      if (!(borderColors instanceof Array)) borderColors = [borderColors]; 
      
      while (i<data.length) {
        x = x + data[i];
        let a2 = cc*x/ttl+rot;

        arc2(ctx,cx,cy,k1*radius,k2*radius,a1,a2, borderWidth,borderColors[i%borderColors.length],bgColors[i%bgColors.length])
          
        a1=a2; i++;
      }  
    };

    let ttl = opt.scaleThick+opt.gridThick+opt.valueThick+opt.areaThick+opt.cutoutThick;
    let r1=ttl, r2;
    if (opt.scaleCount>0) {
      if (opt.scaleDisplay && opt.scaleThick>0) {
        r2=r1-1; r1=r2-opt.scaleThick;
        ctx.drawArea([1],r,r1/ttl,r2/ttl,[opt.scaleBgColor],opt.scaleBrWidth,opt.scaleBrColor);

        ctx.font = `${opt.scaleFontStyle} ${opt.scaleFontSize}px '${opt.scaleFontFamily}'`;
        ctx.fillStyle = opt.scaleFontColor;         
      
        let i=0;
        while (i<=opt.scaleCount) {
          let
              angle =  i*cc/opt.scaleCount + rot,
              v = (min + i*(max-min)/opt.scaleCount).toFixed(opt.scaleDP),
              // rc = r*(r1+r2)/2/ttl,
              rc = r*(r1 + 0.6*(r2-r1))/ttl,
              x = Math.floor(cx + rc*Math.cos(angle) - ctx.measureText(v).width/2),    
              y = Math.floor(cy + rc*Math.sin(angle) + 0.4*opt.scaleFontSize);
          ctx.fillText(v,x,y);
          i++;
        }
        
      }
      
      if (opt.gridDisplay && opt.gridThick>0) {
        r2=r1-1; r1=r2-opt.gridThick;
        let gr=[], i=0;
        while (i<opt.scaleCount) { gr.push(1); i++};
        ctx.drawArea(gr,r,r1/ttl,r2/ttl,[opt.gridColor1,opt.gridColor2],opt.gridBrWidth,opt.gridBrColor);
      }
    }
    
    if (opt.valueDisplay && opt.valueThick>0 ) {
      r2=r1-1; r1=r2-opt.valueThick;
      ctx.drawArea([val-min,max-val],r,r1/ttl,r2/ttl,[ opt.valueColor||valColor ,opt.valueBgColor],opt.valueBrWidth,opt.valueBrColor);
    }
    if (opt.areaDisplay && opt.areaThick>0) {
      r2=r1-1; r1=r2-opt.areaThick;
      ctx.drawArea(opt.areas,r,r1/ttl,r2/ttl,opt.areaBgColors,opt.areaBrWidth,opt.areaBrColor);
    }

    // needle
    let 
    nw = getPercentFrom(opt.needleWidth,r),
    angle =  nv * cc + rot,
    nc  = opt.needleColor,
    nec = opt.needleEyeColor;

    ctx.translate(cx, cy);
    ctx.rotate(angle);

    if (opt.needleRadius==undefined){ 
      opt.needleRadius = opt.areaThick+opt.scaleThick+opt.gridThick+opt.valueThick+opt.cutoutThick;
      opt.needleRadius = (opt.needleRadius-opt.scaleThick-1)/opt.needleRadius;
    }
    ctx.beginPath();
    ctx.moveTo(0, - nw);
    ctx.lineTo( r*opt.needleRadius, 0);
    ctx.lineTo(0, nw);
    ctx.arc(0,0,nw,0.5*Math.PI,1.5*Math.PI);
    ctx.fillStyle = nc;
    if (opt.needleBrWidth>0) {
      ctx.strokeStyle = opt.needleBrColor;
      ctx.stroke()
    }

    ctx.fill();
    ctx.rotate(-angle);
    ctx.translate(-cx, -cy);

    // needle eye
    ctx.beginPath();
    ctx.arc(cx, cy, nw/2, 0, Math.PI * 2);
    if (opt.needleBrWidth>0) {
      ctx.strokeStyle = opt.needleBrColor;
      ctx.stroke()
    }
    ctx.fillStyle = nec;
    ctx.fill();

  }
   
  render() {
  return (
    <canvas ref={this.canvasRef} style={{width:'100%',height:'100%'}}/> 
  )}
}

export default Speedmeter;
