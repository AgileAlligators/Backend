import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';

export const ApiAccountUsername = (options?: ApiPropertyOptions) =>
  ApiProperty({
    type: String,
    example: 'timo.scheuermann',
    description: 'Der Login-Name',
    ...options,
  });

export const ApiAccountPassword = (options?: ApiPropertyOptions) =>
  ApiProperty({
    type: String,
    example: 'S1ch3res P45sw0rt',
    description: 'Das Passwort',
    ...options,
  });

export const ApiAccountGroup = (options?: ApiPropertyOptions) =>
  ApiProperty({
    type: String,
    example: 'admin',
    description: 'Die Benutzergruppe des Benutzers',
    default: 'default',
    ...options,
  });

export const ApiAccountPermissions = (options?: ApiPropertyOptions) =>
  ApiProperty({
    type: [String],
    example: ['carrier.create', 'carrier.update', 'carrier.delete'],
    description: 'Einzelne Berechtigungen des Nutzers',
    ...options,
  });

export const ApiAccountOrganisation = (options?: ApiPropertyOptions) =>
  ApiProperty({
    type: String,
    example: 'Porsche AG',
    description: 'Die Organisation des Benutzers',
    ...options,
  });
