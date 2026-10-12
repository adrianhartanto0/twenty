import { type WebPushConfig } from '@/client-config/types/WebPushConfig';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const webPushState = createAtomState<WebPushConfig | null>({
  key: 'webPushState',
  defaultValue: null,
});
