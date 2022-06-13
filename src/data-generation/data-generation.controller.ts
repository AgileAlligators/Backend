import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/account/guards/perms.guard';
import { DataGenerationService } from './data-generation.service';

@Auth()
@ApiTags('Data generation')
@Controller('data')
export class DataGenerationController {
  constructor(private readonly dataService: DataGenerationService) {}
}
