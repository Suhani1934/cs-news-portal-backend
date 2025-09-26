// backend/routes/events.js
const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const adminAuth = require("../middleware/adminAuth");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single event
router.get("/:id", async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: "Event not found" });
    res.json(ev);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE event (admin)
router.post("/", adminAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ message: "Image file required (field name: image)" });

    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "news_portal_events" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);

    const { title, description, eventDate } = req.body;
    const newEvent = new Event({
      title,
      description,
      imageUrl: result.secure_url,
      imagePublicId: result.public_id,
      eventDate: new Date(eventDate),
    });

    const saved = await newEvent.save();
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE event (admin)
router.put("/:id", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: "Event not found" });

    const { title, description, eventDate } = req.body;
    if (title) ev.title = title;
    if (description) ev.description = description;
    if (eventDate) ev.eventDate = new Date(eventDate);

    // If new image uploaded
    if (req.file) {
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "news_portal_events" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };

      const result = await streamUpload(req.file.buffer);

      // Delete old image
      try {
        await cloudinary.uploader.destroy(ev.imagePublicId);
      } catch (e) {
        console.warn("Failed to delete old image", e);
      }

      ev.imageUrl = result.secure_url;
      ev.imagePublicId = result.public_id;
    }

    const updated = await ev.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE event (admin)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: "Event not found" });

    // Delete image on Cloudinary
    try {
      await cloudinary.uploader.destroy(ev.imagePublicId);
    } catch (e) {
      console.warn("Cloudinary delete failed", e);
    }

    // Use deleteOne instead of ev.remove()
    await Event.deleteOne({ _id: ev._id });

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete route error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
