import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ROrganisation } from 'src/account/decorators/account.decorator';
import { Auth } from 'src/account/guards/perms.guard';
import { DiagramService } from './diagram.service';
import { DiagramFilterDto } from './dto/diagram-filter.dto';
import { LineDiagramDto } from './dto/line-diagram.dto';

@Auth()
@ApiTags('Diagram')
@Controller('diagram')
export class DiagramController {
  constructor(private readonly diagramService: DiagramService) {}

  @ApiOperation({ description: 'Create a line diagram with given filter' })
  @ApiResponse({
    type: [LineDiagramDto],
    description: 'Returns the requested data for a line diagram',
  })
  @ApiBody({
    type: DiagramFilterDto,
    required: true,
  })
  @Post('/line-diagram')
  getLineDiagram(
    @Body() filter: DiagramFilterDto,
    @ROrganisation() organisation: string,
  ): Promise<LineDiagramDto[]> {
    return this.diagramService.getLineDiagram(organisation, filter);
  }
}
