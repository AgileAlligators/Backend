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
  @ApiBody({
    type: DiagramFilterDto,
    required: true,
  })
  @Post('/diagram/load')
  getLoadDiagram(
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
  @ApiBody({
    type: DiagramFilterDto,
    required: true,
  })
  @Post('/diagram/idle')
  getIdleDiagram(
    @Body() filter: DiagramFilterDto,
    @ROrganisation() organisation: string,
  ): Promise<DiagramDto[]> {
    return this.diagramService.getIdleOverTime(organisation, filter);
  }
}
