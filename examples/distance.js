const US100 = require('../us100');
const { UART } = require('uart');

const uartOptions = {
  baudrate: 9600,
  tx: 16,
  rx: 17,
};
const us100 = new US100(new UART(0, uartOptions));

us100.on('distance', (distance) => {
  console.log('distance:', distance);
})

us100.on('temperature', (temperature) => {
  console.log('temperature:', temperature);
})

us100.requestDistance()
us100.requestTemperature(20)
