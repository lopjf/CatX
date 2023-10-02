const { network } = require("hardhat");

async function moveTime(amount) {
    await network.provider.send("evm_increaseTime", [amount]);

    console.log(`Moved forward in time ${amount / 60 / 60 / 24} days`);
}

module.exports = {
    moveTime,
};