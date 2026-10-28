/* @license Enterprise */

import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';

import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';

@Injectable()
export class EnterpriseFeaturesEnabledGuard implements CanActivate {
  constructor(
    private readonly guardRedirectService: GuardRedirectService,
    // private readonly enterprisePlanService: EnterprisePlanService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    return true

    // try {
    //   if (!(await this.enterprisePlanService.isValidWithFreshToken())) {
    //     throw new AuthException(
    //       'Enterprise features are not enabled',
    //       AuthExceptionCode.ENTERPRISE_VALIDITY_TOKEN_NOT_VALID,
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
