<template>
<b-container id="login-container" class="vw-100 vh-100" v-on:keyup.enter="onEnter">
  <b-row class="row justify-content-center align-items-center">
    <b-col id="login-column" col md="6">
      <b-col id="login-box" col md="12">
        <div>
          <b-tabs content-class="mt-3">
            <b-tab v-bind:title=this.titleUser active>
              <b-alert id=User show variant="info" class="rounded-0">
                <b-row>
                  <b-col cols="2 mx-auto text-center ">
                    <b-icon class="h1 mb-0" icon="exclamation-circle-fill" variant="info"></b-icon>
                  </b-col>
                  <b-col cols="10">
                    {{ $t("Common.Login.SignIn") }} <br> {{ $t("Common.Login.UseCred") }} <br> {{ $t("Common.Login.Note") }}
                  </b-col>
                </b-row>
              </b-alert>
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
              <b-form-group
                id="fieldset-3"
                :description="$t('Common.Login.twoFAPrompt')"
                :label="$t('Common.Login.twoFA')"
                label-for="input-1">
                  <b-form-input id="input-3" v-model="input.twoFA" trim></b-form-input>
              </b-form-group>
              <b-form-group>
                <b-form-checkbox
                  id="checkbox-1"
                  v-model="checkbox"
                  name="checkbox-1">
                  {{ $t('Common.Login.UsernameSave') }}
                </b-form-checkbox>
              </b-form-group>
            </b-tab>
            <b-tab v-bind:title=this.titleToken>
              <b-alert id="alert" show variant="info" class="rounded-0">
                <b-row>
                  <b-col cols="2 mx-auto text-center ">
                    <b-icon class="h1 mb-0" icon="exclamation-circle-fill" variant="info"></b-icon>
                  </b-col>
                  <b-col cols="10">
                    {{ $t("Common.Login.UseToken") }}
                  </b-col>
                </b-row>
              </b-alert>
              <b-form-group
                id="token-1"
                :description="$t('Common.Login.TokenPrompt')"
                :label="$t('Common.Login.Token')"
                label-for="token-1">
                  <b-form-input id="token-1" v-model="input.token" trim></b-form-input>
              </b-form-group>
            </b-tab>
          </b-tabs>
        </div>
        <b-button type="submit"  variant="primary" v-on:click="plexLogin()">{{ $t('Common.Login.LoginBtn') }}</b-button>
      </b-col>
    </b-col>
  </b-row>
</b-container>

</template>



<script>
import store from '../../../store';
import { wtutils, wtconfig } from '../General/wtutils';
const log = require('electron-log');
console.log = log.log;
log.transports.file.fileName = wtutils.logFileName;

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
      titleUser: this.$t("Common.Login.TitleUsr"),
      titleToken: this.$t("Common.Login.TitleToken"),
      checkbox: isRemember,
      input: {
        username: userName,
        password: wtconfig.get('Developer.password', ""),
        token: ""
      },
    }
  },
  created() {
    if (this.$store.getters.getAuthToken != ''){
      log.verbose(`[login.vue] (created) We have an Auth Token from cli or dev option`)
      store.dispatch('loginToPlexWithToken', {
      token: this.$store.getters.getAuthToken
      })
    }
  },
  methods: {
    onEnter: function() {
       this.plexLogin();
    },
    plexLogin(){
      store.dispatch('loginToPlex', {
      username: this.input.username,
      password: this.input.password,
      twoFA: this.input.twoFA,
      token: this.input.token
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
  margin-top: 2%;
}

#login-box {
  border: 1px solid #9C9C9C;
  background-color: #EAEAEA;
  padding: 15px;
}

#login-column{
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}

</style>
