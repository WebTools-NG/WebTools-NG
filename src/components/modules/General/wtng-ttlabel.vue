<template v-slot:label>
    <span class="icon is-right font-weight-bold" v-bind:id="ttid">
        <!--<slot name="label"></slot>-->
        <span size="lg">
        {{ label }}
        </span>
        <b-tooltip v-bind:target="ttid" triggers="hover">
            {{ tooltip }}
        </b-tooltip>
        <span id="ttid"><i :style="getStyle" class="ttqmark far fa-question-circle"></i></span>
    </span>
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
                default: "lg"
            },
            color:{
                type:String,
                default: 'teal'
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
                console.log('Ged 44-3', this.tt)
                return i18n.t(this.tt);
            },
            getLabel: function() {
                return this.label;
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