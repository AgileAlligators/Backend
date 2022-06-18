import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { CarrierService } from 'src/carrier/carrier.service';
import { Carrier } from 'src/carrier/schemas/Carrier.schema';

@Injectable()
export class DataGenerationService {
  constructor(private readonly carrierService: CarrierService) {}

  readonly ORGANISATION = 'Porsche';
  readonly STARTING_TIME = 1655244000000; // 14.06.2022, 00:00:00
  readonly TIME_DIFF = 60 * 60 * 1000;
  readonly DATA_POINT_COUNT = 24 * 7 * 4;
  readonly PATH_LENGTH = 7;
  readonly PATHS = [
    [
      [49.47026987686929, 8.484819323024114],
      [49.47012752793328, 8.485738470135876],
      [49.46958612574957, 8.48647376107518],
      [49.46919215799898, 8.486501116963773],
      [49.468879533872816, 8.486180380864516],
      [49.46870417130776, 8.48535902529357],
      [49.46876772525406, 8.484451636409934],
    ],
    [
      [49.468794206638364, 8.484443060090452],
      [49.46860103218402, 8.4847911542942],
      [49.46870777935093, 8.485413037061624],
      [49.468918726865574, 8.486441696304967],
      [49.46896703403072, 8.485659451715822],
      [49.46894670605824, 8.485174459270246],
      [49.468773872676586, 8.484446971111103],
    ],
    [
      [49.47026987686929, 8.484819323024114],
      [49.46958213390018, 8.485600788631094],
      [49.469622808933906, 8.484904589254942],
      [49.468913669991466, 8.48475986264251],
      [49.46867982608055, 8.4853191557698],
      [49.469599925685436, 8.48562034543257],
      [49.47026987686929, 8.484819323024114],
    ],
    [
      [49.46893143656886, 8.486488609452536],
      [49.46892634957462, 8.486641146260784],
      [49.469587217129174, 8.48561643376475],
      [49.46961007735539, 8.486484732081692],
      [49.46921610937716, 8.486512090793282],
      [49.46910426140689, 8.487000988273635],
      [49.468870460654344, 8.484767684353887],
    ],
    [
      [49.46869761761499, 8.485362178608247],
      [49.46895179052578, 8.48531916223483],
      [49.470199779999206, 8.48485375318583],
      [49.470143852915896, 8.485722057060878],
      [49.46922627118685, 8.486731119759446],
      [49.468926360260575, 8.486148334208096],
      [49.46927967765444, 8.48477942374421],
    ],
    [
      [49.470146394698915, 8.4857181458673],
      [49.46858832931768, 8.484767679712485],
      [49.46891618292685, 8.486629411642802],
      [49.46858832931768, 8.484767679712485],
      [49.46958213421036, 8.485577320716285],
      [49.469638059602076, 8.484857654217869],
      [49.46916021746118, 8.484677730702826],
    ],
    [
      [49.46960246953865, 8.485605581815923],
      [49.46959993465854, 8.484874177026736],
      [49.46883754841448, 8.484760550284326],
      [49.46895696966318, 8.485311866416986],
      [49.46893154765082, 8.486168164252437],
      [49.46940925309567, 8.48604306139952],
      [49.4695972915844, 8.485597318359476],
    ],
  ];
  readonly CARRIERS_PER_ORDER = 10;
  readonly CUSTOMERS = [
    'Porsche Standort 1',
    'Porsche Standort 2',
    'Porsche Standort 3',
  ];
  readonly TYPES = ['Bremsscheibe', 'Motorhaube', 'Fluxkompensator'];

  public async generateData() {
    const carriers = await this.generateCarriers();
    const carriersGroupedByOrder: Map<string, Carrier[]> = carriers.reduce(
      (map, carrier) => {
        const entry: Carrier[] = map.get(carrier.order);
        if (!!entry) {
          map.set(carrier.order, [...entry, carrier]);
        } else {
          map.set(carrier.order, [carrier]);
        }
        return map;
      },
      new Map(),
    );

    for (const order of carriersGroupedByOrder.values()) {
      const orderPath = this.PATHS[randomInt(0, this.PATHS.length)];
      const pathDuration = 24 * randomInt(1, 5);
      const pathCyclesCount = Math.ceil(this.DATA_POINT_COUNT / pathDuration);
      const stationDuration = [
        ((1 + randomInt(0, 3)) / 24) * pathDuration,
        ((4 + randomInt(0, 3)) / 24) * pathDuration,
        ((7 + randomInt(0, 3)) / 24) * pathDuration,
        ((10 + randomInt(0, 3)) / 24) * pathDuration,
        ((13 + randomInt(0, 3)) / 24) * pathDuration,
        ((17 + randomInt(0, 3)) / 24) * pathDuration,
        pathDuration,
      ];
      const stationLoad = [1, 0, 0, 0, 0, 0, 0];

      for (let index = 1; index < this.PATH_LENGTH - 1; index++) {
        const newLoad =
          stationLoad[index - 1] - (Math.round(Math.random() * 2) * 0.1 + 0.1);
        stationLoad[index] = newLoad > 0 ? newLoad : 0;
      }

      for (const carrier of order) {
        let timeProgress = 0;
        for (let cycle = 0; cycle < pathCyclesCount; cycle++) {
          let station = 0;
          for (let hour = 0; hour < pathDuration; hour++) {
            if (hour >= stationDuration[station]) {
              station++;
            }

            // await this.carrierService.storeLocation(
            //   this.ORGANISATION,
            //   carrier.id,
            //   {
            //     latitude: orderPath[station][0],
            //     longitude: orderPath[station][1],
            //     timestamp: this.STARTING_TIME + this.TIME_DIFF * timeProgress,
            //   },
            // );
            // await this.carrierService.storeLoad(this.ORGANISATION, carrier.id, {
            //   load: stationLoad[station],
            //   timestamp: this.STARTING_TIME + this.TIME_DIFF * timeProgress,
            // });
            timeProgress++;
          }
        }
      }
    }
    console.log(
      '************************** finished writing data **************************',
    );
  }

  private async generateCarriers(): Promise<Carrier[]> {
    let orderCount = 0;
    for (const type of this.TYPES) {
      for (const customer of this.CUSTOMERS) {
        for (let index = 0; index < this.CARRIERS_PER_ORDER; index++) {
          await this.carrierService.create(this.ORGANISATION, {
            customer: customer,
            order: type + '_' + orderCount,
            type: type,
          });
        }
        orderCount++;
      }
    }
    return (await this.carrierService.search(this.ORGANISATION)).results;
  }
}
