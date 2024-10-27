import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
    user?: { id: string };
}

export const userAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1]; 

    if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided", success: false });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded as { id: string };
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid Token", success: false });
    }
};
