import { Request, Response } from 'express';
import { db } from '../config/db';

export const getAllEntries = async (req: Request, res: Response) => {
  try {
    const entries = await db.collection('entries')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching entries" });
  }
};