<template>
  <div>
    <h1>Login Page</h1>
    <input type="text" name="username" v-model="input.username" placeholder="Username">
    <input type="password" name="password" v-model="input.password" placeholder="Password">
    <button type="button" v-on:click="login()">Login</button>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      input: {
        username: "",
        password: ""
      }
    }
  },
  methods: {
    login(){
      if(this.input.username == "admin" && this.input.password == "1234") {
        this.$store.commit("setAuthentication", true);
        this.$router.replace({name: "home"});
      } else {
        console.log("The username or password is wrong")
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
