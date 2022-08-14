<template>
  <v-container>
    <div id="recaptcha-container"></div>
    <v-card>
      <v-card-title>Send MFA code</v-card-title>
      <v-card-text>
        <v-text-field v-model="phoneNumber" label="phone"></v-text-field>
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
import { RecaptchaVerifier, multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, PhoneInfoOptions } from 'firebase/auth'
import { isFirebaseError } from '~/plugins/firebase'
let recaptchaVerifier: RecaptchaVerifier | null = null
export default Vue.extend({
  name: 'PageMfaVerify',
  data() {
    const recaptchaId = -1
    return {
      phoneNumber: '',
      verificationCode: '',
      recaptchaId,
      verificationId: ''
    }
  },
  async mounted() {
    await this.setRecaptcha()
  },
  methods: {
    // recaptchaを描画
    async setRecaptcha(): Promise<void> {
      recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", {
        size: "invisible"
      }, this.$auth)
      this.recaptchaId = await recaptchaVerifier.render()
    },
    // 設定した電話番号に認証コードを送る
    async onClickSendNumber(): Promise<void> {
      try {
        if (this.recaptchaId === -1 || !recaptchaVerifier) {
          await this.setRecaptcha()
          alert('もう一度押してください')
          return
        }
        const auth = this.$auth
        if (!auth || !auth.currentUser) {
          await this.$router.push('/login')
          return
        }
        const multiFactorSession = await multiFactor(auth.currentUser).getSession()
        const phoneInfoOptions: PhoneInfoOptions = {
          phoneNumber: this.phoneNumber,
          session: multiFactorSession
        };
        this.verificationId = await new PhoneAuthProvider(auth).verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
      } catch (error) {
        if (isFirebaseError(error) && error.code === 'auth/requires-recent-login') {
          await this.$router.push('/login')
          return
        }
        this.setRecaptcha().then() // エラーになったらrecaptchaを再生成
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
      try {
        const cred = PhoneAuthProvider.credential(this.verificationId, this.verificationCode)
        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred)
        await multiFactor(auth.currentUser).enroll(multiFactorAssertion)
        await this.$router.push('/')
      }catch (e) {
        console.error(e)
        alert(e)
      }
    }
  }
})

</script>

<style scoped>

</style>
