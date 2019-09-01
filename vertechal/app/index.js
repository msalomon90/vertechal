import clock from "clock";
import * as util from "../common/utils";
import { display } from "display";
import { battery } from "power";

// Update the clock every minute
clock.granularity = "minutes";
// Get a handle on the <text> element

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  //if (display.on) {
    util.updateTime(evt);
    util.updateBattery();  
    util.updateSteps();
  //}
};


