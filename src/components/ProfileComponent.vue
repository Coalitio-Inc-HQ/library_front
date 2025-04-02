<template>
    <div class="absolute flex flex-col top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 gap-3 border rounded-xl border-border-surface p-2 bg-surface-200 dark:bg-surface-700">   
        <h2 class="font-mono text-2xl italic font-semibold text-center">Сведения о пользователе</h2>
        <div class="flex items-center gap-1 w-full">
            <div class="relative">
                <Avatar v-if="this.user.avatar_url"  class="mr-2 !bg-primary-200 !m-0 object-cover" size="xlarge">
                    <img :src="this.user.avatar_url" loading="lazy" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
                </Avatar>
                <Avatar v-else :label="this.user.username?this.user.username[0]:null" class="mr-2 !bg-primary-200 !m-0 object-cover" size="xlarge"/>
                <ProgressBar v-if="this.upload_file.uploading" class="!h-[5px] absolute bottom-0 w-full  transform -translate-y-full" :value="this.upload_file.progress*100">{{ "" }}</ProgressBar>
                <i class="pi pi-pencil absolute top-0 right-0 border rounded-xl border-border-surface p-1 bg-surface-200 dark:bg-surface-700 transform translate-x-1/4 -translate-y-1/4" style="font-size: 1rem" @click="select_upload_file"></i>
            </div>
            <FloatLabel variant="on" class="grow">
                <InputText class="w-full" id="username" v-model:modelValue="user.username"/>
                <label for="username">Имя пользоватля</label>
            </FloatLabel>
        </div>
        <FloatLabel variant="on">
            <InputText class="w-full" id="email" v-model:modelValue="user.email"/>
            <label for="email">Электронная почта</label>
        </FloatLabel>
        <FloatLabel variant="on">
            <Password class="w-full" input-class="w-full" id="password" toggleMask :feedback="false" v-model:modelValue="user.password"/>
            <label for="password">Пароль</label>
        </FloatLabel>
        <FloatLabel variant="on">
            <Password class="w-full" input-class="w-full" id="password_" toggleMask :feedback="false" v-model:modelValue="user.password1"/>
            <label for="password_">Подтвреждение пароля</label>
        </FloatLabel>

        <!-- <Message class="w-full" v-if="!user.username" severity="error">Не заполено имя пользователе</Message>
        <Message class="w-full" v-if="!user.email" severity="error">Не заполена электронная почта</Message>
        <Message class="w-full" v-if="user.password!=user.password1 && user.password && user.password1" severity="error">Пароли должны совподать</Message>
        <Message class="w-full" v-if="upload_file.uploading" severity="info">Дождитесь загрузки фото</Message> -->
        <Message class="w-full text-wrap whitespace-pre-wrap" v-if="errors" severity="error">{{ errors }}</Message>
        <Message class="w-full" v-if="succes" severity="info">Операция выполена</Message>

        <Button v-if="!await_request" label="Сохранить изменения" :disabled="chek_edit_filds()" @click="button_cklik"/>
        <Button v-else disabled="true">Изменения сохраняются</Button>
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

    import router from "@/router";

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
        },
        computed:{
        ...mapStores(useAuthStore)
        },
        mounted(){
            this.user.username = this.AuthStore.user.username;
            this.user.email = this.AuthStore.user.email;
            this.user.avatar_url = this.AuthStore.user.avatar_url;
        },

        data(){
            return {
                errors: null,
                succes: false,
                await_request: false,
                user: {
                    username: null,
                    email: null,
                    avatar_url: null,
                    password: null,
                    password1:null,
                },
                upload_file:{
                    uploading: false,
                    progress: 0,
                    uploaded: false,
                    uploaded_url: null,
                    fail: false,
                }
                
            }
        },
        methods:{
            chek_edit_filds(){
                const keys1 = Object.keys(this.user);
                keys1.pop("password");
                keys1.pop("password1");

                return keys1.every(key => this.user[key] === this.AuthStore.user[key]);
            },

            select_upload_file(){
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';  // Ограничение на выбор изображений
                input.onchange = (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        this.upload_file.progress=0;
                        this.upload_file.uploaded=false;
                        this.upload_file.uploaded_url=null;
                        this.upload_file.uploading=true;

                        const formData = new FormData();
                        formData.append('file', file);
                        axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_UPLOAD_FILE_URL, formData, 
                        {
                            onUploadProgress: (e)=> {this.upload_file.progress = e.progress;},
                        })
                        .then((response)=>{
                            this.upload_file.uploaded_url = response.data.url.url;
                            this.user.avatar_url = response.data.url.url;
                            this.upload_file.uploaded=true;
                            this.upload_file.uploading=false;
                            this.upload_file.progress=1;
                        })
                        .catch((e)=>{this.upload_file.fail = true; this.upload_file.uploading=false;})
                    }
                };
                input.click();
            },

            async button_cklik(){
                let errors = []

                if (!this.user.username){
                    errors.push("Не введено имя пользователя");
                }
                if (!this.user.email){
                    errors.push("Не введён email");
                }
                if (!this.user.password){
                    errors.push("Не введён пароль");
                }
                if (!this.user.password1){
                    errors.push("Не введено подтверждение пароля");
                } else{
                    if (this.user.password!=this.user.password1){
                        errors.push("Пароли не совподают");
                    }
                }
                if (this.upload_file.uploading){
                    errors.push("Дождитесь загрузки фото");
                }

                if(errors.length){
                    this.errors = errors.join("\n");
                } else{
                    this.errors = null;

                    let data = {"_id": this.AuthStore.user._id,}
                    if (this.user.username != this.AuthStore.user.username){
                        data.username = this.user.username;
                    }
                    if (this.user.email != this.AuthStore.user.email){
                        data.email = this.user.email;
                    }
                    if (this.user.avatar_url != this.AuthStore.user.avatar_url){
                        data.avatar_url = this.user.avatar_url;
                    }
                    if (this.user.password){
                        data.password = this.user.password;
                    }

                    this.await_request = true;
                    const res = await this.AuthStore.change_user_info(data);
                    this.await_request = false;
                    if (res===true){
                        this.user.password = null;
                        this.user.password1 = null;
                    } else{
                        this.errors = res;
                    }
                }
            }
        }
    };
</script>