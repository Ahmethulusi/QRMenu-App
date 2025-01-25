const express = require('express');
const cors = require('cors');

const adminRouter = require('./routes/adminRoute');
// const authRouter = require('./routes/authRoute');

const app = express();
const db = require('./db');

app.use(cors());
app.use(express.json());


const path = require('path');

// Public klasörünü statik olarak ayarlıyoruz
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/admin',adminRouter);
// app.use('/api/auth',authRouter);


(async () => {
  try {
    await db.authenticate();
   // await db.sync({ force: false });
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
