import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';

export const ApiCarrierId = (options?: ApiPropertyOptions) =>
  ApiProperty({
    type: String,
    description: 'Die Id des Ladungsträgers',
    example: '000000000000000000000000',
    required: true,
    ...options,
  });

export const ApiCarrierType = (options?: ApiPropertyOptions) =>
  ApiProperty({
    type: String,
    description: 'Der Typ des Ladungsträger',
    example: 'Bremsscheiben',
    required: true,
    minLength: 1,
    ...options,
  });

export const ApiCarrierCustomer = (options?: ApiPropertyOptions) =>
  ApiProperty({
    type: String,
    description: 'Welchem Kunden ist der Ladungsträger zugeordnet',
    example: 'Porsche',
    required: true,
    minLength: 1,
    ...options,
  });

export const ApiCarrierOrder = (options?: ApiPropertyOptions) =>
  ApiProperty({
    type: String,
    description: 'Zu welcher Lieferung gehört der Ladungsträger',
    example: '0051',
    required: true,
    minLength: 1,
    ...options,
  });

export const ApiCarrierTimestamp = (options?: ApiPropertyOptions) =>
  ApiProperty({
    type: Number,
    minimum: 0,
    description: 'Der Zeitpunkt der Messung',
    example: Date.now(),
    required: false,
    ...options,
  });

export const ApiCarrierLoad = (options?: ApiPropertyOptions) =>
  ApiProperty({
    type: Number,
    minimum: 0,
    maximum: 1,
    description: 'Die Beladung des Ladungsträger in Prozent',
    example: 17.4,
    required: true,
    ...options,
  });
