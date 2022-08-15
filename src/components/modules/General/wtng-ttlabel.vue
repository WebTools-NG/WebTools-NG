<template>
    <div class="icon is-right">
                {{$t(`Modules.PMS.Settings.SettingsFilter`)}}
                <b-tooltip target="FilterSettingsTT" triggers="hover">
                    {{ $t(`Modules.PMS.Settings.TTSettingsFilter`) }}
                </b-tooltip>
                <span id="FilterSettingsTT"><i :style="getStyle" class="ttqmark far fa-question-circle"></i></span>
            </div>
</template>

<script>
    import i18n from '../../../i18n'
    export default{
        props:{
            tt:{
                type:String
            },
            size:{
                type:String
            },
            color:{
                type:String,
                default: 'teal'
            }
        },
        computed:{
            ttid: function () {
                return this.makeid(16)
            },
            tooltip: function() {
                return i18n.t(this.tt);
            },
            getStyle: function(){
                return {
                    color: this.color,
                    fontSize: this.size
                }
            }
        },
        methods:{
          makeid: function(length) {
                var result           = '';
                var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                var charactersLength = characters.length;
                for ( var i = 0; i < length; i++ ) {
                    result += characters.charAt(Math.floor(Math.random() * 
                charactersLength));
                }
                return result;
            }

        }
    }
</script>
<style scoped>
    i.ttqmark{
        margin-left:5px;
    }
</style>