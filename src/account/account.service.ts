import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, genSalt, hash } from 'bcrypt';
import { isMongoId } from 'class-validator';
import { Model } from 'mongoose';
import { InvalidAccount } from 'src/_common/exceptions/ItemNotFound.exception';
import { AAccount } from './decorators/account.decorator';
import { ChangePermissionsDto } from './dtos/change-permissions.dto';
import { CreateAccountDto } from './dtos/create-account.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { Account } from './schemas/Account.schema';

const INIT_NAME = 'DB_INIT_ACCOUNT_NAME';
export const REGISTERED_PERMISSIONS = new Set<string>();

Injectable();
export class AccountService {
  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.createInitUser();
  }

  public getPermissions(): string[] {
    return [...REGISTERED_PERMISSIONS];
  }

  private async getByName(username: string): Promise<Account> {
    const reg = new RegExp(`^${username}$`, 'i');
    return this.accountModel.findOne({ username: reg });
  }

  public async list(organisation: string): Promise<Account[]> {
    return this.accountModel.find({
      organisation: organisation,
      _createdBy: { $ne: 'system' },
    });
  }

  async validate(username: string, password: string): Promise<AAccount> {
    const account = await this.getByName(username);
    if (!account) return null;

    const isValid = await compare(password.toString(), account.password);
    if (!isValid) return null;

    return account.toJSON() as AAccount;
  }

  async login(account: AAccount): Promise<string> {
    return this.jwtService.sign(account);
  }

  async delete(accountId: string, organisation: string): Promise<boolean> {
    if (!isMongoId(accountId)) throw InvalidAccount(accountId);
    const res = await this.accountModel.deleteOne({
      _id: accountId,
      organisation: organisation,
    });
    if (res.deletedCount === 0) throw InvalidAccount(accountId);
    return true;
  }

  async create(
    accountId: string,
    dto: CreateAccountDto,
    organisation: string,
  ): Promise<Account> {
    if (!isMongoId(accountId)) throw InvalidAccount(accountId);

    const { username, password } = dto;

    if (username.includes(' '))
      throw new BadRequestException(
        'Der Name darf keine Leerzeichen enthalten',
      );
    if (username === this.configService.get(INIT_NAME))
      throw new BadRequestException('Ungültiger Nutzername');

    const account = await this.getByName(username);
    if (account) throw new BadRequestException('Der Name ist bereits vergeben');

    const hash = await this.hashPassword(password);

    return this.accountModel.create({
      username: username,
      password: hash,
      permissions: [],
      group: 'default',
      organisation: organisation,
      _createdBy: accountId,
    });
  }

  async updatePassword(
    accountId: string,
    dto: UpdatePasswordDto,
    organisation: string,
  ): Promise<string> {
    if (!isMongoId(accountId)) throw InvalidAccount(accountId);

    const { newPassword, oldPassword } = dto;

    let account = await this.accountModel.findById(accountId);
    if (!account) throw InvalidAccount(accountId);
    if (account.organisation !== organisation) throw InvalidAccount(accountId);

    if (account.username === this.configService.get(INIT_NAME))
      throw new BadRequestException('Das Passwort kann nicht geändert werden');

    const isValid = await compare(oldPassword, account.password);
    if (!isValid) throw new BadRequestException('Das alte Passwort ist falsch');

    const hash = await this.hashPassword(newPassword);
    account = await this.accountModel.findOneAndUpdate(
      { _id: accountId },
      { $set: { password: hash } },
      { new: true },
    );

    return this.login(account.toJSON() as AAccount);
  }

  async resetPassword(
    accountId: string,
    dto: ResetPasswordDto,
    organisation: string,
  ): Promise<boolean> {
    if (!isMongoId(accountId)) throw InvalidAccount(accountId);

    const hash = await this.hashPassword(dto.newPassword);
    const res = await this.accountModel.updateOne(
      {
        _id: accountId,
        organisation: organisation,
        _createdBy: { $ne: 'system' },
      },
      { $set: { password: hash } },
    );

    if (res.modifiedCount === 0) throw InvalidAccount(accountId);
    return true;
  }

  public async changePermissions(
    accountId: string,
    dto: ChangePermissionsDto,
    organisation: string,
  ): Promise<Account> {
    if (!isMongoId(accountId)) throw InvalidAccount(accountId);
    const { permissions } = dto;

    permissions.forEach((p) => {
      if (!REGISTERED_PERMISSIONS.has(p)) {
        throw new BadRequestException(
          "Die Berechtigung mit dem Namen '" + p + "' existiert nicht",
        );
      }
    });

    const user = await this.accountModel.findOneAndUpdate(
      {
        _id: accountId,
        organisation: organisation,
        _createdBy: { $ne: 'system' },
      },
      { permissions: permissions },
      { new: true },
    );

    if (user) return user;
    throw InvalidAccount(accountId);
  }

  public async setGroup(
    accountId: string,
    group: string,
    organisation: string,
  ): Promise<boolean> {
    if (!isMongoId(accountId)) throw InvalidAccount(accountId);
    const res = await this.accountModel.updateOne(
      {
        _id: accountId,
        organisation: organisation,
        _createdBy: { $ne: 'system' },
      },
      { $set: { group: group } },
    );

    if (res.modifiedCount === 0) throw InvalidAccount(accountId);
    return true;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt();
    return hash(password, salt);
  }

  private async createInitUser(): Promise<void> {
    const name = this.configService.get<string>(INIT_NAME);
    const pass = this.configService.get<string>('DB_INIT_ACCOUNT_PASSWORD');

    if (!name || name.length === 0 || !pass || pass.length === 0) {
      Logger.error(
        'Es wurde kein INIT Account für die DB angegeben',
        'AccountModule',
      );
      return;
    }

    const hash = await this.hashPassword(pass);

    await this.accountModel.updateOne(
      { _createdBy: 'system' },
      {
        $set: {
          username: name,
          password: hash,
          permissions: [],
          organisation: 'ligenium',
          group: 'system',
        },
      },
      { upsert: true, useFindAndMofiy: true },
    );
    Logger.log('INIT Account angelegt', 'AccountModule');
  }
}
