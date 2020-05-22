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
            Sign in with plex.tv <br> Use your regular Plex credentials
        </b-notification>
          <form action="" class="box">
            <div class="field">
              <label for="" class="label">Username</label>
              <div class="control has-icons-left">
                <input type="text" placeholder="admin" class="input is-dark" v-model="input.username" required>
                <span class="icon is-small is-left">
                  <i class="fa fa-user"></i>
                </span>
              </div>
            </div>
            <div class="field">
              <label for="" class="label">Password</label>
              <div class="control has-icons-left">
                <input type="password" placeholder="1234" class="input is-dark" v-model="input.password" v-on:keyup.enter="newLogin()" required>
                <span class="icon is-small is-left">
                  <i class="fa fa-lock"></i>
                </span>
              </div>
            </div>
            <div class="field">
              <button type="button" class="button is-success" v-on:click="newLogin()">
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
//onst axios = require('axios').default;
import store from '../store'
//import router from '../router'

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
    newLogin(){
      store.dispatch('loginToPlex', {
      username: this.input.username,
      password: this.input.password
      })
    },
    danger(){
       this.$buefy.toast.open({
                    duration: 3000,
                    message: "Wrong password or username",
                    /*${status}: ${msg}*/
                    type: 'is-danger'
                })
    },
    /*
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
    */
  }}

</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
