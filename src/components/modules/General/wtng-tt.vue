<template>
    <span class="icon is-right" v-bind:id="ttid">
        <b-tooltip v-bind:target="ttid" triggers="hover">
            {{ tooltip }}
        </b-tooltip>
        <i :style="getStyle" class="ttqmark far fa-question-circle"></i>
    </span>
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
                default: 'limegreen'
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