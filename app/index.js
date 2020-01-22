import Battery from "./inc/battery";
import Clock from "./inc/clock";
import Messaging from "./inc/messaging";
import UI from "./inc/ui";
import FileStore from "./inc/fileStore";
import { display } from "display";

import document from "document";

import * as appointment from "./inc/appointment";
import * as clock from "./inc/clock";
import { fromEpochSec, timeUntil } from "../common/utils";

const time = document.getElementById("time");
const title = document.getElementById("title");
const calendar_img = document.getElementById("calendar_img");
const details = document.getElementById("details");

//clock.initialize("minutes", data => {
  // Clock ticked, update UI
//  time.text = data.time;
//  renderAppointment();
//});

display.addEventListener("change", () => {
  // Automatically stop all sensors when the screen is off to conserve battery
  display.on ? sensors.map(sensor => sensor.start()) : sensors.map(sensor => sensor.stop());
  if (display.on == true){
    Messaging.run();
    updateActivity();
    renderAppointment();
  }
});

appointment.initialize(() => {
  // We have fresh calendar data
  clock.tick();
  renderAppointment();
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
};

UI.instance.restore();

Battery.run();
Clock.run(FileStore.instance);
Messaging.run();
