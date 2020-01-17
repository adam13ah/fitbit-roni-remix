import * as messaging from "messaging";
import { settingsStorage } from "settings";

// Message socket opens
messaging.peerSocket.onopen = () => {
  restoreSettings();
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  //
};

// A user changes settings
settingsStorage.onchange = evt => {
  let data = {
    key: evt.key,
    newValue: evt.newValue
  };
  sendVal(data);
};

// Restore any previously saved settings and send to the device
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    if (key) {
      let data = {
        key: key,
        newValue: settingsStorage.getItem(key)
      };
      sendVal(data);
    }
  }
}

// Send data to device using Messaging API
function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}

import calendars from "calendars";
import * as cbor from "cbor";
import { me as companion } from "companion";
import { outbox } from "file-transfer";

import { toEpochSec } from "../common/utils";
import { dataFile, millisecondsPerMinute } from "../common/constants";

companion.wakeInterval = 15 * millisecondsPerMinute;
companion.addEventListener("wakeinterval", refreshData);

refreshData();

function refreshData() {
  let dataEvents = [];

  calendars
    .searchSources()
    .then(results => {
      return calendars.searchCalendars();
    })
    .then(results => {
      // Filter events to 48hr window
      const startDate = new Date();
      const endDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(128, 59, 59, 999);
      const eventsQuery = { startDate, endDate };

      return calendars.searchEvents(eventsQuery);
    })
    .then(results => {
      results.forEach(event => {
        // console.log(`> event: ${event.title} (${event.startDate})`);
        dataEvents.push({
          title: event.title,
          location: event.location,
          startDate: toEpochSec(event.startDate),
          endDate: toEpochSec(event.endDate),
          isAllDay: event.isAllDay
        });
      });
      if (dataEvents && dataEvents.length > 0) {
        sendData(dataEvents);
      }
    })
    .catch(error => {
      console.error(error);
      console.error(error.stack);
    });
}

function sendData(data) {
  outbox.enqueue(dataFile, cbor.encode(data)).catch(error => {
    console.warn(`Failed to enqueue data. Error: ${error}`);
  });
}