<template>
    <div class="flex flex-col p-4 overflow-x-hidden overflow-y-auto size-full">
        <div v-if="history_books.length">
            <H2 class="italic">Недавние книги</H2>
            <Divider class="!m-1 !p-1"/>
            <template v-if="loading_history_books">
                <div class="flex flex-row flex-nowrap gap-1 overflow-x-auto snap-x">
                    <Skeleton v-for="i in 20" :key="i" class="min-w-30 min-h-50 max-w-30 max-h-50 snap-center"></Skeleton>
                </div>
                <Message class="w-full text-wrap whitespace-pre-wrap" v-if="loading_history_books" severity="error">{{loading_history_books}}</Message>
            </template>
            <template v-else>
                <div class="flex flex-row flex-nowrap gap-1 overflow-x-auto snap-x">
                    <template v-for="(item, index) in history_books" :key="item.book_id">
                        <HistoryBook v-model:book="item.book" @click="select_book"/>
                    </template>
                </div>
            </template>
        </div>
        <div class="grow">
            <div class="flex flex-row items-center">
                <SelectButton v-model="selected_mode" class="font-mono italic" :options="['закреплённые', 'мои']"/>
                <p class="italic">книги</p>
            </div>
            <Divider class="!m-1 !p-1"/>

            <!-- <div class="flex flex-row flex-wrap  items-center gap-1 mt-2 mb-2 p-inputtext">
                <p class="text-nowrap">Сортировать</p>
                <Select :options="['закреплённые', 'мои']" v-model="selected_mode" />
                <p class="text-nowrap">книги по</p>
                <Select :options="['индентификатору']" v-model="selected_feild" />
                <p class="text-nowrap">в проядке</p>
                <Select :options="['возрастания','убывания']" v-model="selected_order" />
                <Button label="Отсортировать" @click="decode_get_books(selected_mode, selected_feild, selected_order)"/>
            </div> -->

            <template v-if="loading_books">
                <!-- <div class="flex flex-col gap-1 snap-y">
                    <Skeleton v-for="i in 20" :key="i" class="min-w-30 min-h-50 max-w-30 max-h-50 snap-center"></Skeleton>
                </div> -->
            </template>
            <template v-else>
                <div class="flex flex-wrap">
                    <template v-for="(item, index ) in books" :key="item._id">
                        <HistoryBook v-model:book="books[index]" @click="select_book"/>
                    </template>
                </div>
            </template>
        </div>
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
    import Select from 'primevue/select';

    import HistoryBook from './HistoryBook.vue';

    // import axios from 'axios';

    import router from "@/router";

    const decode_mode = {
        'закреплённые': 'pinned',
        'мои': 'my',
    }
    const decode_feild = {
        'индентификатору': '_id',
    }
    const decode_order = {
        'возрастания': '1',
        'убывания': '-1',
    }

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
            Avatar,
            ProgressBar,
            Skeleton,
            ScrollPanel,
            HistoryBook,
            Select,
        },
        computed:{
        ...mapStores(useAuthStore)
        },
        mounted(){
            this.loading_history_books = true;
            axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_GET_HISTORY_BOOK_URL,
                {
                    token: this.AuthStore.token,
                }
            ).then(
                (response)=>{
                    this.history_books = response.data;
                    this.loading_history_books = false;
                }
            ).catch((err)=>{
                if ("status" in err && err.response.status===401) {
                    this.AuthStore.failAuthHandler();
                }
                this.error_loading_history_books = "Непредвиденная ошибка загрузки истории книги";
            });

            this.decode_get_books(this.selected_mode, this.selected_feild, this.selected_order);
        },

        watch:{
            selected_mode(newValue, oldValue){
                if (newValue){
                    this.decode_get_books(newValue, this.selected_feild, this.selected_order);
                }else{
                    throw "fail";
                    // this.selected_mode = oldValue;
                }
            }
        },

        data(){
            return {
                history_books: [],
                loading_history_books: false,
                error_loading_history_books: null,

                books: [],
                loading_books: false,
                error_loading_books: false,

                selected_mode: 'закреплённые',
                selected_feild: 'индентификатору',
                selected_order: 'возрастания',
            }
        },
        methods:{
            select_book(id){
                router.push(`/book/${id}`);
            },

            async decode_get_books(mode, sort_feld, sort_order){
                await this.get_books(decode_mode[mode], decode_feild[sort_feld], decode_order[sort_order]);
            }, 

            async get_books(mode, sort_feld, sort_flag){
                this.books = [];
                this.error_loading_books = false;

                this.loading_books = true;
                try{
                    const response = await axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_GET_BOOK_LIST_SORTED_URL, {mode: mode,sort_feld: sort_feld, sort_flag:sort_flag, token: this.AuthStore.token});
                    this.books = response.data;
                }
                catch (err) {
                    if ("status" in err && err.response.status===401) {
                        this.AuthStore.failAuthHandler();
                    }

                    this.error_loading_books = true;
                }
                this.loading_books = false;
            }
        }
        // setup() {
        //     const authStore = useAuthStore();
        //     const username = ref('');
        //     const password = ref('');

        //     const handleLogin = () => {
        //         authStore.login({ username: username.value, password: password.value });
        //     };

        //     return { username, password, handleLogin, error: authStore.error };
        // }
    };
</script>