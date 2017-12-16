var aliases = require('./Drivers/aliases');

module.exports.add = addAdapter;
module.exports.get = getAdapter;


var adapters = {
  "postgres": require("./Drivers/DML/postgres.js").Driver
};

function addAdapter(name, constructor) {
  adapters[name] = constructor;
}

function getAdapter(name) {
  if (name in aliases) {
    return getAdapter(aliases[name]);
  } else if (!(name in adapters)) {
    adapters[name] = require("./Drivers/DML/" + name).Driver;
  }

  return adapters[name];
}
