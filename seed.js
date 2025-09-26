// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('connected to mongo for seeding');

    // Remove old
    await Event.deleteMany({});

    // Add placeholder events (use placeholder cloudinary images or your own)
    const now = new Date();
    const twoDays = 2 * 24 * 60 * 60 * 1000;
    const events = [
      {
        title: 'AI Workshop',
        description: 'Hands-on AI workshop for beginners',
        imageUrl: 'https://res.cloudinary.com/dil1tjdrc/image/upload/v1758797055/WhatsApp_Image_2025-09-25_at_4.12.27_PM_2_aqdcgm.jpg',
        imagePublicId: 'demo/sample',
        eventDate: new Date(now.getTime() + twoDays)
      },
      {
        title: 'Coding Contest',
        description: 'Inter-college coding contest',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        imagePublicId: 'demo/sample',
        eventDate: new Date(now.getTime() - twoDays)
      }
    ];
    await Event.insertMany(events);
    console.log('Seeded events');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
