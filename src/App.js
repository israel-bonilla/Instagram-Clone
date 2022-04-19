import './App.css';
import Post from './Post';
import { useState, useEffect } from "react";
import { db, auth } from './firebase';
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Input } from '@material-ui/core';
import ImageUpload from "./ImageUpload";
import InstagramEmbed from 'react-instagram-embed';
import ErrDialogue from './ErrDialogue';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);

  const [posts, setPosts] = useState([]);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [errDialogue, setErrDialogue] = useState('');
  const [displayErrD, setDisplayErrD] = useState(false);

  const authErrCodes = ['wrong-password', 'invalid-email', 'email-already-in-use',
                      'user-not-found', 'weak-password'].map(code => `auth/${code}`);
  const authErrDialogues = ['Please enter your password.', 'Sorry, your password was incorrect. Please double-check your password.', 'Please enter a valid email.', 'This email is already in use. Sign in instead?', 'This user does not exist. Sign up instead?', 'Please use a stronger password.', 'Please provide a password.'];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if(authUser) {
        console.log(authUser);
        setUser(authUser);
      } else {
        setUser(null);
      }
    })

    return () => {
      unsubscribe();
    }
  }, [user, username]);

  useEffect(() => {
    db.collection("posts").orderBy('timestamp', 'desc').onSnapshot(snapshot => {
      setPosts(snapshot.docs.map(doc => ({
        id: doc.id,
        post: doc.data() 
      })));
    });
  }, []);

  useEffect(() => {
    setDisplayErrD(false);
  }, [email, password]);

  useEffect(() => {
    setOpenSignIn(false);
    setOpenSignUp(false);
  }, [user]);

  const signUp = (event) => {
    event.preventDefault();
    setOpenSignIn(false);

    auth
    .createUserWithEmailAndPassword(email, password)
    .then((authUser) => {
      return authUser.user.updateProfile({
        displayName: username
      })
    })
    .catch((error) => {
      switch(error.code) {
        case authErrCodes[1]:
          setErrDialogue(authErrDialogues[2]);
          setDisplayErrD(true);
          break;
        case authErrCodes[2]:
          setErrDialogue(authErrDialogues[3]);
          setDisplayErrD(true);
          break;
        case authErrCodes[4]:
          password ? setErrDialogue(authErrDialogues[5])
                   : setErrDialogue(authErrDialogues[6]);
          setDisplayErrD(true);
          break;
        default:
          alert(error.message);
          break;
      }
    });
  }

  const signIn = (event) => {
    event.preventDefault();

    auth
      .signInWithEmailAndPassword(email, password)
      .catch((error) => {
        switch(error.code) {
          case authErrCodes[0]:
            password ? setErrDialogue(authErrDialogues[1])
                     : setErrDialogue(authErrDialogues[0]);
            setDisplayErrD(true);
            break;
          case authErrCodes[1]:
            setErrDialogue(authErrDialogues[2]);
            setDisplayErrD(true);
            break;
          case authErrCodes[3]:
            setErrDialogue(authErrDialogues[4]);
            setDisplayErrD(true);
            break;
          default:
            alert(error.message);
            break;
        }
      });
  }

  const signUpInstead = (e) => {
    e.preventDefault();
    setDisplayErrD(false);
    setOpenSignIn(false);
    setOpenSignUp(true);
  }
  
  const signInInstead = (e) => {
    e.preventDefault();
    setDisplayErrD(false);
    setOpenSignUp(false);
    setOpenSignIn(true);
  }

  const logout = (e) => {
    e.preventDefault();
    auth.signOut();
    setOpenLogout(false);
  }

  const signInModalClose = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setDisplayErrD(false);
  }

  return (
    <div className="app">
      <Modal
        open={openSignUp}
        onClose={() => setOpenSignUp(false)} >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signUp">
            <center>
              <img className="app__headerImage"
                  src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" 
                  alt="" />
            </center>
            <Input placeholder="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)} />
            <Input placeholder="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} />
            {displayErrD && <ErrDialogue dialogue={errDialogue} />}
            <Button className="app__signInButton" type="submit" onClick={signUp} >Sign Up</Button>
            <Button className="app__signInButton" onClick={() => {setOpenSignUp(false); signInModalClose();}}>Cancel</Button>
            <p style={{textAlign: "center", color: "blue", padding: "20px"}}>Already have an existing account? Sign in</p>
            <Button className="app__signInButton" onClick={signInInstead}>Sign In</Button>
          </form>
        </div>
      </Modal>

      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)} >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signUp">
            <center>
              <img className="app__headerImage"
                  src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                  alt="" />
            </center>
            <Input placeholder="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} />
            {displayErrD && <ErrDialogue dialogue={errDialogue} />}
            <Button className="app__signInButton" type="submit" onClick={signIn} >Sign In</Button>
            <Button className="app__signInButton" onClick={() => {setOpenSignIn(false); signInModalClose();}}>Cancel</Button>
            <p style={{textAlign: "center", color: "blue", padding: "20px"}}>Don't have an account? Sign up</p>
            <Button className="app__signInButton" onClick={signUpInstead}>Sign Up</Button>
          </form>
        </div>
      </Modal>

      <Modal
        open={openLogout}
        onClose={() => setOpenLogout(false)} >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__logoutConfirm">
            <center>
              <img className="app__headerImage"
                  src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" 
                  alt="" />
            </center>
            <p className="app__logoutDialogue">Are you sure you want to log out?</p>
            <Button onClick={() => setOpenLogout(false)} style={{marginLeft: "20px"}}>Cancel</Button>
            <Button type="submit" onClick={logout} style={{marginLeft: "20px"}}>Logout</Button>
          </form>
        </div>
      </Modal>

      <div className="app__header">
        <img className="app__headerImage"
         src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" alt="" />
        {user ? (
          <Button onClick={() => setOpenLogout(true)}>Logout</Button>
        ) : (
          <div className="app__loginContainer">
            <Button onClick={() => {setOpenSignIn(true); setDisplayErrD(false);} }>Sign In</Button>
          </div>
        )}
      </div>

      <div className="app__posts">
        <div className="app__postsLeft">
          {
            posts.map(({ id, post }) => (
            <Post key={id} postId={id} user={user} username={post.username} caption={post.caption} imageUrl={post.imageUrl} />
            ))
          }
        </div>
        <div className="app__postsRight">
          <InstagramEmbed />
        </div>
      </div>

      {user ? (
        <ImageUpload username={user.displayName} />
      ) : (
        <h3 className="app__loginToUploadMessage">Log in to upload</h3>
      )}
    </div>
  );
}

export default App;
