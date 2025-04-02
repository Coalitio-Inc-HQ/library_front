<template>
    <div class="flex flex-col size-full">
        <div class="bg-surface-500 dark:bg-surface-500">
            <div class="flex items-center gap-5 p-1">
                <h1 class="font-mono text-2xl italic font-semibold">Библиотека<i class="pi pi-book !text-xl p-1 rotate-10"/></h1>
                <IconField class="grow max-w-sm">
                    <InputText class="w-full" placeholder="Поиск" v-model="serch_text" ref="serch_field"/>
                    <InputIcon class="pi pi-search" />
                </IconField>
            </div>
        </div>
        <div class="grow flex overflow-hidden">
            <div class="flex flex-col bg-surface-200 dark:bg-surface-700">
                <Button v-if="!visible_left_panel" class="w-full" icon="pi pi-angle-double-right" severity="secondary" variant="text" @click="visible_left_panel=true"/>
                <Button v-if="visible_left_panel" class="w-full" icon="pi pi-angle-double-left" severity="secondary" variant="text" @click="visible_left_panel=false" label="Свернуть"/>
                <Button :class="{'w-full':true,'!bg-primary-200':this.splitedPath[1]==='user'}" :label="visible_left_panel?'Профиль': null" icon="pi pi-user" variant="text" severity="secondary" @click="this.$router.push('/user')"/>
                <Button :class="{'w-full':true,'!bg-primary-200':this.splitedPath[1]==='books'}" :label="visible_left_panel?'Книги': null" icon="pi pi-book" variant="text" severity="secondary" @click="this.$router.push('/books')"/>
                <Button :class="{'w-full':true,'!bg-primary-200':this.splitedPath[1]==='upload', 'text-nowrap': true}" :label="visible_left_panel?'Загрузить книгу': null" icon="pi pi-upload" variant="text" severity="secondary" @click="this.$router.push('/upload')"/>
                <div class="grow"/>
                <Button class="w-full" :label="visible_left_panel?'Выйти': null" icon="pi pi-sign-out" variant="text" severity="secondary" @click="log_out"/>
            </div>
            <div class="grow overflow-hidden">
                <!-- class="grow overflow-x-hidden overflow-y-auto" -->
                <router-view :key="$route.fullPath"/>
            </div>
        </div>
    </div>
    <Popover ref="tutorialpopover" >
        <div class="flex flex-col gap-2">
            <h3 class="italic">Результаты поиска</h3>
            <Divider class="!m-1 !p-1"/>
            <template v-if="serch_res && serch_res.length">
                <div class="w-full flex felx-row items-center gap-1" v-for="item in serch_res" :key="item._id" @click="select_book(item._id)">
                    <!-- <ImageComponent :label="item.title" container_class="min-w-10 min-h-14 max-w-10 max-h-14 p-inputtext !p-0" class="object-cover !w-10 !h-14" :src='item.cover_url'/> -->
                    {{ item.title }}
                </div>
            </template>
            <template v-else>
                Найденых книг нету
            </template>
        </div>
      </Popover>
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
    import Popover from 'primevue/popover';

    import router from "@/router";

    import axios from 'axios';

    import ImageComponent from '@/components/ImageComponent.vue';

    let search_time_out = null;

    export default {
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
            Popover,
            ImageComponent,
        },
        computed:{
        ...mapStores(useAuthStore),
            splitedPath() {
                return this.$route.path.split('/');
            }
        },
        mounted(){
            if (!this.AuthStore.token){
                router.push('/login');
            }
        },

        data(){
            return {
                visible_left_panel: false,
                serch_text: null,

                serch_res: [],
            }
        },

        watch:{
            async serch_text(newValue){
                this.showPopover();
                this.search();
            }
        },

        methods:{
            log_out(){
                this.AuthStore.logout();
                router.push("/login");
            },

            showPopover(){
            setTimeout(() => {
                this.$refs.tutorialpopover.show({ "currentTarget": null }, this.$refs.serch_field.$el);
            }, 0);
            },

            search(){

                clearTimeout(search_time_out);
    
                search_time_out = setTimeout(() => {
                    axios.post(
                        import.meta.env.VITE_BASE_URL+import.meta.env.VITE_BOOK_SEARCH_URL, 
                        {
                            keyword: this.serch_text,
                            token: this.AuthStore.token
                        }
                    ).then((res)=>{
                        this.serch_res = res.data;
                    })
                }, 500);
            },

            select_book(id){
                router.push(`/book/${id}`);
                this.$refs.tutorialpopover.hide();
            },
        }
    };
</script>