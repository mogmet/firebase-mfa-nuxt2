<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">
          Welcome to secure world!!
        </v-card-title>
        <v-card-text>
          <p>
            無事認証もできたね！
          </p>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'
import { createUserWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth'

export default Vue.extend({
  name: 'PageIndex',
  mounted() {
    onAuthStateChanged(this.$auth, (user: User | null) => {
      if (!user) {
        this.$router.push('/login')
        return
      }
      if (!user.emailVerified) {
        this.$router.push('/email/confirm')
        return
      }
      // 多要素認証を設定してない場合は設定画面に飛ばす。
      const reloadUserInfo = (user as any).reloadUserInfo
      if (!reloadUserInfo) {
        // 登録直後なので値は入ってない。しょうがないので許容してあげる。
        return
      }
      if (!reloadUserInfo.mfaInfo || !reloadUserInfo.mfaInfo.length) {
        this.$router.push('/mfa/verify')
      }
    })
  },
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
