const aviation = require('./aviation');
const defense = require('./defense');
const compliance = require('./compliance');
const corridor = require('./corridor');
const dashboard = require('./dashboard');
const reputation = require('./reputation');

module.exports = {
  ...aviation,
  ...defense,
  ...compliance,
  ...corridor,
  ...dashboard,
  ...reputation,
};
