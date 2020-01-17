import Battery from "./inc/battery";
import Clock from "./inc/clock";
import Messaging from "./inc/messaging";
import UI from "./inc/ui";
import FileStore from "./inc/fileStore";
import * as appointment from "./inc/appointment";

import { fromEpochSec, timeUntil, trimString } from "../common/utils";

const time = document.getElementById("time");
const title = document.getElementById("title");
const details = document.getElementById("details");

clock.initialize("minutes", data => {
  // Clock ticked, update UI
  time.text = data.time;
  renderAppointment();
});

appointment.initialize(() => {
  // We have fresh calendar data
  clock.tick();
});

function renderAppointment() {
  let event = appointment.next();
  if (event) {
    title.text = event.title.substr(0, 20);
    details.text = `${timeUntil(fromEpochSec(event.startDate))} ${
      event.location ? `@ ${event.location}` : ""
    }`;
  } else {
    title.text = "No appointments";
    details.text = "";
  }
}

UI.instance.restore();

Battery.run();
Clock.run(FileStore.instance);
Messaging.run();
