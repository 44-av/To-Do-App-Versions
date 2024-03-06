import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "@firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBYacHp9qvGhdZes8kUmnJUfOBcCxG4BOI",
  authDomain: "gap-tasksdb.firebaseapp.com",
  projectId: "gap-tasksdb",
  storageBucket: "gap-tasksdb.appspot.com",
  messagingSenderId: "1061387872067",
  appId: "1:1061387872067:web:e89d4153a480c334ccb1f6",
  measurementId: "G-V5HJ8E8TTR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
const analytics = getAnalytics(app);