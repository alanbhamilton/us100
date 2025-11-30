const US100 = require('../us100');
const { UART } = require('uart');

const uartOptions = {
  baudrate: 9600,
  tx: 16,
  rx: 17,
};
const us100 = new US100(new UART(0, uartOptions));

us100.on('distance', (distance, elapsed) => {
  // console.log('distance:', distance);
  console.log(`distance: ${distance} (${elapsed} ms)`);
})

us100.on('temperature', (temperature) => {
  console.log('temperature:', temperature);
})

// us100.requestDistance()
// us100.requestTemperature(20)

const PIN_MODE = {
  INPUT: 0,
  OUTPUT: 1,
  INPUT_PULLUP: 2,
  INPUT_PULLDOWN: 3,
};

const WATCH_MODE = {
  LOW_LEVEL: 1,
  HIGH_LEVEL: 2,
  FALLING: 4,
  RISING: 8,
  CHANGE: 12,
};

const { Button } = require('button');
const buttonConfig = {
  mode: PIN_MODE.INPUT_PULLDOWN,
  event: WATCH_MODE.RISING,
};
const button = new Button(23, buttonConfig);

const led = board.LED  // board.LED=25 for pico, pico2 board because GPIO 25 is connected to on board LED.
pinMode(led, OUTPUT);

button.on('click', () => {
  // console.log('button state: ' + button.read());
  digitalToggle(led);
  if (us100.isActiveDistance()) {
    us100.stopDistance();
    us100.stopTemperature();
  } else {
    us100.requestDistance();
    us100.requestTemperature();
  }
});
