// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyByg5aUqZMa_VGpPFjQL_XLb_a5MuHLHlk",
  authDomain: "tarefasplus-66af4.firebaseapp.com",
  projectId: "tarefasplus-66af4",
  storageBucket: "tarefasplus-66af4.appspot.com",
  messagingSenderId: "15480446713",
  appId: "1:15480446713:web:cc504b7a7977823a274c28"
};


const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp)

export {db};