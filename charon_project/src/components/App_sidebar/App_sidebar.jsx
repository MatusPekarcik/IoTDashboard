import React from "react";
import "./App_sidebar.css"
import {bckgrnd_mirr} from '../../assets';
import { ChevronLast, ChevronFirst, UserCheck } from "lucide-react";
import { useContext, createContext, useState } from "react";
import {Charon_logo_clean} from '../../assets';

const SidebarContext = createContext()

  export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(false)
  //${expanded ? "sirkaExp " : "sirka"} 
  return (
    <aside className={` h-screen z-[300] `}>
      <nav className="fixed h-full inline-flex flex-col my_sidebar border-r border-white shadow-sm " style={{ backgroundImage: `url(${bckgrnd_mirr})` }}>
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src={Charon_logo_clean}
            className={`overflow-hidden transition-all  ${
              expanded ? "w-32" : "w-0"
            }`}
            alt="Charon_logo_clean"
          />
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg phthalo-green text-white "
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

        <div className="border-t border-white text-white flex p-3 phthalo-green">
         <UserCheck size={32} className="ml-2"/>
          <div
            className={`
              flex justify-between items-center
              overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
          `}
          >
            <div className="leading-4">
              
              <span className="myText  text-white font-poppins">Guest</span>
            </div>
            
          </div>
        </div>
      </nav>
    </aside>
  )
}

export function SidebarItem({ icon, text, active, alert }) {
  const { expanded } = useContext(SidebarContext)
  
  return (
    <li
      className={`
        relative flex items-center py-2 px-3 my-1
        rounded-md cursor-pointer
        transition-colors group
        ${
          active
            ? "phthalo-green text-white "                 
            : "hover:phthalo-green-100  text-white "  //hover:text-black
        }
    `}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all  ${
          expanded ? "w-52 ml-3" : "w-0 "
        }`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
            expanded ? "" : "top-2"
          }`}
        />
      )}

      {!expanded && (
        <div
          className={`
          absolute left-full rounded-md px-2 py-1 ml-6  
          ${
            active
              ? "phthalo-green  text-white"
              : "phthalo-green  text-white" 
          } 
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
      `}
        >
          {text}
        </div>
      )}
    </li>
  )
}
