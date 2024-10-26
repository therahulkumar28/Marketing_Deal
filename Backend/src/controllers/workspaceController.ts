import { Request, Response } from 'express';
import { z } from 'zod';
import Workspace from "../models/Workspace";

// Define input validation schema
const createWorkspaceSchema = z.object({
    workspaceName: z.string().min(5, "Workspace name is required")
});

// Type for Authenticated Request with User ID
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
    };
}

// Create Workspace Controller
export async function createWorkspace(req: AuthenticatedRequest, res: Response) {
    try {
        // Validate input
        const parseResult = createWorkspaceSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                success: false,
                errors: parseResult.error.errors
            });
        }

        const { workspaceName } = parseResult.data;

        // Check if workspace already exists
        const existingWorkspace = await Workspace.findOne({ name: workspaceName });
        if (existingWorkspace) {
            return res.status(409).json({ message: "Workspace already exists", success: false, existingWorkspace });
        }

        // Create and save new workspace
        const newWorkspace = new Workspace({
            name: workspaceName,
            user_id: req.user.id,
            clients: []
        });
        const savedWorkspace = await newWorkspace.save();
        if (!savedWorkspace) {
            return res.status(400).json({ message: "Failed to save workspace", success: false });
        }

        return res.status(201).json({ message: "Workspace saved successfully", success: true, savedWorkspace });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal Server Error', success: false, error: error.message });
    }
}

// Get Workspaces Controller
export async function getWorkspaces(req: AuthenticatedRequest, res: Response) {
    try {
        const workspaces = await Workspace.find({ user_id: req.user.id });
        
        if (!workspaces || workspaces.length === 0) {
            return res.status(404).json({ message: "No workspaces found", success: false });
        }

        return res.status(200).json({ message: "Workspaces found", success: true, workspaces });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal Server Error', success: false, error: error.message });
    }
}
