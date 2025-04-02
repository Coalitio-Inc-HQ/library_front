<template>
    <div class="overflow-x-hidden overflow-y-auto size-full">
        <div class="flex flex-col p-4">
            <h2 class="italic">Сведения о книге</h2>
            <Divider class="!m-1 !p-1"/>
            <div v-if="!loading_book">
                <div class="flex flex-wrap gap-3">
                    <div class="flex flex-col items-center gap-1">
                        <div class="relative">
                            <ImageComponent :label="book.title?book.title:'<Обложка книги>\n<Название книги>'" container_class="min-w-50 min-h-70 max-w-50 max-h-70 p-inputtext !p-0" class="object-cover !w-50 !h-70" :src='book.cover_url'/>
                            <!-- <Skeleton class="min-w-50 min-h-70 max-w-50 max-h-70"></Skeleton> -->
                            <i v-if="can_edit_book" class="pi pi-pencil absolute top-0 right-0 border rounded-xl border-border-surface p-1 bg-surface-200 dark:bg-surface-700 transform translate-x-1/8 -translate-y-1/8" style="font-size: 1rem" @click="upload_cover"></i>
                            <template v-if="book._id">
                                <i v-if="book.pinned" class="pi pi-bookmark-fill absolute top-0 left-0 border rounded-xl border-border-surface p-1 bg-surface-200 dark:bg-surface-700 transform -translate-x-1/8 -translate-y-1/8" :class="{'!bg-(--p-red-300)': pinned_request_err, '!bg-(--p-green-300)': pinned_request_succes}" style="font-size: 1rem" @click="pinned(false)"></i>
                                <i v-else class="pi pi-bookmark absolute top-0 left-0 border rounded-xl border-border-surface p-1 bg-surface-200 dark:bg-surface-700 transform -translate-x-1/8 -translate-y-1/8" :class="{'!bg-(--p-red-300)': pinned_request_err, '!bg-(--p-green-300)': pinned_request_succes}" style="font-size: 1rem" @click="pinned(true)"></i>
                            </template>
                            <ProgressBar v-if="this.cover_upload_info.uploading" class="!h-[5px] absolute bottom-0 w-full  transform -translate-y-full" :value="this.cover_upload_info.progress*100">{{ "" }}</ProgressBar>
                        </div>
                        <Rating v-model="book.rating" :stars="5" :readonly="!can_edit_book"/>
                    </div>
                    <div class="w-full sm:w-auto flex flex-col gap-3">
                        <FloatLabel variant="on">
                            <InputText class="w-full" id="title" v-model:modelValue="book.title" :disabled="!can_edit_book"/>
                            <label for="title">Название</label>
                        </FloatLabel>

                        <div class="p-inputtext !p-0 relative">
                            <Button v-if="!book.file_url" class="w-full" label="Загрузить книгу" icon="pi pi-file-arrow-up" variant="text" severity="secondary" @click="upload_file"/>
                            <template v-else>
                                <Button class="w-full" label="Скачать книгу" icon="pi pi-book" variant="text" severity="secondary" @click="download(this.book.file_url, this.book.title)"/>
                                <i v-if="can_edit_book" class="pi pi-pencil absolute top-0 right-0 border rounded-xl border-border-surface p-1 bg-surface-200 dark:bg-surface-700 transform translate-x-1/8 -translate-y-1/8" style="font-size: 1rem" @click="upload_file"></i>
                            </template>

                            <ProgressBar v-if="this.file_upload_info.uploading" class="!h-[5px] w-full" :value="this.file_upload_info.progress*100">{{ "" }}</ProgressBar>
                        </div>

                        <div class="grow"/>

                        <Message class="w-full text-wrap whitespace-pre-wrap" v-if="last_error" severity="error">{{last_error}}</Message>
                        <Message class="w-full" v-if="succes" severity="info">Операция выполена</Message>

                        <template v-if="!await_request">
                            <template v-if="book._id">
                                <Button v-if="can_edit_book" class="" label="Обновить книгу" icon="pi pi-save" @click="book_update"/>
                                <Button v-else class="" label="Редактировать книгу" icon="pi pi-save" @click="can_edit_book=true"/>
                            </template>
                            <Button v-else class="" label="Сохранить книгу" icon="pi pi-save" @click="create_book"/>
                        </template>
                        <Button v-else disabled="true">Изменения сохраняются</Button>
                    </div>
                    <div class="w-full sm:w-auto flex flex-col gap-3">
                        <template v-for="(item, index) in book.author" :key="index">
                            <FloatLabel variant="on">
                                <InputText class="w-full" :id="`author${index}`" v-model:modelValue="book.author[index]" :disabled="!can_edit_book"/>
                                <label :for="`author${index}`">{{`Автор${index}`}}</label>
                                <i v-if="can_edit_book" class="pi pi-minus absolute top-0 right-0 border rounded-xl border-border-surface p-1 bg-surface-200 dark:bg-surface-700 transform translate-x-1/8 -translate-y-1/8" style="font-size: 0.5rem" @click="()=>{book.author.splice(index, 1);}"></i>
                            </FloatLabel>
                        </template>
                        <div class="grow"/>
                        <Button v-if="can_edit_book" class="" label="Добавить автора" icon="pi pi-plus" @click="()=>{book.author.push(null);}"/>
                    </div>
                    <FloatLabel class="grow" variant="on">
                        <Textarea  class="!w-full !h-full" rows=10 id="description" v-model:modelValue="book.description" :disabled="!can_edit_book"/>
                        <label for="description">Описание</label>
                    </FloatLabel>
                </div>
            </div>
            
            <div v-else>
                <div class="flex flex-wrap gap-3">
                    <div class="flex flex-col items-center gap-1">
                        <div class="relative">
                            <Skeleton class="min-w-50 min-h-70 max-w-50 max-h-70"></Skeleton>
                        </div>
                        <!-- <Rating v-model="book.rating" :stars="5" readonly /> -->
                    </div>
                    <div class="min-w-50 sm:w-auto flex flex-col gap-3">
                        <Skeleton class="w-full min-h-10 "></Skeleton>
                        <Skeleton class="w-full min-h-10 "></Skeleton>
                        <Skeleton class="w-full min-h-10 "></Skeleton>
                        <div class="grow"/>
                        <Skeleton class="w-full min-h-10 "></Skeleton>
                    </div>
                    <div class="min-w-50 sm:w-auto flex flex-col gap-3">
                        <template v-for="index in 5" :key="index">
                            <Skeleton class="w-full min-h-10 "></Skeleton>
                        </template>
                        <div class="grow"/>
                        <Skeleton class="w-full min-h-10 "></Skeleton>
                    </div>
                    <Skeleton class="w-full min-h-40 "></Skeleton>
                    <Message class="w-full text-wrap whitespace-pre-wrap" v-if="loading_book_error" severity="error">{{loading_book_error}}</Message>
                </div>
            </div>

            <template v-if="book._id">
                <h3 class="italic pt-1">Отзывы</h3>
                <Divider class="!m-1 !p-1"/>

                <div class="flex flex-col gap-1">
                    <template v-if="!loading_revew">
                        <Inplace>
                            <template #display>Написать новый отзыв</template>
                            <template #content>
                                <Panel toggleable>
                                    <template #header>
                                        <h3 class="pr-1">Новый отзыв</h3>
                                        <!-- <Rating v-model:modelValue="review.rating" :stars="5" /> -->
                                        <div class="grow"/>
                                    </template>
                                    
                                    <FloatLabel class="grow" variant="on">
                                        <Textarea  class="!w-full !h-full" rows=10 id="review_text" v-model:modelValue="review.comment"/>
                                        <label for="review_text">Отзыв</label>
                                    </FloatLabel>
                                    <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="last_error_revew" severity="error">{{last_error_revew}}</Message>
                                    <Message class="w-full mt-1" v-if="succes_revew" severity="info">Операция выполена</Message>
                                    <Button class="mt-1" label="Сохранить" icon="pi pi-save" @click="save_revew" />
                                </Panel>
                            </template>
                        </Inplace>
                    </template>
                    <template v-else>
                        <Skeleton class="w-full min-h-10 "></Skeleton>
                    </template>

                    <template v-if="!loading_revewes">
                        <div class="p-inputtext !p-1 relative" v-for="(item, index ) in reviews">
                            <i class="pi pi-pencil absolute top-0 right-0 border rounded-xl border-border-surface p-1 bg-surface-200 dark:bg-surface-700 transform translate-x-1/8 -translate-y-1/8" style="font-size: 0.5rem" @click="item.edit=true;"></i>
                            <template v-if="item.edit">
                                <FloatLabel class="grow" variant="on">
                                    <Textarea  class="!w-full !h-full" rows=10 id="review_text" v-model:modelValue="item.comment"/>
                                    <label for="review_text">Отзыв</label>
                                </FloatLabel>
                                <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="item.errors" severity="error">{{item.errors}}</Message>
                                <Button class="mt-1" label="Сохранить" icon="pi pi-save" @click="update_revew(index)" />
                            </template>
                            <p v-else class="text-wrap whitespace-pre-wrap">{{ item.comment }}</p>
                            <Message class="w-full mt-1" v-if="item.succes" severity="info">Операция выполена</Message>
                            <p class="text-right text-xs">{{ `${item.created_at.getFullYear()}-${String(item.created_at.getMonth() + 1).padStart(2, '0')}-${String(item.created_at.getDate()).padStart(2, '0')} ${String(item.created_at.getHours()).padStart(2, '0')}:${String(item.created_at.getMinutes()).padStart(2, '0')}` }}</p>
                        </div>
                    </template>
                    <template v-else>
                        <Skeleton class="w-full min-h-10 "></Skeleton>
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
    import Textarea from 'primevue/textarea';
    import ToggleButton from 'primevue/togglebutton';
    import ToggleSwitch from 'primevue/toggleswitch';
    import Rating from 'primevue/rating';
    import Inplace from 'primevue/inplace';

    import ImageComponent from '@/components/ImageComponent.vue'

    

    import router from "@/router";
    import { comment } from 'postcss';

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
            Textarea,
            ToggleButton,
            ToggleSwitch,
            ImageComponent,
            Rating,
            Inplace,
        },
        props:[
            
        ],
        computed:{
            ...mapStores(useAuthStore),
        },
        mounted(){
            if (this.$route.params.id){
                this.loading_book = true;
                axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_GET_BOOK_URL,
                    {
                        book_id: this.$route.params.id,
                        token: this.AuthStore.token,
                    }
                ).then(
                    (response)=>{
                        this.old_book = JSON.parse(JSON.stringify(response.data));
                        this.book = response.data;
                        this.loading_book = false;
                        this.can_edit_book = false;
                    }
                ).catch((err)=>{
                    if ("status" in err && err.response.status===401) {
                        this.AuthStore.failAuthHandler();
                    }
                    this.loading_book_error = "Непредвиденная ошибка загрузки книги";
                })

                this.loading_revewes = true;
                axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_REVEW_GET_LIST_URL,
                    {
                        book_id: this.$route.params.id,
                        token: this.AuthStore.token,
                    }
                ).then(
                    (response)=>{
                        if (response.data){
                            let reviews = response.data;
                            reviews.forEach((item)=>{
                                item.exdit=false;
                                item.errors=null;
                                item.succes=false;
                                item.created_at = new Date(item.created_at+"Z");
                            });
                            this.reviews = response.data;
                        }
                        this.loading_revewes = false;
                    }
                ).catch((err)=>{
                    if ("status" in err && err.response.status===401) {
                        this.AuthStore.failAuthHandler();
                    }
                    this.loading_revewes_error = "Непредвиденная ошибка загрузки отзывов";
                })
            }
        },

        data(){
            return {
                can_edit_book: true,

                loading_book: false,
                loading_book_error: null,

                loading_revew: false,
                loading_revew_error: null,

                loading_revewes: false,
                loading_revewes_error: null,

                last_error_revew: null,
                await_request_revew: false,
                succes_revew: false,

                pinned_request_err: false,
                pinned_request_succes: false,

                last_error: null,
                await_request: false,
                succes: false,
                book:{
                    _id: null,
                    user_id: null,
                    title: null,
                    author: [null],
                    description: null,
                    file_url: null,
                    cover_url: null,
                    visible_other_users: false,
                    rating: 0,
                    
                    pinned: false,
                },
                old_book:{
                    _id: null,
                    user_id: null,
                    title: null,
                    author: [null],
                    description: null,
                    file_url: null,
                    cover_url: null,
                    visible_other_users: false,
                    rating: 0,

                    pinned: false,
                },
                cover_upload_info:{
                    uploading: false,
                    progress: 0,
                    uploaded: false,
                    uploaded_url: null,
                    fail: false,
                },
                file_upload_info:{
                    uploading: false,
                    progress: 0,
                    uploaded: false,
                    uploaded_url: null,
                    fail: false,

                    file_name: null,
                },

                review: {
                    _id: null,
                    comment: null,
                },

                old_review:{
                    _id: null,
                    comment: null,
                },

                reviews: []
            }
        },
        methods:{
            upload_cover(){
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';  // Ограничение на выбор изображений
                input.onchange = (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        this.cover_upload_info.uploading=true;
                        this.cover_upload_info.progress=0;
                        this.cover_upload_info.uploaded=false;
                        this.cover_upload_info.uploaded_url=null;
                        this.cover_upload_info.fail=false;

                        const formData = new FormData();
                        formData.append('file', file);
                        axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_UPLOAD_FILE_URL, formData, 
                        {
                            onUploadProgress: (e)=> {
                                this.cover_upload_info.progress = e.progress;
                            },
                        })
                        .then((response)=>{
                            this.cover_upload_info.uploading=false;
                            this.cover_upload_info.progress=1;
                            this.cover_upload_info.uploaded=true;
                            this.cover_upload_info.uploaded_url=response.data.url.url;
                            this.cover_upload_info.fail=false;

                            this.book.cover_url = response.data.url.url;
                        })
                        .catch((e)=>{
                            this.cover_upload_info.fail=true;
                            this.cover_upload_info.uploading=false;
                        })
                    }
                };
                input.click();
            },

            upload_file(){
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.epub,.mobi,.txt,.doc,.docx';  // Ограничение на выбор книг
                input.onchange = (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        this.file_upload_info.uploading=true;
                        this.file_upload_info.progress=0;
                        this.file_upload_info.uploaded=false;
                        this.file_upload_info.uploaded_url=null;
                        this.file_upload_info.fail=false;

                        this.file_upload_info.file_name=file.name;

                        const formData = new FormData();
                        formData.append('file', file);
                        axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_UPLOAD_FILE_URL, formData, 
                        {
                            onUploadProgress: (e)=> {
                                this.file_upload_info.progress = e.progress;
                            },
                        })
                        .then((response)=>{
                            this.file_upload_info.uploading=false;
                            this.file_upload_info.progress=1;
                            this.file_upload_info.uploaded=true;
                            this.file_upload_info.uploaded_url=response.data.url.url;
                            this.file_upload_info.fail=false;

                            this.book.file_url = response.data.url.url;
                        })
                        .catch((e)=>{
                            this.file_upload_info.fail=true;
                            this.file_upload_info.uploading=false;
                        })
                    }
                };
                input.click();
            },

            chek_felds(){
                let errors = [];

                if (!this.book.title){
                    errors.push('Не заполнено назваание книги');
                }

                if (this.book.author.length==0){
                    errors.push('Не заполены сведения об авторе');
                } else {
                    this.book.author.forEach((item, index)=>{
                        if (!item){
                            errors.push(`Не заполены сведения об авторе ${index}`);
                        }
                    })
                }

                if (this.cover_upload_info.uploading){
                    errors.push('Дождитесь загрузки обложки');
                }

                if (this.file_upload_info.uploading){
                    errors.push('Дождитесь загрузки книги');
                }

                if (!this.book.file_url){
                    errors.push('Не прикреплён файл книги');
                }

                return errors;
            },

            async create_book(){
                this.last_error = null;
                let errors = this.chek_felds();
                if (errors.length){
                    this.last_error = errors.join('\n');
                    return;
                }

                let data = {
                    title: this.book.title,
                    author: this.book.author,
                    file_url: this.book.file_url,
                    visible_other_users: this.book.visible_other_users,
                    rating: this.book.rating,
                }

                if (this.book.description){
                    data.description = this.book.description;
                }

                if (this.book.cover_url){
                    data.cover_url = this.book.cover_url;
                }
                
                this.await_request = true;
                try{
                    const response = await axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_CREATE_BOOK_URL, {book:data, token: this.AuthStore.token});
                    
                    // Сохранение сведений о книге
                    this.old_book =  JSON.parse(JSON.stringify(response.data));
                    this.book = response.data;
                    this.succes = true;
                    setTimeout(()=>{
                        this.succes = false;
                    },1000);
                    router.push(`/book/${this.book._id}`)
                }
                catch (err) {
                    if ("status" in err && err.response.status===401) {
                        this.AuthStore.failAuthHandler();
                    }

                    this.last_error = 'Непредвиденная ошибка';
                }
                this.await_request = false;
            },

            deepEqual(a, b){
                if (a === b) return true;
                if (Array.isArray(a) && Array.isArray(b)) {
                    return a.length === b.length && a.every((el, i) => this.deepEqual(el, b[i]));
                }
                if (typeof a === "object" && typeof b === "object" && a && b) {
                    const keysA = Object.keys(a);
                    const keysB = Object.keys(b);
                    return keysA.length === keysB.length && keysA.every(key => this.deepEqual(a[key], b[key]));
                }
                return false;
            },

            async book_update(){
                this.last_error = null;
                let errors = this.chek_felds();
                if (errors.length){
                    this.last_error = errors.join('\n');
                    return;
                }

                if (this.deepEqual(this.book,this.old_book)){
                    this.succes = true;
                    setTimeout(()=>{
                        this.succes = false;
                    },1000);
                    return;
                }

                let data = {
                    _id: this.book._id,
                    title: this.book.title,
                    author: this.book.author,
                    file_url: this.book.file_url,
                    visible_other_users: this.book.visible_other_users,
                    rating: this.book.rating,
                }

                if (this.book.description){
                    data.description = this.book.description;
                }

                if (this.book.cover_url){
                    data.cover_url = this.book.cover_url;
                }

                this.await_request = true;
                try{
                    const response = await axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_UPDATE_BOOK_URL, {book:data, token: this.AuthStore.token});
                   
                    // Сохранение сведений о книге
                    this.old_book =  JSON.parse(JSON.stringify(response.data));
                    this.book = response.data;
                    this.succes = true;
                    setTimeout(()=>{
                        this.succes = false;
                    },1000);
                    can_edit_book=false;
                }
                catch (err) {
                    if ("response" in err && err.response.status===401) {
                        this.AuthStore.failAuthHandler();
                    }

                    this.last_error = 'Непредвиденная ошибка';
                }
                this.await_request = false;
            },

            download(url, name){
                var link = document.createElement("a");
                link.download = name;
                link.href = url;
                link.click();
            },

            async save_revew(){
                this.last_error_revew = null;
                let errors = [];

                if (!this.review.comment){
                    errors.push("Не написан текст отзыва");
                }

                if (errors.length){
                    this.last_error_revew = errors.join('\n');
                    return;
                }

                if (this.deepEqual(this.review, this.old_review)){
                    this.succes_revew = true;
                    setTimeout(()=>{
                        this.succes_revew = false;
                    },1000);
                    return;
                }

                let data = {
                    book_id: this.book._id,
                    comment: this.review.comment,
                }

                if (this.review._id){
                    data._id = this.review._id;
                }


                this.await_request_revew = true;
                try{
                    const response = await axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_REVEW_CREATE_URL, {review:data, token: this.AuthStore.token});
                    response.data.created_at = new Date(response.data.created_at+"Z");

                    this.reviews.unshift(response.data);
                    this.old_review =  {
                        _id: null,
                        comment: null,
                    };
                    this.review = {
                        _id: null,
                        comment: null,
                    };
                    this.succes_revew = true;
                    setTimeout(()=>{
                        this.succes_revew = false;
                    },1000);
                }
                catch (err) {
                    if ("status" in err && err.response.status===401) {
                        this.AuthStore.failAuthHandler();
                    }

                    this.last_error_revew = 'Непредвиденная ошибка';
                }
                this.await_request_revew = false;
            },

            async update_revew(index){
                if (!this.reviews[index].comment){
                    this.reviews[index].errors="Поле коментария пусто";
                    return;
                }

                let data = {
                    _id: this.reviews[index]._id,
                    comment: this.reviews[index].comment,
                }

                try{
                    const response = await axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_REVEW_UPDATE_URL, {review:data, token: this.AuthStore.token});
                
                    this.reviews[index].succes = true;
                    this.reviews[index].edit = false;
                    setTimeout(()=>{
                        this.reviews[index].succes = false;
                    },1000);
                }
                catch (err) {
                    this.reviews[index].errors='Непредвиденная ошибка';
                }
            },


            async pinned(pinned_flag){
                this.book.pinned = pinned_flag;
                this.old_book.pinned - pinned_flag;

                this.pinned_request_err = false;
                this.pinned_request_succes = false;

                try{
                    const response = await axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_BOOK_PINNED_URL, {bookmark:{"book_id": this.book._id, "pinned": pinned_flag}, token: this.AuthStore.token});
                    
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