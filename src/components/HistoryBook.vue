<template>
    <div class="flex flex-col items-center gap-1 m-1 relative" @click="this.$emit('click', book._id)">
        <ImageComponent :label="book.title" container_class="min-w-50 min-h-70 max-w-50 max-h-70 p-inputtext !p-0" class="object-cover !w-50 !h-70" :src='book.cover_url'/>
        <i v-if="book.pinned" class="pi pi-bookmark-fill absolute top-0 left-0 border rounded-xl border-border-surface p-1 bg-surface-200 dark:bg-surface-700 transform -translate-x-1/8 -translate-y-1/8" :class="{'!bg-(--p-red-300)': pinned_request_err, '!bg-(--p-green-300)': pinned_request_succes}" style="font-size: 1rem" @click="(e)=>{pinned(false); e.stopImmediatePropagation();}"></i>
        <i v-else class="pi pi-bookmark absolute top-0 left-0 border rounded-xl border-border-surface p-1 bg-surface-200 dark:bg-surface-700 transform -translate-x-1/8 -translate-y-1/8" :class="{'!bg-(--p-red-300)': pinned_request_err, '!bg-(--p-green-300)': pinned_request_succes}" style="font-size: 1rem" @click="(e)=>{pinned(true); e.stopImmediatePropagation();}"></i>
        <Rating v-model="book.rating" :stars="5" readonly />
    </div>
</template>

<script>
    import { useAuthStore } from '@/stores/auth';
    import { mapStores } from 'pinia';
    import Panel from 'primevue/panel';
    import InputText from 'primevue/inputtext';
    import Password from 'primevue/password';
    import Button from 'primevue/button';
    import FloatLabel from 'primevue/floatlabel';
    import SelectButton from 'primevue/selectbutton';
    import FileUpload from 'primevue/fileupload';
    import { Message } from 'primevue';
    import Divider from 'primevue/divider';
    import IconField from 'primevue/iconfield';
    import InputIcon from 'primevue/inputicon';
    import Avatar from 'primevue/avatar';
    import axios from 'axios';
    import ProgressBar from 'primevue/progressbar';
    import Skeleton from 'primevue/skeleton';
    import ScrollPanel from 'primevue/scrollpanel';
    import Rating from 'primevue/rating';

    import ImageComponent from './ImageComponent.vue';

    import router from "@/router";

    export default {
        props:["book"],
        emits: [
            "click",
            "update:book"
    ],
        components: { 
            Panel, 
            InputText, 
            Password, 
            Button,
            FloatLabel,
            SelectButton,
            FileUpload,
            Message,
            Divider,
            IconField,
            InputIcon,
            Avatar,
            ProgressBar,
            Skeleton,
            ScrollPanel,
            ImageComponent,
            Rating,
        },
        computed:{
        ...mapStores(useAuthStore)
        },
        mounted(){
        
        },

        data(){
            return {
                pinned_request_err: false,
                pinned_request_succes: false,
            }
        },
        methods:{
            async pinned(pinned_flag){
                this.$props.book.pinned = pinned_flag;

                this.pinned_request_err = false;
                this.pinned_request_succes = false;

                try{
                    const response = await axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_BOOK_PINNED_URL, {bookmark:{"book_id": this.$props.book._id, "pinned": pinned_flag}, token: this.AuthStore.token});
                    
                    this.pinned_request_succes = true;
                    setTimeout(()=>{
                        this.pinned_request_succes = false;
                    },1000);
                }
                catch (err) {
                    if ("status" in err && err.response.status===401) {
                        this.AuthStore.failAuthHandler();
                    }

                    this.pinned_request_err = true;
                    setTimeout(()=>{
                        this.pinned_request_err = false;
                    },1000);
                }
            }
        }
    };
</script>