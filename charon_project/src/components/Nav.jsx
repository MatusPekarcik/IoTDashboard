import React from 'react';
import { menu, close_icon} from '../assets';
import { navLinks } from '../constants'; 

import LoginForm from './CF_handle/LoginForm';
import SignUpForm from './CF_handle/SignUpForm';



class Nav extends React.Component{
  
   constructor(props){
      super(props);
      this.state = {
         tglVisibility: false,
         lgnVisibility: false,
         sgnVisibility: false,
         isHoveredIdx: false,
      };
      
   }
   
  
  
  
  
   toggleVisibility = (obj,idx,enb) => {
      switch(obj){
         
         case "tgl" :{
            this.setState({tglVisibility: !this.state.tglVisibility});
            break;
         }
            
         case "lgn" :{
            this.setState({lgnVisibility: !this.state.lgnVisibility});
            this.setState({tglVisibility: false})
            break;
         }
             
         case "sgn" :{
            this.setState({sgnVisibility: !this.state.sgnVisibility}); 
            this.setState({tglVisibility: false})
            break;
         }
         case "btn" :{
            this.setState({isHoveredIdx: enb ? idx : 0});
            
            break;
          }
         
      }
   }
   
   my_map = (nav, index, mobile) =>{
      var f = undefined; 
      switch(nav.id){
         case "login" :{
            f = this.toggleVisibility.bind(this,"lgn");
            break;
         }
            
         case "sign_up" :{
            f = this.toggleVisibility.bind(this,"sgn");
            break;
         }
      }
      
      var m = mobile ? (index === navLinks.length-1 ? 'mr-0' : 'mb-4') : (index === navLinks.length-1 ? 'mr-0' : 'mr-5');

      return(
      <li
      key={nav.id}
      onClick={f}
      onMouseEnter={this.toggleVisibility.bind(this,"btn",nav.id,true)}
      onMouseLeave={this.toggleVisibility.bind(this,"btn",nav.id,false)}
      className={`
      py-1
      px-2
      ${this.state.isHoveredIdx == nav.id ? "phthalo-green"  : "" }
      font-poppins 
      font-normal
      text-white 
      cursor-pointer
      text-[16px]
      rounded-md
      
      ${m}
      
      `}
      //${this.state.isHovered ? "phthalo-green"  : "" }
      >
       
         {nav.title}
            

      </li>
   )


   }


   render(){ 
   return (
     <>
     
   <nav className="relative w-full flex py-3 justify-between items-center fadein">
      
      {/*ul stands for unordered list */}
      <ul className={`list-none sm:flex hidden justify-end items-center flex-1 `}>
         
         {navLinks.map((nav, index) => 
         
            this.my_map(nav, index, false)
         
         )}
      
      </ul> 
      

     {/*Mobile*/}
     
     
     <div className="sm:hidden flex flex-1 justify-end items-center">
            <img 
            src={menu}
            alt='menu'
            className="w-[28px] h-[82px] object-contain"
            onClick={this.toggleVisibility.bind(this,"tgl")} 
            />
            {this.state.tglVisibility && (
            <div onClick={this.toggleVisibility.bind(this,"tgl")}  className="overlay z-50"></div> 
            )}
            <div className={`${this.state.tglVisibility ? 'flex' : 'hidden'} 
             opacity-0 z-[60]  absolute top-20 right-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar  `}
            >
               <ul className="list-none flex flex-col justify-end items-center flex-1">
                     
               {navLinks.map((nav, index) => 
         
                  this.my_map(nav, index, true)
      
               )}
                  </ul> 

            </div>
            
            
     
     
     
      </div>
     
   </nav>

         {this.state.lgnVisibility && ( 
            <div className="modal z-50">
                
                <div onClick={this.toggleVisibility.bind(this,"lgn")} className="overlay"></div> 
                <div className="modal-content fadeinmodal mt-14 ">
                    
                  <LoginForm/>
                    
                  <button onClick={this.toggleVisibility.bind(this,"lgn")} className="close-modal slideAnimation mr-5 ">
                    <img src={close_icon} alt="close_icon" className=' '/>                   
                  </button>

                </div>
                
            </div>    
         )}

         {this.state.sgnVisibility && ( 
            <div className="modal z-50">
                
                <div onClick={this.toggleVisibility.bind(this,"sgn")} className="overlay"></div> 
                <div className="modal-content fadeinmodal mt-14 ">
                    
                  <SignUpForm/>
                    
                  <button onClick={this.toggleVisibility.bind(this,"sgn")} className="close-modal slideAnimation mr-5 ">
                    <img src={close_icon} alt="close_icon" className=' '/>                   
                  </button>

                </div>
                
            </div>    
         )} 



     </>
   )
   }
}
export default Nav