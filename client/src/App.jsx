import React, { useState } from 'react';
import { assets } from './assets/assets';
import { Routes, Route, useLocation } from 'react-router-dom' // Added Route here
import Sidebar from './components/Sidebar'
import ChatBox from './components/ChatBox'
import Community from './pages/Community' // Ensure this path is correct
import Credits from './pages/Credits'    // Assuming you have a Credits page
import './assets/prism.css'
import Loading from './pages/Loading';
import Login from './pages/Login';
import { useAppContext } from './context/AppContext';

const App = () => {

  const{user} = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {pathname} = useLocation()

  if(pathname==='/loading') return <Loading/>


  return (
    <>

    {!isMenuOpen && <img src={assets.menu_icon} className='absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:hidden' onClick={()=>setIsMenuOpen(true)}/>}
    {user ? (
      <div className="dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white">
      
      <div className="flex h-screen w-screen">
        <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          <Routes>
            <Route path="/" element={<ChatBox />} /> 
            <Route path="/community" element={<Community />} />
            <Route path="/credits" element={<Credits />} />
          </Routes>
        
      </div>
    </div>
    ) : (

      <div className="bg-gradient-to-b from-[#242124] to-[#000000] 
      flex items-center jusitfy-center h-screen w-screen">
        <Login/>
      </div>
    )}
    
    </>
  )
}

export default App