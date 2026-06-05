require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const run = async () => {
    await connectDB();
    try {
        const user = await User.create({name: 'test', email: 'test.123@abc.com', password: 'test'});
        console.log('User created', user);
    } catch(e) {
        console.error(e);
    }
    process.exit();
}
run();
