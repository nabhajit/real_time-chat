import { useState, useRef } from 'react';
import './App.css';

// Import only what you need from Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth'; // <- Add this line
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDT8PyRZWaxOpLUsa_uLTkOZZHDdq-Lrt4",
  authDomain: "chat-box-88ea0.firebaseapp.com",
  projectId: "chat-box-88ea0",
  storageBucket: "chat-box-88ea0.appspot.com",
  messagingSenderId: "323843348689",
  appId: "1:323843348689:web:d25a26f08d8c66fd840df0",
  measurementId: "G-WBRN8XGVKD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
// Corrected firestore reference

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h2>Chat-Box</h2>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during sign in: ", error);
    }
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => signOut(auth)}>Sign Out</button>
  );
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, 'messages');
  const queryMessages = query(messagesRef, orderBy('createdAt'), limit(25));

  const [messages] = useCollectionData(queryMessages, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;
    setFormValue('');
    try {
      await addDoc(messagesRef, {
        text: formValue,
        createdAt: serverTimestamp(),
        uid,
        photoURL,
        displayName: displayName ? displayName.split(' ')[0] : 'Anonymous',
      });

      
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <>
      <main>
        {messages && messages.map((msg, index) => {
          // Check if the previous message is from the same user
          const showName = index === 0 || messages[index - 1].uid !== msg.uid;
          return <ChatMessage key={msg.id} message={msg} showName={showName} />;
        })}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
        <button type="submit" disabled={!formValue}>send</button>
      </form>
    </>
  );
}



function ChatMessage({ message, showName }) {
  const { text, uid, photoURL, displayName } = message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  const firstName = displayName ? displayName.split(' ')[0] : 'Anonymous';
  return (
    <div className={`message ${messageClass} ${!showName ? 'hide-avatar' : ''}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="Avatar" />
      
      <div className="message-content">
        {showName && <p className="sender-name"><strong>{firstName}</strong></p>} {/* Show name if it's the first in sequence */}
        <p>{text}</p> {/* Display the message text */}
      </div>
    </div>
  );
}






export default App;
