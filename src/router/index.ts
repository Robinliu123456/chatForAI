import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import GuidView from "@/views/GuidView.vue";

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/draw",
      name: "draw",
      component: () => import("../views/DrawAI.vue"),
    },
    {
      path: "/GuidView",
      name: "guid",
      component: GuidView,
    },
    {
      path: "/GuidView2",
      name: "draw",
      component: () => import("../views/GuidView2.vue"),
    },
    {
      path: "/FloatingBall",
      name: "FloatingBall",
      component: () => import("../views/FloatingBall.vue"),
    }
  ],
});

export default router;
