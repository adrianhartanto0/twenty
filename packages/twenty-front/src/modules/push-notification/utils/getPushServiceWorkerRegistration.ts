import { PUSH_SERVICE_WORKER_PATH } from '@/push-notification/constants/PushServiceWorkerPath';

export const getPushServiceWorkerRegistration =
  async (): Promise<ServiceWorkerRegistration> => {
    const registration = await navigator.serviceWorker.register(
      PUSH_SERVICE_WORKER_PATH,
    );

    await navigator.serviceWorker.ready;

    return registration;
  };
