import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../config/db';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/all-entries', protect, async (req: Request, res: Response) => {
  try {
    const year = req.query.year;
    const month = req.query.month;

    const query: any = { status: { $ne: 'trashed' } };

    if (year) query.year = year;
    if (month) query.month = month;

    const entries = await db.collection('entries')
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching entries" });
  }
});

router.get('/available-years', protect, async (req: Request, res: Response) => {
  try {
    const filter = { status: { $ne: 'trashed' } };
    const years = await db.collection('entries').distinct("year", filter as any);

    const sortedYears = (years as string[]).sort((a, b) => Number(b) - Number(a));
    res.status(200).json(sortedYears.length > 0 ? sortedYears : ["2026"]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching years" });
  }
});

router.get('/available-months', protect, async (req: Request, res: Response) => {
  try {
    const year = req.query.year;

    if (!year) {
      return res.status(400).json({ message: "Year is required" });
    }

    const filter = {
      year: year,
      status: { $ne: 'trashed' }
    };

    const months = await db.collection('entries').distinct("month", filter as any);

    const monthOrder = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const sortedMonths = (months as string[]).sort((a, b) =>
      monthOrder.indexOf(a) - monthOrder.indexOf(b)
    );

    res.status(200).json(sortedMonths);
  } catch (error) {
    res.status(500).json({ message: "Error fetching months" });
  }
});

router.post('/add-entry', protect, async (req: Request, res: Response) => {
  try {
    const newEntry = {
      ...req.body,
      createdAt: new Date(),
      status: 'active'
    };
    const result = await db.collection('entries').insertOne(newEntry);
    res.status(201).json({ _id: result.insertedId, ...newEntry });
  } catch (error) {
    res.status(500).json({ message: "Error saving entry" });
  }
});

router.put('/update-entry/:id', protect, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; // ✅ fix here
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

    const { _id, ...updateData } = req.body;
    await db.collection('entries').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.status(200).json({ message: "Updated" });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});

router.post('/move-to-trash/:id', protect, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; // ✅ fix here
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

    await db.collection('entries').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'trashed', deletedAt: new Date() } }
    );
    res.status(200).json({ message: "Moved to trash" });
  } catch (error) {
    res.status(500).json({ message: "Action failed" });
  }
});

export default router;