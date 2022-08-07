<template>
  <v-container>
    <v-card>
      <v-card-title>verify email sent</v-card-title>
      <v-card-text>
        メールをチェケラしてください。
      </v-card-text>
      <v-card-actions justify="end">
        <v-spacer></v-spacer>
        <v-btn @click="onClick">one more verify</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import {sendEmailVerification} from 'firebase/auth'

export default Vue.extend({
  name: 'PageSend',
  fetch() {
    this.verifyEmail()
  },
  methods: {
    async onClick(): Promise<void> {
      await this.verifyEmail()
    },
    async verifyEmail(): Promise<void> {
      try {
        if (!this.$auth.currentUser) {
          await this.$router.push('/login')
          return
        }
        await sendEmailVerification(this.$auth.currentUser, {
          url: 'http://localhost:3000/mfa/verify',
          handleCodeInApp: true,
        })
      } catch (e) {
        alert(e)
      }
    }
  }
})
</script>

<style scoped>

</style>
