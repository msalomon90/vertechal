import clock from "clock";
import * as util from "../common/utils";
import { display } from "display";

// Update the clock every minute
clock.granularity = "minutes";
// Get a handle on the <text> element

// Update the <text> element every tick with the current time
clock.ontick = (evt) => util.updateTime(evt);

display.onchange = function() {
    if (display.on) {
      util.updateBattery();  
    } else {
      
    }
};


