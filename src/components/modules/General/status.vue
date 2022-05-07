<script>
    export default {
      data() {
          return {
          statusMsg: this.$t("Common.Status.Msg.Idle")
          }
      },
      watch: {
          // Watch for status update
          viewStateStatus: function() {
          this.statusMsg = this.$store.getters.getStatus;
          }
      },
      computed: {
          viewStateStatus: function(){
          return this.$store.getters.getStatus;
          }
      }
    };
</script>

<template>
  <b-container fluid> <!-- Status -->
      <b-row>
        <b-col sm="2">
          <label for="status">{{ $t('Common.Status.Name.Global.Status') }}:</label>
        </b-col>
        <b-col sm="10">
          <b-form-textarea
            id="status"
            v-bind:placeholder="$t('Common.Status.Name.Global.Status')"
            v-model="statusMsg"
            :disabled=true
            rows="1"
            max-rows="8">
          </b-form-textarea>
        </b-col>
      </b-row>
    </b-container>
</template>