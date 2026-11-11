const crypto = require("crypto");
const hashOTP = require("./hashOTP");

const verifyOTP = (enteredOTP, storedHash) => {
    const enteredHash = hashOTP(enteredOTP);

    const enteredBuffer = Buffer.from(enteredHash, "hex");
    const storedBuffer = Buffer.from(storedHash, "hex");

    if (enteredBuffer.length !== storedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(enteredBuffer,storedBuffer)
}

module.exports = verifyOTP