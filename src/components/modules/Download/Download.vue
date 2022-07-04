<template>
  <div>
    <div class="text-right">   <!-- Settings button -->
      <div class="buttons">
        <!-- Buttons -->
        <div id="buttons">
            <b-button-group id="settings">
              <b-tooltip target="settings" triggers="hover">
                  {{ $t(`Modules.${this.PageName}.ttSettings`) }}
              </b-tooltip>
              <!-- Set class d-none if not used, but keep on page for spacing -->
              <!-- <button class="btn btn-outline-success d-none" @click="showSettings"><i class="fa fa-cog"></i></button> -->
              <button class="btn btn-outline-success d-none"><i class="fa fa-cog"></i></button>
            </b-button-group>
        </div>
      </div>
    </div>
    <b-container fluid>
      <div>   <!-- Title and desc -->
        <h2>
          {{ $t(`Modules.${this.PageName}.Name`) }}
        </h2>
        <h5>{{ $t(`Modules.${this.PageName}.Description`) }}</h5>
      </div>
      <br>
      <br>


    </b-container>
  </div>
</template>

<script>
  //import i18n from '../../../i18n';
  //import store from '../../../store';
  //import { wtconfig, wtutils } from '../General/wtutils';

  const log = require("electron-log");
  export default {
      data() {
        return {
          PageName: "Download"
        };
  },
  created() {
    log.info(`[${this.PageName}.vue] (created) - ${this.PageName} Created`);
  },
  methods: {
  },
  watch: {
  },
  computed: {
  }
};
</script>
