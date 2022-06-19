import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';

export const ApiLocation = (options?: ApiPropertyOptions) =>
  ApiProperty({
    type: [Number, Number],
    name: 'coordinates',
    description:
      'Koordinaten (longitude [-180 bis 180], latitude [-90 bis 90])',
    example: [0, 0],
    required: true,
    ...options,
  });
