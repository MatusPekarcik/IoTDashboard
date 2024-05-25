import React from 'react'


const Info = () => {
  return (
    <section className={`flex flex-col  border-red-700 fadein `}>  
      
      <div className="infoMargin">  
        <span className="text-black font-poppins font-normal sm:text-[24px] text-[16px]">
          Patch notes:
        </span>
        <span className="text-black font-poppins font-normal sm:text-[16px] text-[12px]">
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
          Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        </span>
      </div>
  
  </section>
  )
}

export default Info