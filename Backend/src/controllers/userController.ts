import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import User from '../models/User';
import { z } from 'zod';

// Define validation schemas
const registerSchema = z.object({
    fullname: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

export async function userRegister(req: Request, res: Response) {
    try {
        const parseResult = registerSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                success: false,
                errors: parseResult.error.errors
            });
        }
        const { fullname, email, password } = parseResult.data;

        const user = await User.find({ email });
        if (user.length > 0) {
            return res.status(409).json({ message: "User already exists.", success: false });
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            email,
            password: passwordHash,
            workspaces: []
        });
        const savedUser = await newUser.save();
        if (savedUser) {
            const { password: _password, ...userWithoutPassword } = savedUser.toObject();

            return res.status(201).json({
                message: "User saved successfully",
                success: true,
                user: userWithoutPassword
            });
        }
        return res.status(400).json({ message: "Failed to save user", success: false });
    } catch (error: any) {
        res.status(500).json({ message: error.message, success: false });
    }
}

export async function userLogin(req: Request, res: Response) {
    try {
        const parseResult = loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                success: false,
                errors: parseResult.error.errors
            });
        }
        const { email, password } = parseResult.data;

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "User does not exist.", success: false });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Wrong Password.", success: false });

        const token = jwt.sign({ id: user._id, email }, process.env.SECRET_KEY as string);

        // Destructure to exclude the password
        const { password: _password, ...userWithoutPassword } = user.toObject();

        res.status(200).json({ token, user: userWithoutPassword, success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
