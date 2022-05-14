import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  MongoId,
  MongoIdTypes,
} from 'src/_common/decorators/MongoId.decorator';
import { AccountService } from './account.service';
import {
  AAccount,
  RAccount,
  RId,
  ROrganisation,
} from './decorators/account.decorator';
import { ChangePermissionsDto } from './dtos/change-permissions.dto';
import { CreateAccountDto } from './dtos/create-account.dto';
import { CreateOrganisationDto } from './dtos/create-organisation.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SetGroupDto } from './dtos/set-group.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local.guard';
import { Perms } from './guards/perms.guard';
import { Account } from './schemas/Account.schema';

const AccountId = () => MongoId(MongoIdTypes.ACCOUNT, 'accountId');

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiResponse({ type: String })
  @ApiBody({
    schema: {
      properties: {
        username: { example: '' },
        password: { example: '' },
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@RAccount() account: AAccount): Promise<string> {
    return this.accountService.login(account);
  }

  @ApiResponse({ type: [Account] })
  @Perms(
    'account.change.password',
    'account.delete',
    'account.change.group',
    'account.change.permissions',
  )
  @Get('')
  async listAccounts(
    @ROrganisation() organisation: string,
  ): Promise<Account[]> {
    return this.accountService.list(organisation);
  }

  @ApiResponse({ type: Account })
  @Perms('account.create')
  @Post('')
  async createAccount(
    @RId() accountId: string,
    @ROrganisation() organisation: string,
    @Body() dto: CreateAccountDto,
  ): Promise<Account> {
    return this.accountService.create(accountId, dto, organisation);
  }

  @ApiResponse({ type: Account })
  @Perms('account.organisation.create')
  @Post('organisation')
  async createOrganisation(
    @Body() dto: CreateOrganisationDto,
  ): Promise<Account> {
    return this.accountService.createOrganisation(dto.name);
  }

  @ApiResponse({ type: Account })
  @Perms('account.organisation.delete')
  @Delete('organisation/:organisation')
  async deleteOrganisation(
    @Param('organisation') organisation: string,
  ): Promise<void> {
    this.accountService.deleteOrganisation(organisation);
  }

  @ApiResponse({ type: [String] })
  @Perms('account.organisation.list')
  @Delete('organisation')
  async getOrganisations(): Promise<string[]> {
    return this.accountService.getOrganisations();
  }

  @ApiResponse({ type: Boolean })
  @Perms('account.delete')
  @Delete(':accountId')
  async deleteAccount(
    @ROrganisation() organisation: string,
    @AccountId() accountId: string,
  ): Promise<boolean> {
    return this.accountService.delete(accountId, organisation);
  }

  @ApiBearerAuth()
  @ApiResponse({ type: String })
  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async updatePassword(
    @RId() accountId: string,
    @ROrganisation() organisation: string,
    @Body() dto: UpdatePasswordDto,
  ): Promise<string> {
    return this.accountService.updatePassword(accountId, dto, organisation);
  }

  @ApiResponse({ type: Boolean })
  @Perms('account.change.password')
  @Patch('password/:accountId')
  async resetPassword(
    @ROrganisation() organisation: string,
    @AccountId() accountId: string,
    @Body() dto: ResetPasswordDto,
  ): Promise<boolean> {
    return this.accountService.resetPassword(accountId, dto, organisation);
  }

  @ApiResponse({ type: Account })
  @Perms('account.change.permissions')
  @Patch('permissions/:accountId')
  async changePermissions(
    @ROrganisation() organisation: string,
    @AccountId() accountId: string,
    @Body() dto: ChangePermissionsDto,
  ): Promise<Account> {
    return this.accountService.changePermissions(accountId, dto, organisation);
  }

  @ApiResponse({ type: [String] })
  @Get('permissions')
  @Perms('account.change.permissions')
  getPermissions(): string[] {
    return this.accountService.getPermissions();
  }

  @ApiResponse({ type: Boolean })
  @Perms('account.change.group')
  @Patch('group/:accountId')
  async changeGroup(
    @ROrganisation() organisation: string,
    @AccountId() accountId: string,
    @Body() dto: SetGroupDto,
  ): Promise<boolean> {
    return this.accountService.setGroup(accountId, dto.group, organisation);
  }

  @ApiBearerAuth()
  @ApiResponse({ type: Boolean })
  @UseGuards(JwtAuthGuard)
  @Post('valid')
  validateJwt(): boolean {
    return true;
  }
}
