"use strict";
const { MinPriorityQueue } = require("@datastructures-js/priority-queue");

const BREADING_BATCH_SIZE = 5000;

module.exports = async (logSources, printer) => {
  const sourcesSet = new Set();
  const logsQueue = new MinPriorityQueue(({ log: { date } }) => date.getTime());
  const logSourcesLength = logSources.length;

  for (
    let batchStart = 0;
    batchStart < logSourcesLength;
    batchStart += BREADING_BATCH_SIZE
  ) {
    const currentBatch = logSources.slice(
      batchStart,
      batchStart + BREADING_BATCH_SIZE,
    );
    await Promise.all(
      currentBatch.map(async (logSource) => {
        const firstLogEntry = await logSource.popAsync();
        if (firstLogEntry) {
          const logEntryWrapper = {
            logSource,
            log: firstLogEntry,
          };
          logsQueue.enqueue(logEntryWrapper);
          sourcesSet.add(logSource);
        }
      }),
    );
  }

  let logEntryToPrint = logsQueue.dequeue();
  while (logEntryToPrint) {
    printer.print(logEntryToPrint.log);
    const nextLogFromLastSource = await logEntryToPrint.logSource.popAsync();
    if (nextLogFromLastSource)
      logsQueue.enqueue({
        logSource: logEntryToPrint.logSource,
        log: nextLogFromLastSource,
      });
    logEntryToPrint = logsQueue.dequeue();
  }

  printer.done();

  console.log("Async sort complete.");
};
