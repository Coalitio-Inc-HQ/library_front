import { createRouter, createWebHistory } from 'vue-router'
import LogInComponent from '@/components/LogInComponent.vue'
import MainView from '@/view/MainView.vue'
import ProfileComponent from '@/components/ProfileComponent.vue'
import BooksComponent from '@/components/BooksComponent.vue'
import UploadBookComponent from '@/view/BookView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Библиотека',
      component: MainView,
      children:[
        {
          path: "user",
          component: ProfileComponent,
        },
        {
          path:"books",
          component: BooksComponent
        },
        {
          path:"upload",
          component: UploadBookComponent,
          props: {"mode":"create"}
        },
        {
          path:"book/:id",
          component: UploadBookComponent,
        },
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: LogInComponent,
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
  ],
})

export default router
