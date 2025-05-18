
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyBK2ZE8y1Pw1XwM8Kid57LU5mhijIURULU",
    authDomain: "chatapp-98d22.firebaseapp.com",
    projectId: "chatapp-98d22",
    storageBucket: "chatapp-98d22.firebasestorage.app",
    messagingSenderId: "956189433137",
    appId: "1:956189433137:web:77175e1f4dc5b84f7da410",
    measurementId: "G-E0F47Q96GE"
  };

  const app = initializeApp(firebaseConfig);
  export const firebaseAuth = getAuth(app);