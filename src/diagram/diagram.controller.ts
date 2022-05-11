import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/account/guards/perms.guard';
import { DiagramService } from './diagram.service';
import { DiagramFilterDto } from './dto/diagramm-filter.dto';
import { LineDiagramDto } from './dto/line-diagram.dto';

@Auth()
@ApiTags('Diagram')
@Controller('diagram')
export class DiagramController {
  constructor(private readonly diagramService: DiagramService) {}

  @Post('/line-diagram')
  getLineDiagram(@Body() filter: DiagramFilterDto): Promise<LineDiagramDto> {
    return this.diagramService.getLineDiagram(filter);
  }
}
