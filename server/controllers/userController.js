import User from "../models/user.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import Chat from "../models/chat.js"

// generate token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "30d",
    })
}

// register user
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body

    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: true, 
                message: "User already exists" 
            })
        }

        const user = await User.create({ name, email, password })
        const token = generateToken(user._id)
        res.status(201).json({ 
            success: true, 
            error: false, 
            message: "User registered successfully", 
            token
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ 
            success: false, 
            error: true, 
            message: error.message 
        })
    }
}

// login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                error: true, 
                message: "User does not exist" 
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                error: true, 
                message: "Invalid password" 
            })
        }

        const token = generateToken(user._id)
        res.status(200).json({ 
            success: true, 
            error: false, 
            message: "User logged in successfully", 
            token
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ 
            success: false, 
            error: true, 
            message: error.message 
        })
    }
}

// get user data
export const getUserData = async (req, res) => {
    try {
        const user = req.user
        res.status(200).json({ 
            success: true, 
            error: false, 
            message: "User data fetched successfully", 
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ 
            success: false, 
            error: true, 
            message: error.message 
        })
    }
}

export const getPublishedImages = async(req,res) =>{
    try{
        const publishedImage = await Chat.aggregate([
            {$unwind: "$messages"},
            {$match: {
                "messages.isImage": true,
                "messages.isPublished": true
            }},
            {
                $project: {
                    _id: 0,
                    imageUrl: "$messages.content",
                    userName: "$userName"
                }
            }
        ])

        res.json({success:true, images: publishedImage.reverse()})
    }catch(error){
        res.json({success:false, message:error.message})
    }
}