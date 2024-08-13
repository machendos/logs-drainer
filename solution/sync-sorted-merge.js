"use strict";
const { MinPriorityQueue } = require("@datastructures-js/priority-queue");

module.exports = (logSources, printer) => {
  const sourcesSet = new Set();
  const logsQueue = new MinPriorityQueue(({ log: { date } }) => date.getTime());

  logSources.forEach((logSource) => {
    const firstLogEntry = logSource.pop();
    if (firstLogEntry) {
      const logEntryWrapper = {
        logSource,
        log: firstLogEntry,
      };
      logsQueue.enqueue(logEntryWrapper);
      sourcesSet.add(logSource);
    }
  });

  let logEntryToPrint = logsQueue.dequeue();
  while (logEntryToPrint) {
    printer.print(logEntryToPrint.log);
    const nextLogFromLastSource = logEntryToPrint.logSource.pop();
    if (nextLogFromLastSource)
      logsQueue.enqueue({
        logSource: logEntryToPrint.logSource,
        log: nextLogFromLastSource,
      });
    logEntryToPrint = logsQueue.dequeue();
  }

  printer.done();

  return console.log("Sync sort complete.");
};
