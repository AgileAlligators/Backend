import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/account/guards/perms.guard';
import { DataGenerationService } from './data-generation.service';

@Auth()
@ApiTags('Data generation')
@Controller('data')
export class DataGenerationController {
  constructor(private readonly dataService: DataGenerationService) {}

  @ApiOperation({ description: 'Generates test data and writes it into the database' })
  @ApiResponse({
    type: String,
    description: 'Returns a simple notification',
  })
  @Get('generate-and-write')
  async getLoadDiagram(): Promise<string> {
    this.dataService.generateData();
    return 'Started generation and writing of data';
  }
}
