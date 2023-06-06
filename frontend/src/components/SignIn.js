import React, { useEffect, useState } from "react";
import "../App.css";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import ProfilePage from "./ProfilePage";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
};

firebase.initializeApp(config);

const uiConfig = {
  signInFlow: "popup",
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    signInSuccess: () => false,
  },
};


const SignIn = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
      setIsSignedIn(!!user);
    });
    return () => unregisterAuthObserver();
  }, []);

  return (
    <div className="SignIn">
    <h1 align="center">Sign in </h1>
      {isSignedIn ? (
        <ProfilePage></ProfilePage>
      ) : (
        <StyledFirebaseAuth
          uiConfig={uiConfig}
          firebaseAuth={firebase.auth()}
        />
      )}
    </div>
  );
}


export default SignIn;
