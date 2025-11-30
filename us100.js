const { EventEmitter } = require('events');
const Command = require('./lib/command');
const Queue = require('./lib/queue');

function isValidDistance(distance) {
  return distance >= 20 && distance <= 4500
}

function isValidTemperature(temperature) {
  return temperature >= -20 && temperature <= 70
}

const QUEUE_INTERVAL = 130;
const DISTANCE_INTERVAL = 130;
const TEMPERATURE_INTERVAL = 5000;
const COMMAND_TIMEOUT = 99;

module.exports = class US100 extends EventEmitter {
  constructor(uart) {
    super();

    this.uart = uart
    this.commandQueue = new Queue()
    this.queueIntervalID = null

    this.distance = null
    this.distanceCount = null
    this.distanceIntervalID = null
    this.temperature = null
    this.temperatureCount = null
    this.temperatureIntervalID = null

    // Some chips may have junk input bytes immediately after UART creation.
    // Wait enough time before attaching a handler to uart 'data' event.
    setTimeout(() => {
      this.init();
    }, 100)
  }

  init() {
    this.uart.on('data', (data) => {
      if (this.commandQueue.isEmpty()) {
        console.log('received uart data when no command active: ', data[0]);
        return
      }

      const command = this.commandQueue.peek();
      if (command.isActive() === false) {
        console.log('received uart data when no command active: ', data[0]);
        return
      }

      command.receive(data[0]);

      if (command.hasMeasurement()) {
        clearTimeout(command.timeoutID);
        this.commandQueue.dequeue();

        if (command.id === Command.DISTANCE.id) {
          this.distance = command.getMeasurement();
          this.emit('distance', this.distance, command.elapsed());
        } else if (command.id === Command.TEMPERATURE.id) {
          this.temperature = command.getMeasurement();
          this.emit('temperature', this.temperature, command.elapsed());
        }
      }
    });
  }

  queueHandler() {
    if (this.commandQueue.isEmpty()) return;  // nothing to do

    const currentCommand = this.commandQueue.peek();

    if (currentCommand.isActive()) return;  // wait for active command to finish or timeout
    currentCommand.transmit(this.uart, () => {
       console.log('command timeout');
      //  TODO: the distance reading after a timeout seems crazy, schedule a null reading
    })

    if (currentCommand.id === Command.DISTANCE && this.distanceCount === 0) {
      clearInterval(this.distanceIntervalID);
      this.distanceIntervalID = null;
    } else if (currentCommand.id === Command.TEMPERATURE && this.temperatureCount === 0) {
      clearInterval(this.temperatureIntervalID);
      this.temperatureIntervalID = null;
    }

    if (this.distanceCount === 0 && this.temperatureCount === 0) {
      clearInterval(this.queueIntervalID);
      this.queueIntervalID = null;
    }
  }

  distanceScheduler() {
    if (this.commandQueue.size() > 0) {
      return;  // wait for the command queue to clear before scheduling more distance
    }
    if (this.distanceCount > 0) {
      this.distanceCount -= 1;
      this.commandQueue.enqueue(new Command(Command.DISTANCE, COMMAND_TIMEOUT));
    }
  }

  requestDistance(count = Infinity, interval = DISTANCE_INTERVAL) {
    this.distanceCount = count;
    this.distanceScheduler(); // kick off the measurement
    if (this.distanceIntervalID === null) {
      this.distanceIntervalID = setInterval(() => {
        this.distanceScheduler();
      }, interval);
    }
    if (this.queueIntervalID === null) {
      this.queueIntervalID = setInterval(() => {
        this.queueHandler();
      }, QUEUE_INTERVAL);
    }
  };

  temperatureScheduler() {
    if (this.temperatureCount > 0) {
      this.temperatureCount -= 1;
      this.commandQueue.enqueue(new Command(Command.TEMPERATURE, COMMAND_TIMEOUT));
    }
  }

  requestTemperature(count = Infinity, interval = TEMPERATURE_INTERVAL) {
    this.temperatureCount = count;
    this.temperatureScheduler(); // kick off the measurement
    if (this.temperatureIntervalID === null) {
      this.temperatureIntervalID = setInterval(() => {
        this.temperatureScheduler()
    }, interval);
    }
    if (this.queueIntervalID === null) {
      this.queueIntervalID = setInterval(() => {
        this.queueHandler();
      }, QUEUE_INTERVAL);
    }
  };
}
