require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log('MongoDB Connected');
    
    const adminExists = await User.findOne({ email: 'admin@organmatch.com' });
    if (!adminExists) {
        await User.create({
            username: 'admin',
            email: 'admin@organmatch.com',
            password_hash: 'admin123',
            role: 'super_admin'
        });
        console.log('Admin user created (admin@organmatch.com / admin123)');
    } else {
        console.log('Admin already exists.');
    }
    
    const hospitalExists = await User.findOne({ email: 'hospital@organmatch.com' });
    if (!hospitalExists) {
        await User.create({
            username: 'ApolloHospital',
            email: 'hospital@organmatch.com',
            password_hash: 'hospital123',
            role: 'hospital_admin'
        });
        console.log('Hospital Admin user created (hospital@organmatch.com / hospital123)');
    } else {
        console.log('Hospital Admin already exists.');
    }

    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
