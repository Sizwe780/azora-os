class KycAmlService {
  async checkUser(userData) {
    // Mock KYC check
    if (!userData.name || !userData.idNumber) return { approved: false, reason: 'Missing info' };
    return { approved: true, risk: 'low' };
  }

  async checkTransaction(amount) {
    // Mock AML check
    if (amount > 10000) return { flagged: true, reason: 'Large amount' };
    return { flagged: false };
  }
}

module.exports = new KycAmlService();