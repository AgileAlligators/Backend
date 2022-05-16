import { writeFileSync } from 'fs';

const TIME_DIFF = 6000;
const LOAD_COUNT_PER_CARRIER = 100;

const CARRIER_IDS = [
  '6281285f37be3a7921b94997',
  '6281285f37be3a7921b94998',
  '6281285f37be3a7921b94999',
  '6281285f37be3a7921b9499a',
  '6281285f37be3a7921b9499b',
  '6281285f37be3a7921b9499c',
  '6281285f37be3a7921b9499d',
  '6281285f37be3a7921b9499e',
  '6281285f37be3a7921b9499f',
  '6281285f37be3a7921b949a0',
  '6281285f37be3a7921b949a1',
  '6281285f37be3a7921b949a2',
  '6281285f37be3a7921b949a3',
  '6281285f37be3a7921b949a4',
  '6281285f37be3a7921b949a5',
];

let loads = [];

const now = Date.now();

for (const id of CARRIER_IDS) {
  for (let index = 0; index < LOAD_COUNT_PER_CARRIER; index++) {
    loads.push({
      carrierId: id,
      timestamp: now + index * TIME_DIFF,
      load: Math.random(),
    });
  }
}

writeFileSync('./test_data/loads.json', JSON.stringify(loads), 'utf8');
