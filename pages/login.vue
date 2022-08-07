<template>
  <v-container>
    <v-card>
      <v-card-title>login</v-card-title>
      <v-card-text>
        <v-text-field label="email" v-model="email"></v-text-field>
        <v-text-field label="password" type="password" v-model="password"></v-text-field>
      </v-card-text>
      <v-card-actions justify="end">
        <v-spacer></v-spacer>
        <v-btn @click="onClickLogin">Login</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'

export default Vue.extend({
  name: 'PageLogin',
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    async onClickLogin(): Promise<void> {
      try {
        const result = await signInWithEmailAndPassword(this.$auth, this.email, this.password)
        if (!result.user.emailVerified) {
          await this.$router.push('/email/send')
          return
        }
        // TODO: mfa確認
        await this.$router.push('/')
      } catch (e) {
        alert(e)
      }
    }
  }
})
</script>

<style scoped>

</style>
