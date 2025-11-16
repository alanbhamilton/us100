console.log('top')

const { UART } = require('uart');
const uartOptions = {
  baudrate: 9600,
  // stop: 2,
  tx: 16,
  rx: 17,
};
const uart0 = new UART(0, uartOptions);
const GET_DISTANCE = 0x55;
const GET_TEMPERATURE = 0x50;

let distanceReading = [];
let distanceInt = null;
let distanceCommandActive = false;

const COMMAND_INTERVAL = 130;
const COMMAND_TIMEOUT = 99;
let commandStartTime = null;
let commandTimeoutID = null;

uart0.on('data', (data) => {
  if (distanceCommandActive === false) {
    console.log('received data when no command active: ', data[0]);
  }

  distanceReading.push(data[0]);

  if (distanceReading.length === 2) {
    // console.log(distanceReading[0], distanceReading[1])
    const mm = (distanceReading[0] * 256) + distanceReading[1];
    // if (mm !== distanceInt) {
    //   console.log(`${mm} mm`);
    //   distanceInt = mm;
    // }
    console.log(mm, millis() - commandStartTime);
    // distanceReading = [];
    distanceCommandActive = false;
    clearTimeout(commandTimeoutID);
  }
});

setInterval(() => {
  if (distanceCommandActive) {
    console.log('Command did not time out.');
  }
  uart0.write(new Uint8Array([GET_DISTANCE]));
  distanceReading = [];
  distanceCommandActive = true;
  commandStartTime = millis();
  commandTimeoutID = setTimeout(() => {
    console.log('command timeout');
    distanceCommandActive = false;
  }, COMMAND_TIMEOUT);
}, COMMAND_INTERVAL);



// const PIN_MODE = {
//   INPUT: 0,
//   OUTPUT: 1,
//   INPUT_PULLUP: 2,
//   INPUT_PULLDOWN: 3,
// };

// const WATCH_MODE = {
//   LOW_LEVEL: 1,
//   HIGH_LEVEL: 2,
//   FALLING: 4,
//   RISING: 8,
//   CHANGE: 12,
// };

// const { Button } = require('button');
// const buttonConfig = {
//   mode: PIN_MODE.INPUT_PULLDOWN,
//   event: WATCH_MODE.RISING,
// };
// const button = new Button(23, buttonConfig);

// const led = board.LED  // board.LED=25 for pico, pico2 board because GPIO 25 is connected to on board LED.
// pinMode(led, OUTPUT);

// console.log("Start");

// button.on('click', () => {
//   // console.log('button state: ' + button.read());
//   // digitalToggle(led);
//   distanceReading = []
//   uart0.write(new Uint8Array([0x55]));
// });
