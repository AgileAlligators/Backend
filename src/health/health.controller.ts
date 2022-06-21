import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: MongooseHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly http: HttpHealthIndicator,
  ) {}

  @HealthCheck()
  @Get()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory heap', 200 * 1024 * 1024),
      () => this.memory.checkRSS('memory rss', 3000 * 1024 * 1024),
      () =>
        this.http.pingCheck('frontend', 'https://agilealligators.timos.design'),
      () =>
        this.http.pingCheck(
          'carrier service',
          'https://agilealligators.timos.design/api/carrier/orders',
          { validateStatus: (status) => status === 401 },
        ),
      () =>
        this.http.pingCheck(
          'account service',
          'https://agilealligators.timos.design/api/account',
          { validateStatus: (status) => status === 401 },
        ),
      () =>
        this.http.pingCheck(
          'location service',
          'https://agilealligators.timos.design/api/location/search',
          { validateStatus: (status) => status === 401, method: 'POST' },
        ),
      () =>
        this.http.pingCheck(
          'idle service',
          'https://agilealligators.timos.design/api/location/idle/search',
          { validateStatus: (status) => status === 401, method: 'POST' },
        ),
      () =>
        this.http.pingCheck(
          'vibration service',
          'https://agilealligators.timos.design/api/vibration/search',
          { validateStatus: (status) => status === 401, method: 'POST' },
        ),
      () =>
        this.http.pingCheck(
          'load service',
          'https://agilealligators.timos.design/api/load/search',
          { validateStatus: (status) => status === 401, method: 'POST' },
        ),
    ]);
  }
}
