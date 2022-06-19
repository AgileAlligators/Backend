import { FilterQuery } from 'mongoose';
import { CarrierTimestampFilterDto } from 'src/carrier/dtos/carrier-timestamp-filter.dto';

export function timestampFilter(
  dto?: CarrierTimestampFilterDto,
): FilterQuery<{ timestamp: number }> {
  if (!dto) return {};

  const { start, end } = dto;

  const fq: FilterQuery<{ timestamp: number }> = {};
  if (start !== undefined && end === undefined) fq.timestamp = { $gte: start };
  else if (start == undefined && end !== undefined)
    fq.timestamp = { $lte: end };
  else if (start !== undefined && end !== undefined)
    fq.timestamp = { $gte: start, $lte: end };

  return fq;
}
