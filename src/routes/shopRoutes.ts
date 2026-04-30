import express, { Response } from 'express';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import { db } from '../config/db';

const router = express.Router();

router.post('/add-entry', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      date, month, year, cementDetails, quantity, 
      productValue, totalCost, previousDue, deposit, 
      truckFair, restTotalAmount 
    } = req.body;

    const entryData = {
      adminId: req.user?.uid,
      adminEmail: req.user?.email,
      date,
      month,
      year,
      cementDetails,
      quantity: Number(quantity),
      productValue: Number(productValue),
      totalCost: Number(totalCost),
      previousDue: Number(previousDue),
      deposit: Number(deposit),
      truckFair: Number(truckFair),
      restTotalAmount: Number(restTotalAmount),
      createdAt: new Date()
    };

    const result = await db.collection('shop_entries').insertOne(entryData);

    res.status(201).json({ 
      success: true, 
      message: "Entry added successfully", 
      insertedId: result.insertedId.toString() 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
});

export default router;