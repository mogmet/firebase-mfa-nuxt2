<template>
  <v-container>
    <v-card>
      <v-card-title>verifying</v-card-title>
      <v-card-text>
        verifying...
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import {isSignInWithEmailLink, signInWithEmailLink} from 'firebase/auth'

export default Vue.extend({
  name: 'PageMfaConfirm',
  fetch() {
    this.verifyEmail()
  },
  methods: {
    async verifyEmail(): Promise<void> {
      try {
        const user = this.$auth.currentUser
        if (!user) {
          await this.$router.push('/login')
          return
        }
        const auth = this.$auth
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          alert('不正なリンク')
          await this.$router.push('/email/send')
          return
        }
        await signInWithEmailLink(auth, user.email ?? '', window.location.href)
        await this.$router.push('/mfa/create')
      } catch (e) {
        alert(e)
      }
    }
  }
})
</script>

<style scoped>

</style>
