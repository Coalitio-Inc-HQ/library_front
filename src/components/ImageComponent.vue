<template>
    <div :class="this.$props.container_class" class="overflow-hidden" :style="this.$props.use_background_image? `background: url('${this.$props.src}');`: ''">
        <template v-if="this.src">
            <template v-if="!this.loaded_image || this.error_loading">
                <Skeleton  :class="this.$props.class"></Skeleton>
            </template>
            <img :src="this.$props.src" @load="this.loaded_image=true" @error="this.error_loading=true;" :class="this.$props.class" loading="lazy" >
        </template>
        <div v-else class="flex items-center bg-primary-200" :class="this.$props.class">
            <h1 class="grow text-center text-wrap whitespace-pre-wrap">{{this.label}}</h1>
        </div>
    </div>
</template>
  
<script>
    import Skeleton from 'primevue/skeleton';
    export default {
        components:{
            Skeleton,
        },

        props: [
            "src",
            "label",
            "class",
            "container_class",
            "use_background_image"
        ],

        watch: { 
            'src': {
                handler() {
                    this.loaded_image = false;
                    this.error_loading = false;
                },
                deep: true,
                immediate: true,
            },
        },
        data(){
            return{
            loaded_image: false,
            error_loading: false,
            }
        },
    };
</script>
