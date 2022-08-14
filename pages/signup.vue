<template>
  <v-container>
    <v-card>
      <v-card-title>SignUp!</v-card-title>
      <v-card-text>
        <v-text-field label="email" v-model="email"></v-text-field>
        <v-text-field label="password" type="password" v-model="password"></v-text-field>
      </v-card-text>
      <v-card-actions justify="end">
        <v-spacer></v-spacer>
        <v-btn @click="onClickSignup">signup</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
    <nuxt-link to="/login">Login is here!!</nuxt-link>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { createUserWithEmailAndPassword } from 'firebase/auth'

export default Vue.extend({
  name: 'PageSignup',
  data () {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    async onClickSignup(): Promise<void> {
      try {
        await createUserWithEmailAndPassword(this.$auth, this.email, this.password)
        await this.$router.push('/email/send')
      } catch (e) {
        alert(e)
      }
    }
  }
})
</script>

<style scoped>

</style>
