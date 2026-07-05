const Razorpay = require('razorpay');
const client = new Razorpay({ key_id: 'rzp_test_Si3MzFitR2N02d', key_secret: 'AbtaSiN2MB0huB24VejK3CWJ' });
const options = { amount: 5000 * 100, currency: 'INR', receipt: 'receipt_' + Date.now() };
client.orders.create(options).then(console.log).catch(err => console.error(JSON.stringify(err, null, 2)));
