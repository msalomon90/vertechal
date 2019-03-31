import document from "document";
import { preferences } from "user-settings";
import { battery } from "power";
import { me as appbit } from "appbit";    // request permission for goals
import { today, goals } from "user-activity";    // goals interface

const time_label     = document.getElementById("time-text");
const battery_bar    = document.getElementById("battery-bar");
const percent_label  = document.getElementById("battery-percentage");
//const battery_block = document.getElementById("battery-block-id");

// Add zero in front of numbers < 10
export function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

export function updateTime(evt)
{
  
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = zeroPad(hours);
  }
  let mins = zeroPad(today.getMinutes());
  let seconds = zeroPad(today.getSeconds());
  time_label.text = `${hours}:${mins}`;
}

// Inserts new battery block in correct location inside the battery bar
function insertBatteryBlock(full_block_qty)
{           
  let total_battery_blocks   = 10;  // each block is 10%
  let active_block_opacity   = 10;
  let inactive_block_opacity = 0.3;
  
  let block_start_y = 272;        // starting y coordinate of blocks (in pixels)
  let block_pad     = 3;          // space between blocks
  let block_height  = 25 + block_pad;   
  
  let battery_block;
  
  for(let i = 0; i < total_battery_blocks; i++)     
  {
    battery_block = document.getElementById("battery-block-" + i);
    battery_block.y = block_start_y - (i * block_height);
    
    if(i < full_block_qty){
      battery_block.style.opacity = active_block_opacity;
    }
    else{
      //battery_block.style.visibility='hidden';
      battery_block.style.opacity = inactive_block_opacity;
    }
    
  }
}

// Updates the battery percentage blocks to reflect watch battery
export function updateBattery()
{
  console.log("Updating battery bar...");
  
  let percentage       = Math.floor(battery.chargeLevel); // percentage from battery api
  let remainder        = percentage % 10;                 // used for blocks less than 10% increments
  let full_block_qty   = (percentage - remainder) / 10;   // number of full blocks
  
  percent_label.text = percentage + '%';
  insertBatteryBlock(full_block_qty);
  
  if(remainder)    // insert a small block (percentage % 10 != 0)
  {
    let small_block   = remainder * 2.5;               // size of remainder block
    let max_y         = 299;                           // max number of pixels vertically
    let block_size    = 28;                            // size of block in pixels
    let block_gap     = 3;                             // gap size between blocks
    let battery_block = document.getElementById("battery-block-10");    // block to fill percentage overflow of next block
    
    battery_block.height = small_block;
    battery_block.y = max_y - ((full_block_qty * block_size) + block_gap + small_block);   // location of overflow block   
    battery_block.style.opacity = 10;  
  }
  
}

export function updateSteps()
  {
    if(appbit.permissions.granted("access_activity")) 
    {
        console.log("Updating steps bar...");
        let bar_slice_height = 280 / goals.steps;                  // divided by 300 pixel height
        let bar_height = today.adjusted.steps * bar_slice_height;  // number of steps by bar height
        let step_goal_bar = document.getElementById("step-bar");

        let step_label = document.getElementById("step-text");
        let goal_text  = goals.step < 1000? goals.step: (goals.step/1000) + "k";
        step_label.text = 

        step_goal_bar.height = bar_height;
        step_goal_bar.y = 300 - bar_height;   
     }
  }
