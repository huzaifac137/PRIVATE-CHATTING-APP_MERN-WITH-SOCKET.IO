import React , {useCallback, useEffect , useMemo, useState} from 'react';
import { BrowserRouter, redirect, Route, Routes } from 'react-router-dom';
import Login from './AUTH/Login';
import Signup from './AUTH/Signup';
import Home from './Home';
import authContext from './CONTEXT/AuthContext';
import Navbar from './COMPONENTS/Navbar';
import { io } from 'socket.io-client';
import Chat from './Chat';



function App(props) {

  const[EMAIL , setEmail] = useState();
  const[USERNAME , setUsername] = useState();
  const[TOKEN, setToken] = useState(null);
  const[USERID , setUserId] = useState();


  useEffect(()=>{
         
    const loggedInUser = JSON.parse(localStorage.getItem("LoggedInUser"));
    if(loggedInUser)
    {

         const tokenExpirationTime = new Date(loggedInUser.expirationTime);
          if(tokenExpirationTime> new Date())
          {

            setLogin(loggedInUser.username , loggedInUser.email , loggedInUser.userId , loggedInUser.token , tokenExpirationTime)
          }
          
          else
          {
            localStorage.removeItem("LoggedInUser");
          }
    }

  },[]);

  const setLogin=useCallback((username , email , userId , token , expirationTime)=>{
       
     const tokenTime = expirationTime || new Date(new Date().getTime()+1000 *60*60);
    localStorage.setItem("LoggedInUser" , JSON.stringify({
      username ,
      email ,
      userId ,
      token ,
     expirationTime : tokenTime.toISOString()
    }));;

    setEmail(email);
    setToken(token);
    setUserId(userId);
    setUsername(username);

  });
   

  return (
    <authContext.Provider value={{username : USERNAME , email : EMAIL , token : TOKEN , userId : USERID , setUsername : setUsername ,
      setEmail :setEmail , setToken : setToken , setUserId : setUserId , setLogin : setLogin }} >

    <BrowserRouter>
    <Navbar/>
    <Routes>
     { TOKEN ? <Route path='/' element={<Home/>} /> : <Route path='/' element={<Login/>} />  }
    {!TOKEN &&  <Route path='/login' element={<Login/>}/>  }
    {!TOKEN &&  <Route path='/signup' element={ <Signup/>} /> }


    </Routes>
    </BrowserRouter>
    </authContext.Provider>

  );
}

export default App;