import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import TDesignChat from '@tdesign-vue-next/chat'; // 引入chat组件
import TDesign from 'tdesign-vue-next';

import "./assets/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(TDesign).use(TDesignChat);

app.mount("#app");
