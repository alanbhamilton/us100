module.exports = class Command {
  constructor({id, dataLength, get}, timeout) {
    this.id = id;
    this.dataLength = dataLength;
    this.get = get;
    this.timestamp;
    this.timeout = timeout;
    this.timeoutID = null;
    this.rxBuffer = [];
  }

  isActive() {
    return this.timeoutID !== null;
  }

  receive(data) {
    this.rxBuffer.push(data);
  }

  transmit(uart, timeoutFn) {
    this.timestamp = millis();
    uart.write(new Uint8Array([this.id]));
    this.timeoutID = setTimeout(timeoutFn, this.timeout);
  }

  elapsed() {
    return millis() - this.timestamp;
  }

  hasMeasurement() {
    return this.rxBuffer.length === this.dataLength;
  }

  getMeasurement() {
    clearTimeout(this.timeoutID);
    return this.get(this.rxBuffer);
  }
}

Command.DISTANCE = {
  id: 0x55,
  dataLength: 2,
  get: (data) => (data[0] * 256) + data[1]
}

Command.TEMPERATURE = {
  id: 0x50,
  dataLength: 1,
  get: (data) => data[0] - 45 // 45 is a magic number
}
