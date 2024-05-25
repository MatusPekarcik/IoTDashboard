import React from 'react'
import styles from '../style';

const Line = () => {
  return (
    <div className={` relative ${styles.flexStart}`}> 
        <div className={`${styles.flexStart} ${styles.boxWidth}  relative border-2 line_color fadein txt_color`}/> 
    </div>
  )
}

export default Line