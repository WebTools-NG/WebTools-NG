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
                <input type="password" v-bind:placeholder="$t('Common.Login.PasswordPrompt')" class="input is-dark" v-model="input.password" v-on:keyup.enter="loginToPlex()" required>                
                <span class="icon is-small is-left">
                  <i class="fa fa-lock"></i>
                </span>
              </div>
            </div>
            <div class="field">
              <button type="button" class="button is-success" v-on:click="loginToPlex()">
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
const axios = require('axios').default;
import store from '../store'
import router from '../router'

export default {
  name: 'Login',
  data() {
    return {
      input: {
        username: "",
        password: ""
      },
    }
  },
  methods: {
    login(){
      if(this.input.username == "admin" && this.input.password == "1234") {
        this.$store.commit("setAuthentication", true);
        this.$router.replace({name: "home"});
      } else {
        console.log("The username or password is wrong")
        this.danger();
      }
    },
    danger(){
       this.$buefy.toast.open({
                    duration: 3000,
                    message: "Wrong password or username",
                    /*${status}: ${msg}*/
                    type: 'is-danger'
                })
    },
    loginToPlex(){
      axios({
        method: 'POST',
        url: 'https://plex.tv/users/sign_in.json',
        responseType: 'json',
        auth: {
          username : this.input.username,
          password:  this.input.password
        },
        headers: 
        { 'X-Plex-Product' : 'webtools',
          'X-Plex-Version' : '1.19.2',
          'X-Plex-Client-Identifier' : 'Insert ID here',
        }
      })  
        .then(function (response) {
          store.commit("setAuthToken", response.data.user.authToken);
          store.commit("setAuthentication", true);
          router.replace({name: "home"}); 
  })
        .catch(function (error) {
           if (error.response) {                  
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data)
      console.log(error.response.status)
      alert(error.response.data.error)
      //this.danger(error.response.status, error.response.data.error);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }    
  })
    }
  }}

</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
