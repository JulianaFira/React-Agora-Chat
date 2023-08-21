import AC, { AgoraChat } from 'agora-chat'
import { ChangeEvent, useEffect, useRef, useState } from "react";
import './SimpleAgoraChat.scss'

const SimpleAgoraChat = () =>{

  const [conn, setConn ]= useState<AgoraChat.Connection>()

  const [appToken, setAppToken] = useState('')

  const [userId,setUserId] = useState('');
  const [userToken, setUserToken] = useState('');

  const [chatRoomId, setChatRoomId] = useState('');
  const [receptor, setReceptor] = useState<string>('');

  const [singleMessage, setSingleMessage] = useState<string>('');
  const [chatRoomMessage, setChatRoomMessage] = useState<string>('');

  const logRef = useRef<HTMLDivElement | null>(null);
  const singleChatRef = useRef<HTMLDivElement | null>(null);
  const chatroomRef = useRef<HTMLDivElement | null>(null);

  const startEventListeners = ()=>{
   if(conn){
    conn.addEventHandler("connection&message", {
      // Occurs when the app is connected to Agora Chat.
      onConnected: () => {
        printLogMessage('Connect success !')
      },
      // Occurs when the app is disconnected from Agora Chat.
      onDisconnected: () => {
        printLogMessage('Logout success !')
      },
      // Occurs when a text message is received.

      onTextMessage: (message) => {
        console.log(message.chatType)
        if(message.chatType === 'chatRoom' || message.chatType === 'singleChat'){
          printChatMessage( message.chatType,`${message.from}: ${message.msg}`)
        }else{
          printLogMessage("Message from: " + message.from + " Message: " + message.msg)
        }
        
      },
      // Occurs when the token is about to expire.
      onTokenWillExpire: () => {
        printLogMessage('Token is about to expire')
      },
      // Occurs when the token has expired. 
      onTokenExpired: () => {
        printLogMessage('The token has expired')
      },
      onError: (error) => {
        printLogMessage("error event, please see the console")
        console.error("on error", error);
      },  
      onChatroomEvent:(eventData)=> {
        printChatMessage('chatRoom', `${eventData.name}`)
      },
    });
   }
    
  }

  //inputs handler's
  const handleAppTokenChange = (ev: ChangeEvent<HTMLInputElement>)=>{
    const {value} = ev.target
    setAppToken(value)
  }

  const handleUserTokenChange = (ev: ChangeEvent<HTMLInputElement>)=>{
    const {value} = ev.target
    setUserToken(value)
  }

  const handleUserIdChange = (ev: ChangeEvent<HTMLInputElement>)=>{
    const {value} = ev.target
    setUserId(value)
  }

  const handleReceptorChange = (ev: ChangeEvent<HTMLInputElement>)=>{
    const {value} = ev.target
    setReceptor(value)
  }

  const handleChatRoomChange = (ev: ChangeEvent<HTMLInputElement>)=>{
    const {value} = ev.target
    setChatRoomId(value)
  }

  const handleSingleMessageChange = (ev: ChangeEvent<HTMLInputElement>)=>{
    const {value} = ev.target
    setSingleMessage(value)
  }

  const handleChatRoomMessageChange = (ev: ChangeEvent<HTMLInputElement>)=>{
    const {value} = ev.target
    setChatRoomMessage(value)
  }
  // end inputs handler's


  //login/logout

  const handleLogin = ()=>{
    if(userId && userToken && conn){
        try{
          conn.open({
            user: userId,
            agoraToken: userToken,
          });
        }catch(error){
          printLogMessage('Error in Login, please see the console')
          console.error(error)
        }
    }
  }

  const handleLogout = ()=>{
    conn && conn.close();
  }
  // end login/logout


  //buttons handler's
  const handleSendMessage = (type:'chatRoom' | 'singleChat')=>{

    //validate if the message to send its for chatRoom or singleChat
    const receptorId = type === 'chatRoom' ? chatRoomId : receptor
    const message = type === 'chatRoom' ? chatRoomMessage : singleMessage

    const option: AgoraChat.CreateMsgType = {
      chatType: type, // Sets the chat type as single chat.
      type: "txt", // Sets the message type.
      to: receptorId, // Sets the recipient of the message with user ID.
      msg: message, // Sets the message content.
    };

    let msg = AC.message.create(option);

    if(conn){
      conn.send(msg).then((res) => {
        printLogMessage(`send text success. localMsgId: ${res.localMsgId}. serverMsgId:${res.serverMsgId}`)
      }).catch((error) => {
        printLogMessage("send private text fail, please see the console");
        console.error(error)
      });
    }
    
  }

  const handleJoinChatRoom = ()=>{
    if(conn){
      let option = {
          roomId: '223229872504833',
          message: 'reason'
      }
      conn.joinChatRoom(option).then(
        res => printLogMessage(`joined to the chatRoom: ${res.data?.id}`)
      ).catch((error) => {
        printLogMessage("join to chatRoom fail, please see the console");
        console.error(error)
      });
    }

  }
  
  //handle message log
  const printLogMessage = (message:string)=>{
    if (logRef.current) {
      const messageElement = document.createElement('p');
      messageElement.textContent = message;
      logRef.current.appendChild(messageElement);
    }
  }

  const printChatMessage = (type:'chatRoom' | 'singleChat', message:string)=>{
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    if (singleChatRef.current && type === 'singleChat') {
      singleChatRef.current.appendChild(messageElement);
    } else if( chatroomRef.current && type ==='chatRoom'){
      chatroomRef.current.appendChild(messageElement);
    }
  }

  //useEffect

  useEffect(()=>{
    setConn(new AC.connection({
      appKey: '611016787#1187288',
    }))

    //cleant the event handler when the aplication are closed or reloaded
    return ()=>{
      console.log('holi')
      if(conn){
        conn.removeEventHandler("connection&message")
      }
      
    }
  },[])

  useEffect(()=>{
    if(conn){
      console.log('starting events')
      startEventListeners()
    }
  },[conn])

  return (  
    <div className='SimpleAgoraChatContainer'>
      <div className='InputInfoGroup'>
        <div>
          <h4>App Token</h4>
          <input placeholder='App Token' value={appToken} onChange={handleAppTokenChange}/>
        </div>
        <div>
          <p>Login</p>
          <input placeholder='userId' value={userId} onChange={handleUserIdChange}/>
          <input placeholder='user Token' value={userToken} onChange={handleUserTokenChange}/>
          <button onClick={handleLogin}>Log in</button>
          <button onClick={handleLogout}>Log out</button>
        </div>
        <div>
          <h4>ChatRoom handle</h4>
          <p>chatRoomId</p>
          <input placeholder='Chatroom id' value={chatRoomId} onChange={handleChatRoomChange}/>
          <p>message</p>
          <input placeholder='message' value={chatRoomMessage} onChange={handleChatRoomMessageChange} />
          <button onClick={handleJoinChatRoom}>join to chatRoom</button>
          <button onClick={()=>handleSendMessage('chatRoom')}>Send Message to ChatRoom</button>
        </div>
        <div>
          <h4>Send message to</h4>
          <p>single chat id</p>
          <input placeholder='receptor id' value={receptor} onChange={handleReceptorChange}/>
          <p>message</p>
          <input placeholder='message' value={singleMessage} onChange={handleSingleMessageChange} />

          <button onClick={()=>handleSendMessage('singleChat')}>Send Message to single chat</button>

        </div>
      </div>
      <div className='EventsLogGroup'>
        <div ref={logRef} className='LogEvents'>
          <h4>Log events</h4>
        </div>
        <div ref={singleChatRef} className='SingleChatEvents'>
          <h4>singleChat messages</h4>
        </div>
        <div ref={chatroomRef} className='ChatRoomEvents'>
          <h4>chatRoom messages</h4>
        </div>
      </div>

    </div>
  )


}


export default SimpleAgoraChat