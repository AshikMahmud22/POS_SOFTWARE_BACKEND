import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../config/db';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/get-entries', protect, async (req: Request, res: Response) => {
  try {
    const year = req.query.year as string;
    const month = req.query.month as string;

    const query: any = { status: { $ne: 'trashed' } };

    if (year) query.year = year;
    if (month) query.month = month;

    const entries = await db.collection('entries')
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching entries" });
  }
});

router.get('/trashed-entries', protect, async (req: Request, res: Response) => {
  try {
    const entries = await db.collection('entries')
      .find({ status: 'trashed' })
      .sort({ deletedAt: -1 })
      .toArray();
    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching trash" });
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
    res.status(201).json({ success: true, _id: result.insertedId, ...newEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving entry" });
  }
});

router.put('/update-entry/:id', protect, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

    const { _id, ...updateData } = req.body;
    await db.collection('entries').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.status(200).json({ success: true, message: "Updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

router.post('/move-to-trash/:id', protect, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

    await db.collection('entries').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'trashed', deletedAt: new Date() } }
    );
    res.status(200).json({ success: true, message: "Moved to trash" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Action failed" });
  }
});

router.post('/restore-entry/:id', protect, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

    await db.collection('entries').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'active' }, $unset: { deletedAt: "" } }
    );
    res.status(200).json({ success: true, message: "Restored" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Restore failed" });
  }
});

router.delete('/permanent-delete/:id', protect, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

    await db.collection('entries').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: true, message: "Permanently deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

export default router;

