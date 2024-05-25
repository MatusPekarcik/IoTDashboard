import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./cn";
import Visual from "../Visual/Visual";
import myData from "../MyData";
import "./card-hover.css";
import {bckgrnd_mirr, Visual_tile_add, bckgrnd_tile } from '../../assets';


export const HoverEffect = ({ items, className }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div
      className={cn(
        " w-full h-full grid md:grid-cols-3 grid-cols-1 mt-3 ",
        className
      )}
    >
      {myData.visuals.map((structure, index) => (
        <a
          key={structure.index}
          className="relative group  border-red-500 "
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === index && (
              <motion.span
                className="absolute inset-0 myCardHovrBg myH border-green-500 h-full rounded-md z-[0]"
                layoutId="hoverBackground"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1, transition: { duration: 1 } }}
                exit={{ opacity: 1, transition: { duration: 1, delay: 1 } }}
              />
            )}
          </AnimatePresence>
          <Visual index={index} structure={structure}/> 
        </a>
      ))}
      <div onClick={()=>{ const Command = new CustomEvent('Command', {
                          detail: { type:"visualFormVis", index:-1 } // Optional data to pass with the event
                          });
                          window.dispatchEvent(Command); 
                        }} 
      className="bg-black z-[298] myHeighy rounded-md myBorder flex items-center justify-center mt-5 mr-3 ml-3 cursor-pointer"
      style={{ backgroundImage: `url(${bckgrnd_mirr})` }}> 
        <img src={Visual_tile_add } className="" alt="Visual_tile_add" />
      </div>
    </div>
  );
};

