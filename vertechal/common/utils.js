import document from "document";
import { preferences } from "user-settings";
import { battery } from "power";
import { me as appbit } from "appbit";           // request permission for goals
import { today, goals } from "user-activity";    // goals interface

const time_label     = document.getElementById("time-text");
const ampm_label     = document.getElementById("ampm-text");
const date_label     = document.getElementById("date-text");
const battery_bar    = document.getElementById("battery-bar");
const percent_label  = document.getElementById("battery-percentage");

/* Month and weekday arrays for date label */
const months = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC"
];

const weekdays = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT"
];

/* Adds zero in front of numbers < 10 
 * used for minutes and 24hr format */
function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

/* Center aligns the time and ampm text
 * The alignment is based on the total pixel count of each digit and space of 'xx:xx am' text
 * Digit '1' has a lower pixel count of 12px, while all other numbers are defaulted to 27px */
function alignTimeText(hours, mins)
{         
  let digit_1_px = 12;                          // pixel amount of digit '1' 
  let digit_default_px = 27;                    // default pixel amount of digits 2..9

  /* set default values to each digit of xx:xx format */
  let h1_px = 0;                                // 1st digit (usually 0 except for hours 10, 11, and 12)
  let h2_px = digit_default_px;   
  let m1_px = digit_default_px;   
  let m2_px = digit_default_px;   

  /* get 1st and 2nd digits of hours */
  let h1_digit = Math.floor(((hours)/10) % 10);  // math is cool!
  let h2_digit = Math.floor(((hours)/1) % 10);

  /* check to see if one of the hour digits is a '1' */
  h1_px = (h1_digit == 1)? digit_1_px: m1_px;
  h2_px = (h2_digit == 1)? digit_1_px: m2_px;

  /* get 1st and 2nd digits of mins */
  let m1_digit = Math.floor(((mins)/10) % 10);  
  let m2_digit = Math.floor(((mins)/1) % 10);     

  /* check to see if one of the min digits is a '1' */
  m1_px = (m1_digit == 1)? digit_1_px: m1_px;    
  m2_px = (m2_digit == 1)? digit_1_px: m2_px;     

  let digit_space_count = (h1_px == 0)? 3: 4;   // spaces in between 'xx:xx am' text based on hour digits 
  let digit_space_px = 9 * digit_space_count;   // space pixel = 9, multiplied by how many spaces needed
  let ampm_space_px = 9;                        // space between xx:xx and 'am' 
  let ampm_px = 39;                             // pixel amount for 'am/pm' text

  /* calculates the entire pixel amount for the time and ampm label (including spaces) */
  let time_text_total_px = digit_space_px + h1_px + h2_px + m1_px + m2_px + ampm_space_px + ampm_px;

  /* calculates the time and ampm label positions based on the total pixel count (see css for alignment anchor info) */
  let time_label_position = (300 - time_text_total_px) / 2;             // centers based on 300px span of versa display
  let ampm_label_position =  time_label_position + time_text_total_px;  

  /* set x coordinates of time and ampm labels, noice */
  time_label.x = time_label_position;   
  ampm_label.x = ampm_label_position;
}

/* Inserts new battery block in correct location inside the battery bar */
function insertBatteryBlock(full_block_qty)
{           
  let total_battery_blocks   = 10;      // amount of blocks needed (each block is 10%)
  let active_block_opacity   = 1;
  let inactive_block_opacity = 0.3;
  
  let block_start_y = 272;              // starting y coordinate of blocks 
  let block_pad     = 3;                // pixel amount between blocks
  let block_height  = 25 + block_pad;   
  
  let battery_block;
  
  /* sets the position of each block */
  for(let i = 0; i < total_battery_blocks; i++)     
  {
    battery_block = document.getElementById("battery-block-" + i);
    battery_block.y = block_start_y - (i * block_height);
    
    if(i < full_block_qty){
      battery_block.style.opacity = active_block_opacity;       // darker shade for active blocks
    }
    else{
      battery_block.style.opacity = inactive_block_opacity;     // lighter shade for inactive blocks
    }
  }
}

/* Sets time and date labels to corresponding values */
export function updateTime(evt)
{
  let today = evt.date;
  let hours = today.getHours();
  let mins = zeroPad(today.getMinutes());         // pads single digit minutes with 0
  let ampm;

  if (preferences.clockDisplay === "12h") {       // 12hr format
    hours = hours % 12 || 12;
    ampm = today.getHours() < 12? "AM": "PM";
    alignTimeText(hours, mins);
  } else {                                        // 24hr format
    hours = zeroPad(hours);
    time_label.x = 150;                           // is exactly centered aligned (no ampm to worry about)
    date_label.x = 150;
    time_label.textAnchor = "middle";
    date_label.textAnchor = "middle";             // TODO: check css if this is needed here
  }
  //let seconds = zeroPad(today.getSeconds());
  let weekday = weekdays[today.getDay()];
  let month   = months[today.getMonth()];
  
  /* set all labels */
  time_label.text = `${hours}:${mins}`;
  ampm_label.text = (ampm)?`${ampm}`: "";
  date_label.text = `${weekday} ${month} ${today.getDate()}`
}

/* Updates the battery percentage blocks to reflect watch battery */
export function updateBattery()
{
  console.log("Updating battery bar...");
  
  let percentage       = Math.floor(battery.chargeLevel); // percentage from battery api
  let remainder        = percentage % 10;                 // used for blocks less than 10% increments
  let full_block_qty   = (percentage - remainder) / 10;   // number of full blocks (current battery)
  
  percent_label.text = percentage + '%';               
  insertBatteryBlock(full_block_qty);                  // display full blocks
  
  /* insert a small block (percentage % 10 != 0), not a full 10% */
  if(remainder)    
  {
    let small_block   = remainder * 2.5;               // size of remainder block (25px/10 = 2.5 each increment)
    let max_y         = 299;                           // max number of pixels vertically
    let block_size    = 28;                            // size of block in pixels (includes the 3px pad between)
    let block_gap     = 3;                             // gap size between blocks
    let battery_block = document.getElementById("battery-block-10");    // block to fill percentage overflow of next block
    
    battery_block.height = small_block;
    battery_block.y = max_y - ((full_block_qty * block_size) + block_gap + small_block);   // location of overflow block   
    battery_block.style.opacity = 1;  
  }

}

/* Adjusts the steps bar by step goal increments
 * ie. goal is 6k, but user reaches 7k, the bar will reset for another 6k with the
 * new goal being 12k... Motivation :D */
export function updateSteps()
  {
    if(appbit.permissions.granted("access_activity")) 
    {
        console.log("Updating steps bar...");

        let bar_height = 0;                           // number of steps
        let bar_slice_height = 0                      // divided by 300 pixel height
        let goal_text = 0 
        let STEP_TOTAL = today.adjusted.steps;
        let STEP_GOAL = goals.steps;

        if(STEP_TOTAL <= STEP_GOAL)                    // haven't reached goal
        {
          bar_slice_height = 280 / STEP_GOAL;          // 280 (20px left for step goal text)           
          bar_height = STEP_TOTAL * bar_slice_height;  
        }
        else
        {
          bar_slice_height = 280 / (2 * STEP_GOAL);                       // slice by new goal amount (2x)
          bar_height = (STEP_TOTAL - STEP_GOAL) * bar_slice_height;       // resets bar to start at the bottom again
          STEP_GOAL = 2 * STEP_GOAL;                                      // double the step goal :D
        }// step goal ajustment

        goal_text  = STEP_GOAL < 1000? STEP_GOAL: (STEP_GOAL/1000) + 'k';  // add 'k' only if steps > 1000
        let step_goal_bar = document.getElementById("step-bar");
        let step_label = document.getElementById("step-text");

        step_label.text = goal_text;
        step_goal_bar.height = bar_height;    // set height
        step_goal_bar.y = 300 - bar_height;   // set position
     }
  }
