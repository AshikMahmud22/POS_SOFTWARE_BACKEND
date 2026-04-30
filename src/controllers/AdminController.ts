import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { db } from '../config/db';

export const createAdminAccount = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!phone || String(phone).length !== 11) {
      return res.status(400).json({ message: "Phone number must be exactly 11 digits" });
    }

    const existingAdmin = await db.collection('admins').findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = {
      firstName,
      lastName,
      email,
      phone: String(phone),
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    };

    await db.collection('admins').insertOne(newAdmin);
    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const admin = await db.collection('admins').findOne({ email });

    if (!admin) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      token, 
      user: { firstName: admin.firstName, email: admin.email, role: admin.role } 
    });
  } catch (error) {
    res.status(500).json({ message: "Login error" });
  }
};

export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await db.collection('admins').find({}, { projection: { password: 0 } }).toArray();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admins" });
  }
};

export const makeSuperAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    await db.collection('admins').updateOne(
      { _id: new ObjectId(id) },
      { $set: { role: 'superadmin' } }
    );
    res.status(200).json({ message: "Promoted to Super Admin" });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const result = await db.collection('admins').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting admin" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const admin = await db.collection('admins').findOne({ email });
    if (!admin) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};