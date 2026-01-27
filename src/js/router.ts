import { createRouter, createWebHistory } from '@ionic/vue-router';
import { routes } from 'vue-router/auto-routes';
import { useNavigationLoader } from '@/composables/useNavigationLoader';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const { startLoading, stopLoading } = useNavigationLoader();

router.beforeEach((to, from, next) => {
  startLoading();
  next();
});

router.afterEach(() => {
  stopLoading();
});

router.onError(() => {
  stopLoading();
});

export default router;