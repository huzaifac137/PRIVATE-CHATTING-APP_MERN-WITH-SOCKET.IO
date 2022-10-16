import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
 import ScrollToBottom from "react-scroll-to-bottom";
import authContext from './CONTEXT/AuthContext';

function Chat({socket , selectedUsername , selectedUserId , status}) {


     const ctx = useContext(authContext);
    
   // const socket =io("http://localhost:5000");
   //const socket = ctx.socket;

    const[currentMessage , setCurrentMessage] = useState("");
    const[messageList , setMessageList] = useState([]);
    const[arrivalMessage , setArrivalMessage] = useState(null);
    const[ERROR , setError] = useState(null);



    const sendMessage=async(e)=>
    {
       if(currentMessage!=="")
       {

         const messageData = {

            message : currentMessage,
            time : new Date(Date.now()).getHours() +":" + new Date(Date.now()).getMinutes() ,
            to : selectedUserId ,
            from : ctx.userId ,
            authorName : ctx.username
           
         };

          socket.current.emit("send-msg" , messageData);
         
            setMessageList((list)=>{
                return [...list , messageData];
            })

            // SAVE THE MESSAGE TO MONGODB

            let responseData;

            try
            {
               const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/chats/send` ,{

                  method : "POST" ,

                  headers : {
                     "Content-Type" : "application/json" ,
                     "token" : ctx.token
                  } ,
                  
                  body : JSON.stringify({
                     messageData : messageData
                  })
               })

               responseData = await response.json();

               if(response.status!==201)
               {
                  throw new Error(responseData.message);
               }

            }

            catch(err)
            {
               setError(err.message);
               console.log(err.message);
            }
             
       }
    };

    const getChat=async()=>{

      let responseData;
          try
          {
               let response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/chats?author=${ctx.userId}&to=${selectedUserId}`);

               responseData = await response.json();

               if(response.status!==200)
               {
                  throw new Error(responseData.message);
               }

               setMessageList(responseData.chat);
               console.log(" CHAT RECEIEVED FROM DATABASE");
          }


          catch(err)
          {
               setError(err.message);
          }
    };


    useEffect(()=>{

      socket.current.on("recieve-msg" , (data)=>{

          setArrivalMessage(data);
                  
          console.log("RECIEVED MESSAGE" , data);
    
      })

  },[]);

  
  useEffect(()=>{

   ( arrivalMessage &&  selectedUserId===arrivalMessage.author) &&  setMessageList((list)=>{
          return [...list , arrivalMessage]
       });

  },[arrivalMessage , selectedUserId]);


   useEffect(()=>{

          getChat();

    },[]); 


    

    return (
        <div className='chat' >
         {ERROR ? <h2> {ERROR} </h2> : <>
             <div className='chat-header'>
                <h3> {selectedUsername} </h3>
                
             </div>
              
             <div className='chat-body'>

                <ScrollToBottom className='scroll' initialScrollBehavior= 'smooth' scrollViewClassName='scrollbar' >
                { messageList.map((item)=>  <div id='message'  className={ctx.username===item.authorName ? "you" : "other"}
                
                key={Math.random() * Math.random()*Math.random()}  >
                     
                    <div className='message-content'>
                     <h3 className='name'>{item.authorName}</h3>
                     <h3> {item.message} </h3> 
                     <h5> {item.time} </h5> 

                       </div> 
                        </div> ) }
                        
                     </ScrollToBottom>
             </div>
            
             <div className='chat-footer'>
                <input type="text" placeholder='hey , this is message' onChange={(e)=>setCurrentMessage(e.target.value)} /> 
                <button onClick={sendMessage}> &#9658; </button>
             </div>  </> }
        </div>
    );
}

export default Chat;