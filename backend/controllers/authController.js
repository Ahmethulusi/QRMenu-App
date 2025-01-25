
// const users = require('../models/UserModel');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
// dotenv.config();

// exports.register = async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = await users.create({
//             username: username,
//             password: hashedPassword
//         });
//         res.status(201).json({
//             message: "Kullanıcı kaydedildi"
//         });
//     } catch (error) {
//         console.log(error);
//     }
// }

// exports.login = async (req, res) => {

//     const { username, password } = req.body;
//     try {
//         const user = await user.findOne({
//             where: {
//                 username: username
//             }
//         });
//         if (!user) {
//             return res.status(400).json({
//                 message: "Kullanıcı adı bulunamadı"
//             });
//         }
//         const validPassword = await bcrypt.compare(password, user.password);
//         if (!validPassword) {
//             return res.status(400).json({
//                 message: "Sifre hatali"
//             });
//         }
//         const token = jwt.sign({
//             id: user.id,
//             username: user.username
//         }, process.env.JWT_SECRET, {
//             expiresIn: '1h'
//         });
//         res.status(200).json({
//             message: "Giris yapildi",
//             token
//         });
//     } catch (error) {
//         console.log(error);
//     }
// }






