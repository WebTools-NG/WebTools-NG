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
                default: 'teal'
            }
        },
        computed:{
            ttid: function () {
                return this.tt;
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
        }
    }
</script>
<style scoped>
    i.ttqmark{
        margin-left:5px;
    }
</style>