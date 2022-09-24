<template v-slot:label>
    <p class="icon is-right font-weight-bold" :style="getStyle">
        {{ getLabel }}
        <span :id="ttid"><i :style="getIconStyle" class="ttqmark far fa-question-circle"></i></span>
        <b-tooltip v-bind:target="ttid" triggers="hover">
            {{ tooltip }}
        </b-tooltip>
    </p>
</template>

<script>
    import i18n from '../../../i18n'
    export default{
        name: "WTNGttlabel",
        props:{
            tt:{
                type:String
            },
            size:{
                type:String,
                default: "20px"
            },
            color:{
                type:String,
                default: 'black'
            },
            iconColor:{
                type:String,
                default: 'limegreen'
            },
            label:{
                type: String
            }
        },
        computed:{
            ttid: function () {
                return this.makeid(16)
            },
            tooltip: function() {
                return i18n.t(this.tt);
            },
            getLabel: function() {
                return i18n.t(this.label);
            },
            getStyle: function(){
                return {
                    color: this.color,
                    fontSize: this.size
                }
            },
            getIconStyle: function(){
                return {
                    color: this.iconColor,
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