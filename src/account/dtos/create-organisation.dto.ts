import { ApiProperty } from '@nestjs/swagger';
import { IsNotIn, IsString, MinLength } from 'class-validator';

export class CreateOrganisationDto {
  @ApiProperty({
    required: true,
    type: String,
    example: 'Porsche-AG',
    minLength: 2,
  })
  @IsNotIn(['ligenium'], { message: 'Der Name darf nicht ligenium sein' })
  @MinLength(2, {
    message: 'Der Name der Organisation muss mindestens 2 Zeichen lang sein',
  })
  @IsString({ message: 'Der Name der Organisation muss ein String sein' })
  name: string;
}
