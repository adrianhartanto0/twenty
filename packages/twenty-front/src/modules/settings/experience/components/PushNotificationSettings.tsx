import { usePushNotificationSubscription } from '@/push-notification/hooks/usePushNotificationSubscription';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconBell, IconSend } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Card } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const PushNotificationSettings = () => {
  const { t } = useLingui();

  const {
    isSupported,
    isEnabledOnServer,
    isSubscribed,
    isPermissionDenied,
    isLoading,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotificationSubscription();

  const getDescription = () => {
    if (!isSupported) {
      return t`Your browser does not support push notifications`;
    }

    if (!isEnabledOnServer) {
      return t`Push notifications are not configured on this server`;
    }

    if (isPermissionDenied) {
      return t`Notifications are blocked for this site in your browser settings`;
    }

    return t`Receive notifications on this device even when Twenty is closed`;
  };

  const handleToggle = async (checked: boolean) => {
    try {
      if (checked) {
        await subscribe();
      } else {
        await unsubscribe();
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : t`Could not update push notification settings`;

      console.log(errorMessage)
    }
  };

  const handleSendTest = async () => {
    try {
      const deviceCount = await sendTestNotification();

      console.log(`Test notification sent to ${deviceCount} device(s)`)

    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : t`Could not update push notification settings`;

      console.log(errorMessage)
    }
  };

  const isDisabled =
    !isSupported || !isEnabledOnServer || isPermissionDenied || isLoading;

  return (
    <StyledContainer>
      <Card>
        <SettingsOptionCardContentToggle
          Icon={IconBell}
          title={t`Push notifications on this device`}
          description={getDescription()}
          checked={isSubscribed}
          disabled={isDisabled}
          onChange={handleToggle}
        />
      </Card>
      {isSubscribed && (
        <div>
          <Button
            onClick={handleSendTest}
            variant="outline"
            startIcon={<IconSend />}
          >{t`Send test notification`}</Button>
        </div>
      )}
    </StyledContainer>
  );
};
