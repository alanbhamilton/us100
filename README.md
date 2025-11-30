# US-100

Kaluma library for US-100 ultrasonic distance sensor.

# Install

```sh
npm install https://github.com/alanbhamilton/us100
```

# Usage

```js
const US100 = require('../us100');
const { UART } = require('uart');
const us100 = new US100(new UART(0, {baudrate: 9600, tx: 16, rx: 17}));
us100.on('distance', (distance) => {
  console.log('distance:', distance);
})
us100.requestDistance(1)
```

# API

## Class: US100

### new US100(uart)

- **`uart`** `<object>` Instance of uart object.

Create an instance of `US100` class.

### us100.requestDistance(count, interval)
- **count** `<number>` Number of distance meaurements. Default Infinity
- **interval** `<number>` Interval between distance measurements. Default 130 ms
- **return** `undefined`

### us100.stopDistance()
- **return** `undefined`

### us100.requestTemperature(count, interval)
- **count** `<number>` Number of temperature meaurements. Default Infinity
- **interval** `<number>` Interval between temperature measurements. Default 5 sec
- **return** `undefined`

### us100.stopTemperature()
- **return** `undefined`
