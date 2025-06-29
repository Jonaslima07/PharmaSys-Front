// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDiUVdRpQqTl_rEWAnEUcjXOJR9NOjA-_o",
  authDomain: "pharmasys-28487.firebaseapp.com",
  projectId: "pharmasys-28487",
  storageBucket: "pharmasys-28487.appspot.com", // ← CORRETO
  messagingSenderId: "411257405250",
  appId: "1:411257405250:web:52b2d22a4cfb43945d52db"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa autenticação e provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Exporta para uso no front-end
export { auth, provider, signInWithPopup };
