<template>
    <div class="absolute flex flex-col top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 gap-3 border rounded-xl border-border-surface p-2 bg-surface-200 dark:bg-surface-700">
        <h1 class="font-mono text-2xl italic font-semibold text-center">Библиотека<i class="pi pi-book !text-xl p-1 rotate-10"/></h1>
        <div class="flex items-center justify-center">
            <SelectButton v-model="mode" :options="['Вход', 'Регистрация']"/>
        </div>
        <template v-if="mode=='Вход'">
            <FloatLabel variant="on">
                <InputText class="w-full" id="email" v-model:modelValue="log_in.email"/>
                <label for="email">Логин</label>
            </FloatLabel>
            <FloatLabel variant="on">
                <Password class="w-full" input-class="w-full" id="password" toggleMask :feedback="false" v-model:modelValue="log_in.password"/>
                <label for="password">Пароль</label>
            </FloatLabel>
        </template>

        <template v-if="mode=='Регистрация'">
            <FloatLabel variant="on">
                <InputText class="w-full" id="username" v-model:modelValue="registration.username"/>
                <label for="username">Имя пользоватля</label>
            </FloatLabel>
            <FloatLabel variant="on">
                <InputText class="w-full" id="email" v-model:modelValue="registration.email"/>
                <label for="email">Электронная почта</label>
            </FloatLabel>
            <FloatLabel variant="on">
                <Password class="w-full" input-class="w-full" id="password" toggleMask :feedback="false" v-model:modelValue="registration.password"/>
                <label for="password">Пароль</label>
            </FloatLabel>
            <FloatLabel variant="on">
                <Password class="w-full" input-class="w-full" id="password_" toggleMask :feedback="false" v-model:modelValue="registration.password1"/>
                <label for="password_">Подтвреждение пароля</label>
            </FloatLabel>
        </template>
        <Message class="w-full text-wrap whitespace-pre-wrap" v-if="errors" severity="error">{{ errors }}</Message>
        <Button :label="mode" @click="button_cklik"/>
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
import router from '@/router';


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
    },
    computed:{
      ...mapStores(useAuthStore)
    },
    data(){
        return {
            mode: 'Вход',
            errors: null,
            log_in:{
                email: null,
                password: null,
            },
            registration:{
                username: null,
                email: null,
                password: null,
                password1: null,
                avatar_url: null,
            }
        }
    },
    watch:{
        "mode"(newValue, oldValue){
            if (!newValue) this.mode = oldValue;
            this.errors = null;
        }
    },
    methods:{
        async button_cklik(){
            
            if (this.mode=='Вход'){
                let errors = [];
                if (!this.log_in.email){
                    errors.push("Не введён email");
                }
                if (!this.log_in.password){
                    errors.push("Не введён пароль");
                }

                if (errors.length){
                    this.errors = errors.join("\n");
                } 
                else{
                    this.errors = null;
                    const res = await this.AuthStore.login(this.log_in)
                    if (res===true){
                        router.push("/");
                    } else{
                        this.errors = res;
                    }
                }
            }
            else{
                let errors = [];

                if (!this.registration.username){
                    errors.push("Не введено имя пользователя");
                }
                if (!this.registration.email){
                    errors.push("Не введён email");
                }
                if (!this.registration.password){
                    errors.push("Не введён пароль");
                }
                if (!this.registration.password1){
                    errors.push("Не введено подтверждение пароля");
                } else{
                    if (this.registration.password!=this.registration.password1){
                        errors.push("Пароли не совподают");
                    }
                }

                if (errors.length){
                    this.errors = errors.join("\n");
                } else{
                    this.errors = null;
                    const res = await this.AuthStore.registrate(this.registration.username, this.registration.email, this.registration.password);

                    if (res === true){
                        router.push("/");
                    }
                    else {
                        this.errors = res;
                    }
                }
            }
        }
    }
};
</script>
