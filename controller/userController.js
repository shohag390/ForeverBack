import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Route For Register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // checking user exists or not
    const exists = await userModel.findOne({ email });

    if (exists) {
      return res.json({
        success: false,
        messsage: "User Already Exists",
      });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        messsage: "Please Enter Valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        messsage: "Please Enter a Strong Password",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = createToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: "Register Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Route For User Login
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        messsage: "User Doesn't exists",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.status(200).json({
        success: true,
        token,
      });
    } else {
      res.json({
        success: false,
        message: "Your Email & Password Not Match",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Route For Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.status(200).json({
        success: true,
        message: "Admin Successfully login",
        token,
      });
    } else {
      res.json({
        success: false,
        message: "Invalied Email & password",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { registerUser, userLogin, adminLogin };
