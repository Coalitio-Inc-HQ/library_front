import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import {parseJwt} from '@/utilites'
import { getCookie, setCookie, deleteCookies } from '@/utilites';
import router from '@/router';
export const useAuthStore = defineStore('Auth', 
    {
        state: () =>{
            return {
                token: getCookie("token")? getCookie("token"): null,
                user: getCookie("token")? parseJwt(getCookie("token")):null,
                failAuthHandler: ()=>{
                    router.push("/login");
                }
            }
        },
        actions:{
            async login(credentials){
                try {
                    const response = await axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_LOGIN_URL, credentials);
        
                    const jwt = response.data.jwt;

                    this.token = jwt;
                    this.user = parseJwt(jwt);

                    setCookie("token", jwt);
                    return true;
                } catch (err) {
                    if ("status" in err && err.response.status===400) {
                       return 'Введён не правельный логин или пароль';
                    }
                    return 'Неизвестная ошибка входа';
                }
            },

            async registrate(username, email, password){
                try {
                    const response = await axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_USER_CREATE_URL, 
                        {
                            username:username,
                            email:email, 
                            password:password, 
                            avatar_url: null
                        }
                    );
        
                    const jwt = response.data.jwt;

                    this.token = jwt;
                    this.user = JSON.parse(atob(jwt.split('.')[1]));

                    setCookie("token", jwt);
                    return true;
                } catch (err) {
                    return 'Неизвестная ошибка ошибка регистрации';
                }
            },
        
            logout() {
                this.token = null;
                this.user = null;
                this.error = null;
                deleteCookies("token");
            },

            async change_user_info(data){
                try{
                    const response = await axios.post(import.meta.env.VITE_BASE_URL+import.meta.env.VITE_USER_UPDATE_URL, {chenge_user_info:data, token: this.token});
        
                    const jwt = response.data.jwt;

                    this.token = jwt;
                    this.user = parseJwt(jwt);
                    this.error = null;

                    setCookie("token", jwt);
                    return true;
                }
                catch (err) {
                    if ("status" in err && err.response.status===401) {
                        this.failAuthHandler();
                        return 'Ошибка аутентификации';
                    }
                    return 'Неизвестная ошибка изменения сведений о пользователе';
                }
            }
        }
    }
);