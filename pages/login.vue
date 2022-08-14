<template>
  <v-container>
    <div id="recaptcha-container"></div>
    <v-card>
      <v-card-title>login</v-card-title>
      <v-card-text>
        <v-text-field v-model="email" label="email"></v-text-field>
        <v-text-field v-model="password" label="password" type="password"></v-text-field>
      </v-card-text>
      <v-card-actions justify="end">
        <v-spacer></v-spacer>
        <v-btn @click="onClickLogin">Login</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
      <v-card-actions v-if="verificationId" justify="end">
        <v-spacer></v-spacer>
        <v-text-field v-model="verificationCode" label="verificationCode" type="verificationCode"/>
        <v-btn @click="verifyLogin">Verify</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
    <nuxt-link to="/signup">SignUp is here!!</nuxt-link>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  signInWithEmailAndPassword,
  PhoneAuthProvider,
  MultiFactorResolver,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,getMultiFactorResolver,MultiFactorError
} from 'firebase/auth'
import {FirebaseError} from "firebase/app";
import {isFirebaseError} from "~/plugins/firebase";

let recaptchaVerifier: RecaptchaVerifier | null = null
let resolver: MultiFactorResolver | null = null
export default Vue.extend({
  name: 'PageLogin',
  data() {
    const recaptchaId = -1
    return {
      email: '',
      password: '',
      verificationCode: '',
      recaptchaId,
      verificationId: '',
    }
  },
  mounted() {
    this.setRecaptcha()
  },
  methods: {
    // recaptchaを描画
    async setRecaptcha(): Promise<void> {
      recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", {
        size: "invisible"
      }, this.$auth)
      this.recaptchaId = await recaptchaVerifier.render()
    },
    // 通常ログイン
    async onClickLogin(): Promise<void> {
      try {
        const result = await signInWithEmailAndPassword(this.$auth, this.email, this.password)
        if (!result.user.emailVerified) {
          await this.$router.push('/email/send')
          return
        }
        await this.$router.push('/')
      } catch (error) {
        if (!isFirebaseError(error) || error.code !== 'auth/multi-factor-auth-required') {
          alert(error)
          return
        }
        await this.verifyPhoneNumber(error)
      }
    },
    // ログイン時に他要素認証を求められたら多要素認証を実行する
    async verifyPhoneNumber(error: FirebaseError) {
      if (!this.$auth) {
        return
      }
      resolver = getMultiFactorResolver(this.$auth, error as MultiFactorError)
      if (!resolver) {
        alert(error)
        return
      }
      if (!recaptchaVerifier) {
        this.setRecaptcha().then()
        alert('Please resend')
        return
      }
      try {
        const selectedIndex = 0 // ホントはhintsを見て、多要素認証を選択させるように作るこむといい
        // Ask user which second factor to use.
        if (resolver.hints[selectedIndex].factorId !== PhoneMultiFactorGenerator.FACTOR_ID) {
          return
        }
        const phoneInfoOptions = {
          multiFactorHint: resolver.hints[selectedIndex],
          session: resolver.session
        };
        const auth = this.$auth
        const phoneAuthProvider = new PhoneAuthProvider(auth);
        // Send SMS verification code
        this.verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
      } catch (error) {
        alert(error)
      }
    },
    // 認証番号を検証して問題なければ正式にログインさせる
    async verifyLogin() {
      if (!resolver) {
        alert('再ログインしてください')
        return
      }
      try {
        // Ask user for the SMS verification code. Then:
        const cred = PhoneAuthProvider.credential(this.verificationId, this.verificationCode)
        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred)
        // Complete sign-in.
        await resolver.resolveSignIn(multiFactorAssertion)
        await this.$router.push('/')
      } catch (error) {
        this.verificationId = ''
        alert(error)
      }
    }
  }
})
</script>

<style scoped>

</style>
