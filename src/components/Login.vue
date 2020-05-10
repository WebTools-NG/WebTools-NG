<template>
<!--   <div>
    <h1>Login Page</h1>
    <input type="text" name="username" v-model="input.username" placeholder="Username">
    <input type="password" name="password" v-model="input.password" placeholder="Password">
    <button type="button" v-on:click="login()">Login</button>
  </div> -->

<section class="hero is-dark is-fullheight">
  <div class="hero-body">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-5-tablet is-4-desktop is-4-widescreen">
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
                <input type="password" placeholder="1234" class="input is-dark" v-model="input.password" required>
                <span class="icon is-small is-left">
                  <i class="fa fa-lock"></i>
                </span>
              </div>
            </div>
            <div class="field">
              <button type="button" class="button is-success" v-on:click="login()">
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
