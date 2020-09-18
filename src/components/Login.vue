<template>
<b-container class="vw-100 vh-100">
  <b-row class="row justify-content-center align-items-center">
    <b-col id="login-column" col md="6">

        <b-alert id="alert" show variant="info" class="rounded-0">
          <b-row>
            <b-col cols="2 mx-auto text-center ">
              <b-icon class="h1 mb-0" icon="exclamation-circle-fill" variant="info"></b-icon>
            </b-col>
            <b-col cols="10">
              {{ $t("Common.Login.SignIn") }} <br> {{ $t("Common.Login.UseCred") }} <br> {{ $t("Common.Login.Note") }}
            </b-col>
          </b-row>
        </b-alert>

      <b-col id="login-box" col md="12">
        <b-form-group
          id="fieldset-1"
          :description="$t('Common.Login.UsernamePrompt')"
          :label="$t('Common.Login.Username')"
          label-for="input-1">
            <b-form-input id="input-1" v-model="input.username" trim></b-form-input>
        </b-form-group>

        <b-form-group
          id="fieldset-2"
          :description="$t('Common.Login.PasswordPrompt')"
          :label="$t('Common.Login.Password')"
          label-for="input-2">
            <b-form-input type="password" id="input-2" v-model="input.password" trim></b-form-input>
        </b-form-group>

        <b-form-group>
          <b-form-checkbox
            id="checkbox-1"
            v-model="checkbox"
            name="checkbox-1">
            {{ $t('Common.Login.UsernameSave') }}
          </b-form-checkbox>
        </b-form-group>

        <b-button type="submit"  variant="primary" v-on:click="plexLogin()">{{ $t('Common.Login.LoginBtn') }}</b-button>
      </b-col>
    </b-col>
  </b-row>
</b-container>


<!-- 
<section class="hero is-dark is-fullheight">
  <div class="hero-body">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-5-tablet is-4-desktop is-4-widescreen">
        <b-notification
            type="is-info"
            has-icon
            icon-pack="fas"
            aria-close-label="Close notification"
            :closable = false>
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
              <b-checkbox type="is-dark" v-model="checkbox">
                Save Username
            </b-checkbox>
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
</section> -->

</template>



<script>
import store from '../store'
const log = require('electron-log');
console.log = log.log;
// User Config
import {wtconfig} from '../wtutils';

var userName = "";

let isRemember = false
if(wtconfig.get('General.rememberlastusername')){
  userName = wtconfig.get('General.username')
  isRemember = true
}

export default {
  name: 'Login',
  data() {
    return {
      checkbox: isRemember,
      input: {
        username: userName,
        password: wtconfig.get('Developer.password', "")
      },
    }
  },
  methods: {
    plexLogin(){
      store.dispatch('loginToPlex', {
      username: this.input.username,
      password: this.input.password
      })
            
      if(this.checkbox){
        log.verbose(`Save username is: ${this.checkbox}`)
        wtconfig.set('General.rememberlastusername', true )
        wtconfig.set('General.username', this.input.username)      
      } else {
        log.verbose(`Save username is: ${this.checkbox}`)
        wtconfig.set('General.rememberlastusername', false )
      }
    },
    danger(){
       this.$buefy.toast.open({
                    duration: 3000,
                    message: "Wrong password or username",
                    type: 'is-danger'
                })
    }
  }
  }

</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

#alert{
  margin-top: 25%;
}

#login-box {
  border: 1px solid #9C9C9C;
  background-color: #EAEAEA;
}
 #login-box {
  padding: 15px;
}

</style>
