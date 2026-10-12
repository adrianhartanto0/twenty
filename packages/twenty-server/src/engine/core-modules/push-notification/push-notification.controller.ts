import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UseFilters,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { SendPushNotificationInput } from 'src/engine/core-modules/push-notification/dtos/send-push-notification.input';
import { PushNotificationService } from 'src/engine/core-modules/push-notification/services/push-notification.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Controller('rest/push-notifications')
@UseGuards(
  JwtAuthGuard,
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
)
@UseFilters(PermissionsRestApiExceptionFilter, RestApiExceptionFilter)
export class PushNotificationController {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @Post('send')
  async send(
    @Body(new ValidationPipe({ whitelist: true }))
    input: SendPushNotificationInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<{ deviceCount: number }> {
    // Push subscriptions are keyed by user, not workspace, so the member is
    // resolved inside the caller's workspace to stop cross-workspace sends
    const userId =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
              workspace.id,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
            );

          const workspaceMember = await workspaceMemberRepository.findOne({
            where: { id: input.workspaceMemberId },
          });

          return workspaceMember?.userId;
        },
        buildSystemAuthContext(workspace.id),
      );



    if (!isDefined(userId)) {
      throw new NotFoundException(
        `Workspace member ${input.workspaceMemberId} not found`,
      );
    }

    const deviceCount = await this.pushNotificationService.sendToUser(userId, {
      title: input.title,
      body: input.body,
      url: input.url,
      tag: input.tag,
    });

    return { deviceCount };
  }
}
