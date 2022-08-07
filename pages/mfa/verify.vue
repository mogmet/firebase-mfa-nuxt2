<template>
  <v-container>
    <div id="sign-in-button"></div>
    <v-card>
      <v-card-title>Send MFA code</v-card-title>
      <v-card-text>
        <v-text-field v-model="phone" label="phone"></v-text-field>
      </v-card-text>
      <v-card-actions justify="end">
        <v-spacer></v-spacer>
        <v-btn @click="onClickSendNumber">Send code</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
    <v-card>
      <v-card-title>verify MFA code</v-card-title>
      <v-card-text>
        <v-text-field v-model="verificationCode" label="verificationCode"></v-text-field>
      </v-card-text>
      <v-card-actions justify="end">
        <v-spacer></v-spacer>
        <v-btn @click="onClickVerify">verify</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { RecaptchaVerifier, multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, PhoneInfoOptions, AuthError } from 'firebase/auth'
import {FirebaseError} from "firebase/app";

export default Vue.extend({
  name: 'PageMfaVerify',
  data() {
    const recaptchaId = -1
    return {
      phone: '',
      verificationCode: '',
      recaptchaId,
      verificationId: ''
    }
  },
  computed: {
      recaptchaVerifier() {
        return new RecaptchaVerifier("sign-in-button", {
          "size": "invisible",
          "callback" (response: any) {
            console.log('didResolved', response)
          }
        }, this.$auth)
      },
  },
  async mounted() {
    await this.setRecaptcha()
  },
  methods: {
    // recaptchaを描画
    async setRecaptcha(): Promise<void> {
      this.recaptchaId = await this.recaptchaVerifier.render()
    },
    // 設定した電話番号に認証コードを送る
    async onClickSendNumber(): Promise<void> {
      try {
        console.log('onClickSendNumber', this.recaptchaId)
        if (this.recaptchaId === -1) {
          await this.setRecaptcha()
          return
        }
        console.log('start auth')
        const auth = this.$auth
        if (!auth || !auth.currentUser) {
          await this.$router.push('/login')
          return
        }
        console.log('mutifactor')
        const multiFactorSession = await multiFactor(auth.currentUser).getSession()
        const phoneInfoOptions: PhoneInfoOptions = {
          phoneNumber: this.phone,
          session: multiFactorSession
        };
        console.log('verify', phoneInfoOptions)
        this.verificationId = await new PhoneAuthProvider(auth).verifyPhoneNumber(phoneInfoOptions, this.recaptchaVerifier)
      } catch (error) {
        console.table(error)
        if (implementsFirebaseError(error) && error.code === 'auth/requires-recent-login') {
          await this.$router.push('/login')
          return
        }
        console.error(error)
        alert(error)
      }
    },
    // 認証コード検証
    async onClickVerify(): Promise<void> {
      const auth = this.$auth
      if (!auth || !auth.currentUser) {
        await this.$router.push('/login')
        return
      }
      const cred = PhoneAuthProvider.credential(this.verificationId, this.verificationCode)
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred)
      return multiFactor(auth.currentUser).enroll(multiFactorAssertion)
    }
  }
})
function implementsFirebaseError(arg: unknown): arg is FirebaseError {
  return arg !== null &&
    typeof arg === "object" &&
    typeof (arg as FirebaseError).code === "string"
}

</script>

<style scoped>

</style>
