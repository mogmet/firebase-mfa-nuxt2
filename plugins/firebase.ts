import {initializeApp, getApps, FirebaseApp, FirebaseError} from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { Plugin } from '@nuxt/types'
export interface IFirebasePlugin {
  firebase: FirebaseApp,
  auth: Auth
}

const firebasePlugin: Plugin = (_, inject) => {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  }
  const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]
  inject('firebase', firebaseApp)
  inject('auth', getAuth(firebaseApp))
}
export default firebasePlugin

export function isFirebaseError(arg: unknown): arg is FirebaseError {
  return arg !== null &&
    typeof arg === "object" &&
    typeof (arg as FirebaseError).code === "string"
}
