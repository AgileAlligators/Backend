import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ROrganisation } from 'src/account/decorators/account.decorator';
import { Auth } from 'src/account/guards/perms.guard';
import { DiagramService } from './diagram.service';
import { DiagramFilterDto } from './dto/diagram-filter.dto';
import { DiagramDto } from './dto/diagram.dto';

@Auth()
@ApiTags('Diagram')
@Controller('diagram')
export class DiagramController {
  constructor(private readonly diagramService: DiagramService) {}

  @ApiOperation({ description: 'Create a load diagram with given filter' })
  @ApiResponse({
    type: [DiagramDto],
    description: 'Returns the requested data for a load diagram',
  })
  @ApiBody({ type: DiagramFilterDto, required: true })
  @Post('load')
  async getLoadDiagram(
    @Body() filter: DiagramFilterDto,
    @ROrganisation() organisation: string,
  ): Promise<DiagramDto[]> {
    return this.diagramService.getLoadOverTime(organisation, filter);
  }

  @ApiOperation({ description: 'Create a idle diagram with given filter' })
  @ApiResponse({
    type: [DiagramDto],
    description: 'Returns the requested data for a idle diagram',
  })
  @ApiBody({ type: DiagramFilterDto, required: true })
  @Post('idle')
  async getIdleDiagram(
    @Body() filter: DiagramFilterDto,
    @ROrganisation() organisation: string,
  ): Promise<DiagramDto[]> {
    return this.diagramService.getIdleOverTime(organisation, filter);
  }

  @ApiOperation({ description: 'Create a vibration diagram with given filter' })
  @ApiResponse({
    type: [DiagramDto],
    description: 'Returns the requested data for a vibration diagram',
  })
  @ApiBody({ type: DiagramFilterDto, required: true })
  @Post('vibration')
  async getVibrationDiagram(
    @Body() filter: DiagramFilterDto,
    @ROrganisation() organisation: string,
  ): Promise<DiagramDto[]> {
    return this.diagramService.getVibrationOverTime(organisation, filter);
  }
}
