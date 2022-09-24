<template>
    <b-container class="m-2 mt-2">
        <div>   <!-- Title and desc -->
            <h2>
                {{ $t(`Modules.PMS.Butler.Name`) }}
            </h2>
            <h5>{{ $t(`Modules.PMS.Butler.Description`) }}</h5>
        </div>
        <br>
        <div class="d-flex align-items-center">
            <b-form-group>
                <WTNGttlabel tt="Modules.PMS.Butler.TTSelectTask" label="Modules.PMS.Butler.SelectTask" />
                <b-form-select
                v-model="selTask"
                id="selTask"
                :options="selTaskOptions"
                style="width: auto"
                name="selTask">
                </b-form-select>
            </b-form-group>
        </div>
        <br>
        <br>
        <div class="buttons">
            <!-- Buttons -->
            <div id="buttons" class="text-center">
                <b-button-group >
                    <b-button variant="success" class="mr-1" :disabled="this.selTask == ''" @click="executeButlerTask"> {{ $t('Modules.PMS.Butler.RunTask') }} </b-button>
                </b-button-group>
            </div>
        </div>
  </b-container>
</template>

<script>
    const log = require("electron-log");
    import i18n from '../../../../i18n';
    import store from '../../../../store';
    import WTNGttlabel from '../../General/wtng-ttlabel.vue'
    export default {
        components: {
            WTNGttlabel
        },
        data() {
            return {
                selTaskOptions: [
                    {
                    "text": i18n.t('Modules.PMS.Butler.BackupDatabase'),
                    "value": "BackupDatabase"
                    },
                    {
                    "text": i18n.t('Modules.PMS.Butler.BuildGracenoteCollections'),
                    "value": "BuildGracenoteCollections"
                    },
                    {
                    "text": i18n.t('Modules.PMS.Butler.CheckForUpdates'),
                    "value": "CheckForUpdates"
                    },
                    {
                    "text": i18n.t('Modules.PMS.Butler.CleanOldBundles'),
                    "value": "CleanOldBundles"
                    },
                    {
                    "text": i18n.t('Modules.PMS.Butler.CleanOldCacheFiles'),
                    "value": "CleanOldCacheFiles"
                    },
                    {
                    "text": i18n.t('Modules.PMS.Butler.DeepMediaAnalysis'),
                    "value": "DeepMediaAnalysis"
                    },
                    {
                    "text": i18n.t('Modules.PMS.Butler.GenerateAutoTags'),
                    "value": "GenerateAutoTags"
                    },
                    {
                    "text": i18n.t('Modules.PMS.Butler.GenerateChapterThumbs'),
                    "value": "GenerateChapterThumbs"
                    },
                    {
                    "text": i18n.t('Modules.PMS.Butler.GenerateMediaIndexFiles'),
                    "value": "GenerateMediaIndexFiles"
                    },
                    {
                    "text": i18n.t('Modules.PMS.Butler.OptimizeDatabase'),
                    "value": "OptimizeDatabase"
                    },
                    {
                    "text": i18n.t('Modules.PMS.Butler.RefreshLibraries'),
                    "value": "RefreshLibraries"
                    },
                    {
                    "text": i18n.t('Modules.PMS.Butler.RefreshLocalMedia'),
                    "value": "RefreshLocalMedia"
                    },
                    {
                    "text": i18n.t('Modules.PMS.Butler.RefreshPeriodicMetadata'),
                    "value": "RefreshPeriodicMetadata"
                    },
                    {
                    "text": i18n.t('Modules.PMS.Butler.UpgradeMediaAnalysis'),
                    "value": "UpgradeMediaAnalysis"
                    }
                ],
                selTask : "",
            };
        },
        created() {
            log.info("PMS Butler Created");
            this.serverSelected();
        },
        computed: {
            selectedServerAddress: function(){
                return this.$store.getters.getSelectedServerAddress;
            }
        },
        methods: {
            async executeButlerTask() {
                log.debug(`Starting Butler Task: ${this.selTask}`);
                await store.dispatch('startButlerTask', {
                    Token: this.$store.getters.getAuthToken,
                    Address: this.$store.getters.getSelectedServerAddress,
                    Job: this.selTask});
                this.$bvToast.toast(this.$t("Modules.PMS.Butler.TaskDetails"), {
                    title: this.$t("Modules.PMS.Butler.TaskStarted"),
                    autoHideDelay: 4000,
                    solid: true,
                    variant: 'primary',
                    toaster: 'b-toaster-bottom-right'
                    });
            },
            async serverSelected() {
                let serverCheck = this.$store.getters.getSelectedServer;
                if (serverCheck == "none") {
                    log.debug("serverCheck is none");
                    this.$bvToast.toast(this.$t("Modules.PMS.ErrorNoServerSelectedMsg"), {
                        title: this.$t("Modules.PMS.ErrorNoServerSelectedTitle"),
                        autoHideDelay: 4000,
                        solid: true,
                        variant: 'primary',
                        toaster: 'b-toaster-bottom-right'
                        }
                    );
                }
            }
        }
    };

</script>
<style scoped>
    .outDirbox{
        margin-right:10px;
    }
    #b-form-group{
        margin-top: 20px;
    }

</style>
