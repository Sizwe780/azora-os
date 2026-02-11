class Decimal {
  constructor(v) { this.value = v }
  toNumber() { return Number(this.value) }
  toString() { return String(this.value) }
}

module.exports = { Decimal }
