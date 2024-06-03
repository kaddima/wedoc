import React, { Children } from 'react'

interface templateProps{
    children:React.ReactNode;
}

const Template:React.FC<templateProps> = ({children}) => {
  return (
    <div className='border h-screen p-6 flex justify-center'>
        {children}
    </div>
  )
}

export default Template