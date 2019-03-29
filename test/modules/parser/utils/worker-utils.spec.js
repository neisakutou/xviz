// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global Worker, Blob, URL */
import test from 'tape-catch';
import {WorkerFarm} from '@xviz/parser/utils/worker-utils';

let testWorker = null;

if (typeof Worker !== 'undefined') {
  const script = `
    self.onmessage = event => {
      setTimeout(() => self.postMessage(event.data), 50);
    };
  `;
  const blob = new Blob([script], {type: 'application/javascript'});
  testWorker = URL.createObjectURL(blob);
}

test('WorkerFarm', t => {
  if (!testWorker) {
    t.comment('Worker test is browser only');
    t.end();
    return;
  }

  const CHUNKS_TOTAL = 6;
  const MAX_CONCURRENCY = 3;

  let processed = 0;

  const updates = [];
  const callback = message => {
    t.comment(`Worker ${message.worker}, backlog ${message.backlog}: ${message.message}`);
    updates.push(message);
  };

  const workerFarm = new WorkerFarm({
    workerURL: testWorker,
    maxConcurrency: MAX_CONCURRENCY,
    debug: callback
  });

  const onResult = (expected, result) => {
    processed++;
    t.deepEquals(result, expected, 'worker returns expected result');
    if (processed === CHUNKS_TOTAL) {
      workerFarm.destroy();

      const messageCounts = {};
      updates.forEach(u => {
        messageCounts[u.message] = messageCounts[u.message] + 1 || 1;
      });

      t.equals(messageCounts.processing, CHUNKS_TOTAL, 'worker sends processing messages');
      t.ok(messageCounts.waiting >= MAX_CONCURRENCY, 'worker sends waiting messages');
      t.end();
    }
  };

  for (let i = 0; i < CHUNKS_TOTAL; i++) {
    const testData = {chunk: i};
    workerFarm.process(testData, onResult.bind(null, testData), err => t.fail(err));
  }
});
