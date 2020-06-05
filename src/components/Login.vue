<template>
<section class="hero is-dark is-fullheight">
  <div class="hero-body">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-5-tablet is-4-desktop is-4-widescreen">
        <b-notification
            type="is-info"
            has-icon
            icon-pack="fas"
            aria-close-label="Close notification">
            {{ $t("Common.Login.SignIn") }} <br> {{ $t("Common.Login.UseCred") }} <br> {{ $t("Common.Login.Note") }}
        </b-notification>
          <form action="" class="box">
            <div class="field">
              <label for="" class="label">{{ $t("Common.Login.Username") }}</label>
              <div class="control has-icons-left">
                <input type="text" v-bind:placeholder="$t('Common.Login.UsernamePrompt')" class="input is-dark" v-model="input.username" required>
                <span class="icon is-small is-left">
                  <i class="fa fa-user"></i>
                </span>
              </div>
            </div>
            <div class="field">
              <label for="" class="label">{{ $t("Common.Login.Password") }}</label>
              <div class="control has-icons-left">
                <input type="password" v-bind:placeholder="$t('Common.Login.PasswordPrompt')" class="input is-dark" v-model="input.password" v-on:keyup.enter="plexLogin()" required>                
                <span class="icon is-small is-left">
                  <i class="fa fa-lock"></i>
                </span>
              </div>
            </div>
            <div class="field">
              <button type="button" class="button is-success" v-on:click="plexLogin()">
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>
</template>



<script>
import store from '../store'
// User Config
const wtconfig = require('../wtconfig');
var userName = "";
if(wtconfig.get('general.rememberlastusername')){
  userName = wtconfig.get('general.username')
}

export default {
  name: 'Login',
  data() {
    return {
      input: {
        username: userName,
        password: ""
      },
    }
  },
  methods: {
    plexLogin(){
      store.dispatch('loginToPlex', {
      username: this.input.username,
      password: this.input.password
      })
      wtconfig.set('general.username', this.input.username)
    },
    danger(){
       this.$buefy.toast.open({
                    duration: 3000,
                    message: "Wrong password or username",
                    type: 'is-danger'
                })
    }
  }}

</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
