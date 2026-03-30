/* @license Enterprise */

import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';

@Injectable()
export class EnterpriseFeaturesEnabledGuard implements CanActivate {
  constructor(
    private readonly guardRedirectService: GuardRedirectService,
    private readonly enterprisePlanService: EnterprisePlanService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    return true

    // try {
    //   if (!this.twentyConfigService.get('ENTERPRISE_KEY')) {
    //     throw new AuthException(
    //       'Enterprise key missing',
    //       AuthExceptionCode.MISSING_ENVIRONMENT_VARIABLE,
    //     );
    //   }

    //   return true;
    // } catch (err) {
    //   this.guardRedirectService.dispatchErrorFromGuard(
    //     context,
    //     err,
    //     this.guardRedirectService.getSubdomainAndCustomDomainFromContext(
    //       context,
    //     ),
    //   );

    //   return false;
    // }
  }
}
