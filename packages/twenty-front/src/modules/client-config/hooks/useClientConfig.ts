import { aiModelsState } from '@/client-config/states/aiModelsState';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { apiConfigState } from '@/client-config/states/apiConfigState';
import { appVersionState } from '@/client-config/states/appVersionState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { billingState } from '@/client-config/states/billingState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { captchaState } from '@/client-config/states/captchaState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { enterpriseInstanceTypeState } from '@/client-config/states/enterpriseInstanceTypeState';
import { isAnalyticsEnabledState } from '@/client-config/states/isAnalyticsEnabledState';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { isCloudflareIntegrationEnabledState } from '@/client-config/states/isCloudflareIntegrationEnabledState';
import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';
import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { isEmailVerificationRequiredState } from '@/client-config/states/isEmailVerificationRequiredState';
import { isEmailingDomainInDemoModeState } from '@/client-config/states/isEmailingDomainInDemoModeState';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isImapSmtpCaldavEnabledState } from '@/client-config/states/isImapSmtpCaldavEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { isOnboardingAiChatEnabledState } from '@/client-config/states/isOnboardingAiChatEnabledState';
import { labPublicFeatureFlagsState } from '@/client-config/states/labPublicFeatureFlagsState';
import { maintenanceModeState } from '@/client-config/states/maintenanceModeState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { webPushState } from '@/client-config/states/webPushState';
import { type ClientConfig } from '@/client-config/types/ClientConfig';
import { getClientConfig } from '@/client-config/utils/getClientConfig';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useCallback } from 'react';
import { ENTERPRISE_INSTANCE_TYPE } from 'twenty-shared/constants';

type UseClientConfigResult = {
  data: { clientConfig: ClientConfig } | undefined;
  loading: boolean;
  error: Error | undefined;
  fetchClientConfig: () => Promise<void>;
  refetch: () => Promise<void>;
};

export const useClientConfig = (): UseClientConfigResult => {
  const setIsAnalyticsEnabled = useSetAtomState(isAnalyticsEnabledState);
  const setDomainConfiguration = useSetAtomState(domainConfigurationState);
  const setAuthProviders = useSetAtomState(authProvidersState);
  const setAiModels = useSetAtomState(aiModelsState);

  const setIsDeveloperDefaultSignInPrefilled = useSetAtomState(
    isDeveloperDefaultSignInPrefilledState,
  );
  const setIsMultiWorkspaceEnabled = useSetAtomState(
    isMultiWorkspaceEnabledState,
  );
  const setIsEmailVerificationRequired = useSetAtomState(
    isEmailVerificationRequiredState,
  );

  const setBilling = useSetAtomState(billingState);
  const setSupportChat = useSetAtomState(supportChatState);

  const setSentryConfig = useSetAtomState(sentryConfigState);
  const [clientConfigApiStatus, setClientConfigApiStatus] = useAtomState(
    clientConfigApiStatusState,
  );

  const setCaptcha = useSetAtomState(captchaState);
  const setWebPush = useSetAtomState(webPushState);

  const setApiConfig = useSetAtomState(apiConfigState);
  const setOnboardingConfig = useSetAtomState(onboardingConfigState);

  const setCanManageFeatureFlags = useSetAtomState(canManageFeatureFlagsState);

  const setLabPublicFeatureFlags = useSetAtomState(labPublicFeatureFlagsState);

  const setIsMicrosoftMessagingEnabled = useSetAtomState(
    isMicrosoftMessagingEnabledState,
  );

  const setIsMicrosoftCalendarEnabled = useSetAtomState(
    isMicrosoftCalendarEnabledState,
  );

  const setIsGoogleMessagingEnabled = useSetAtomState(
    isGoogleMessagingEnabledState,
  );

  const setIsGoogleCalendarEnabled = useSetAtomState(
    isGoogleCalendarEnabledState,
  );

  const setIsAttachmentPreviewEnabled = useSetAtomState(
    isAttachmentPreviewEnabledState,
  );

  const setIsConfigVariablesInDbEnabled = useSetAtomState(
    isConfigVariablesInDbEnabledState,
  );

  const setCalendarBookingPageId = useSetAtomState(calendarBookingPageIdState);

  const setIsEmailingDomainInDemoMode = useSetAtomState(
    isEmailingDomainInDemoModeState,
  );

  const setIsImapSmtpCaldavEnabled = useSetAtomState(
    isImapSmtpCaldavEnabledState,
  );

  const setAllowRequestsToTwentyIcons = useSetAtomState(
    allowRequestsToTwentyIconsState,
  );

  const setIsCloudflareIntegrationEnabled = useSetAtomState(
    isCloudflareIntegrationEnabledState,
  );

  const setIsClickHouseConfigured = useSetAtomState(
    isClickHouseConfiguredState,
  );

  const setIsDDLLocked = useSetAtomState(isDDLLockedState);

  const setIsOnboardingAiChatEnabled = useSetAtomState(
    isOnboardingAiChatEnabledState,
  );

  const setMaintenanceMode = useSetAtomState(maintenanceModeState);

  const setEnterpriseInstanceType = useSetAtomState(
    enterpriseInstanceTypeState,
  );

  const setAppVersion = useSetAtomState(appVersionState);

  const fetchClientConfig = useCallback(async () => {
    setClientConfigApiStatus((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      const clientConfig = await getClientConfig();
      setClientConfigApiStatus((prev) => ({
        ...prev,
        isLoading: false,
        isLoadedOnce: true,
        isErrored: false,
        error: undefined,
        data: { clientConfig },
      }));
      setClientConfigApiStatus((currentStatus) => ({
        ...currentStatus,
        isErrored: false,
        error: undefined,
      }));
      setAppVersion(clientConfig.appVersion);
      setAuthProviders({
        google: clientConfig.authProviders.google,
        microsoft: clientConfig.authProviders.microsoft,
        password: clientConfig.authProviders.password,
        magicLink: false,
        sso: clientConfig.authProviders.sso,
      });
      setAiModels(clientConfig.aiModels ?? []);
      setIsAnalyticsEnabled(clientConfig.analyticsEnabled);
      setIsDeveloperDefaultSignInPrefilled(clientConfig.signInPrefilled);
      setIsMultiWorkspaceEnabled(clientConfig.isMultiWorkspaceEnabled);
      setIsEmailVerificationRequired(clientConfig.isEmailVerificationRequired);
      setBilling(clientConfig.billing);
      setSupportChat(clientConfig.support);

      setSentryConfig({
        dsn: clientConfig?.sentry?.dsn,
        release: clientConfig?.sentry?.release,
        environment: clientConfig?.sentry?.environment,
      });

      setCaptcha({
        provider: clientConfig?.captcha?.provider,
        siteKey: clientConfig?.captcha?.siteKey,
      });

      setWebPush(clientConfig?.webPush ?? null);

      setApiConfig(clientConfig?.api);
      setOnboardingConfig(clientConfig?.onboarding);
      setDomainConfiguration({
        defaultSubdomain: clientConfig?.defaultSubdomain,
        frontDomain: clientConfig?.frontDomain,
        publicFunctionDomain: clientConfig?.publicFunctionDomain,
      });
      setCanManageFeatureFlags(clientConfig?.canManageFeatureFlags);
      setLabPublicFeatureFlags(clientConfig?.publicFeatureFlags);
      setIsMicrosoftMessagingEnabled(clientConfig?.isMicrosoftMessagingEnabled);
      setIsMicrosoftCalendarEnabled(clientConfig?.isMicrosoftCalendarEnabled);
      setIsGoogleMessagingEnabled(clientConfig?.isGoogleMessagingEnabled);
      setIsGoogleCalendarEnabled(clientConfig?.isGoogleCalendarEnabled);
      setIsAttachmentPreviewEnabled(clientConfig?.isAttachmentPreviewEnabled);
      setIsConfigVariablesInDbEnabled(
        clientConfig?.isConfigVariablesInDbEnabled,
      );
      setClientConfigApiStatus((currentStatus) => ({
        ...currentStatus,
        isSaved: true,
      }));

      setCalendarBookingPageId(clientConfig?.calendarBookingPageId ?? null);
      setIsImapSmtpCaldavEnabled(clientConfig?.isImapSmtpCaldavEnabled);
      setIsEmailingDomainInDemoMode(
        clientConfig?.isEmailingDomainInDemoMode ?? false,
      );
      setAllowRequestsToTwentyIcons(clientConfig?.allowRequestsToTwentyIcons);
      setIsCloudflareIntegrationEnabled(
        clientConfig?.isCloudflareIntegrationEnabled,
      );
      setIsClickHouseConfigured(clientConfig?.isClickHouseConfigured ?? false);
      setIsDDLLocked(clientConfig?.isWorkspaceSchemaDDLLocked ?? false);
      setIsOnboardingAiChatEnabled(
        clientConfig?.isOnboardingAiChatEnabled ?? false,
      );
      setMaintenanceMode(clientConfig?.maintenance ?? null);
      setEnterpriseInstanceType(
        clientConfig?.enterpriseInstanceType ??
          ENTERPRISE_INSTANCE_TYPE.PRODUCTION,
      );
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch client config');
      setClientConfigApiStatus((prev) => ({
        ...prev,
        isLoading: false,
        isLoadedOnce: true,
        isErrored: true,
        error,
      }));
    }
  }, [
    setAiModels,
    setApiConfig,
    setOnboardingConfig,
    setAppVersion,
    setAuthProviders,
    setBilling,
    setCalendarBookingPageId,
    setCanManageFeatureFlags,
    setCaptcha,
    setClientConfigApiStatus,
    setDomainConfiguration,
    setIsGoogleCalendarEnabled,
    setIsGoogleMessagingEnabled,
    setIsAnalyticsEnabled,
    setIsAttachmentPreviewEnabled,
    setIsConfigVariablesInDbEnabled,
    setIsDeveloperDefaultSignInPrefilled,
    setIsEmailVerificationRequired,
    setIsImapSmtpCaldavEnabled,
    setIsMultiWorkspaceEnabled,
    setIsEmailingDomainInDemoMode,
    setIsClickHouseConfigured,
    setIsCloudflareIntegrationEnabled,
    setIsDDLLocked,
    setIsOnboardingAiChatEnabled,
    setLabPublicFeatureFlags,
    setMaintenanceMode,
    setEnterpriseInstanceType,
    setIsMicrosoftCalendarEnabled,
    setIsMicrosoftMessagingEnabled,
    setSentryConfig,
    setSupportChat,
    setAllowRequestsToTwentyIcons,
  ]);

  return {
    data: clientConfigApiStatus.data,
    loading: clientConfigApiStatus.isLoading || false,
    error: clientConfigApiStatus.error,
    fetchClientConfig,
    refetch: fetchClientConfig,
  };
};
