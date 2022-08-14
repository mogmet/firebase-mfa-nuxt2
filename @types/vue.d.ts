import {Auth} from "firebase/auth";
import {FirebaseApp} from "firebase/app";

declare module 'vue/types/vue' {
  interface Vue {
    $auth: Auth
    $firebase: FirebaseApp
  }
}
