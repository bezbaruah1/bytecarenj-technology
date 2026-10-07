const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaultData = {
  tickets: [
    {
      id: "BC-8942-KMR",
      customerName: "Rahul Nath",
      phone: "9876543210",
      email: "rahul.nath@gmail.com",
      serviceType: "Laptop Repair",
      deviceModel: "Dell Inspiron 15 (5000 Series)",
      problemDescription: "Cracked FHD display screen and loose left hinge",
      status: "In Repair", // Pending, Diagnosing, In Repair, Ready for Pickup, Completed, Cancelled
      estimatedCost: 3500,
      techNotes: "Replacement panel received. Hinge re-seated and screen assembly in progress.",
      createdAt: "2026-07-28T10:30:00.000Z",
      updatedAt: "2026-07-29T14:15:00.000Z"
    },
    {
      id: "BC-7103-KMR",
      customerName: "Ankita Das",
      phone: "9707701954",
      email: "ankita.d@yahoo.com",
      serviceType: "Laptop Repair",
      deviceModel: "HP Pavilion 14",
      problemDescription: "Battery not holding charge and overheating during Zoom calls",
      status: "Ready for Pickup",
      estimatedCost: 2200,
      techNotes: "New genuine OEM battery installed, thermal paste refreshed. Tested battery backup for 4.5 hours.",
      createdAt: "2026-07-27T09:15:00.000Z",
      updatedAt: "2026-07-29T11:00:00.000Z"
    },
    {
      id: "BC-6520-KMR",
      customerName: "Bhabesh Kalita",
      phone: "8638594006",
      email: "bhabesh.store@gmail.com",
      serviceType: "CCTV Installation",
      deviceModel: "Hikvision 4-Camera HD DVR Kit",
      problemDescription: "Shop security setup & remote mobile view configuration for grocery outlet",
      status: "Completed",
      estimatedCost: 18500,
      techNotes: "4 Outdoor bullet cameras installed, 1TB surveillance HDD configured, mobile monitoring live.",
      createdAt: "2026-07-25T11:00:00.000Z",
      updatedAt: "2026-07-26T16:30:00.000Z"
    },
    {
      id: "BC-4019-KMR",
      customerName: "Manoj Choudhury",
      phone: "9435012345",
      email: "m.choudhury@rediffmail.com",
      serviceType: "PC Repair",
      deviceModel: "Custom Intel Core i5 Desktop",
      problemDescription: "System randomly shutting down during video rendering; suspected power supply issue",
      status: "Diagnosing",
      estimatedCost: 2800,
      techNotes: "Testing SMPS voltage rails. Fan bearing noise detected.",
      createdAt: "2026-07-29T08:20:00.000Z",
      updatedAt: "2026-07-29T09:00:00.000Z"
    }
  ],
  contacts: [
    {
      id: "CON-101",
      name: "Sanjay Medhi",
      phone: "9854011223",
      email: "sanjay.medhi@gmail.com",
      subject: "CCTV quotation for 8 camera setup in office",
      message: "Hello Bytecare team, I need an estimate for installing 8 IP cameras with audio recording for our office in Kamrup (R).",
      status: "Unread",
      createdAt: "2026-07-29T12:00:00.000Z"
    },
    {
      id: "CON-100",
      name: "Priyanka Roy",
      phone: "9101234567",
      email: "p.roy@gmail.com",
      subject: "Passport photo printing bulk order",
      message: "Do you offer passport photo printing in sets of 32 for school registration? What is the price?",
      status: "Replied",
      createdAt: "2026-07-28T16:45:00.000Z"
    }
  ],
  reviews: [
    {
      id: "REV-1",
      name: "Pranjal Sharma",
      location: "Mirza, Kamrup (R)",
      rating: 5,
      comment: "Fastest laptop screen replacement in Kamrup (R)! Very courteous technician and original spare part used.",
      service: "Laptop Repair",
      createdAt: "2026-07-20T10:00:00.000Z",
      approved: true
    },
    {
      id: "REV-2",
      name: "Momita Rabha",
      location: "VIP Road, Kamrup (R)",
      rating: 5,
      comment: "Got 16 passport size photos printed in under 10 minutes. Super sharp quality photo paper!",
      service: "Passport Photo Printing",
      createdAt: "2026-07-22T14:30:00.000Z",
      approved: true
    },
    {
      id: "REV-3",
      name: "Deepak Kumar",
      location: "Palashbari, Kamrup (R)",
      rating: 5,
      comment: "Bytecare NJ installed 4 CCTV cameras at my pharmacy. Clean cable routing and mobile live preview works perfectly.",
      service: "CCTV Installation",
      createdAt: "2026-07-24T18:15:00.000Z",
      approved: true
    }
  ],
  services: [
    {
      id: "laptop-repair",
      title: "Laptop Repair",
      icon: "laptop",
      tagline: "Hardware & Software Diagnostics, Screen & Battery Replacement",
      images: [
        "/images/cracked-screen.jpg",
        "/images/dell-motherboard.jpg",
        "/images/laptop-hinge.jpg",
        "/images/laptop-keyboard.jpg"
      ],
      details: [
        "Screen & LCD replacement for all major brands (Dell, HP, Lenovo, ASUS, Acer)",
        "Motherboard chip-level repair & liquid damage restoration",
        "Battery & charger replacement with warranty",
        "RAM & NVMe SSD speed upgrades with OS cloning",
        "Hinge repair & body fabrication"
      ],
      estimatedTime: "Same Day — 24 Hours"
    },
    {
      id: "pc-repair",
      title: "PCs Repair",
      icon: "desktop",
      tagline: "Custom Builds, Component Upgrades, Virus Clean-up & SMPS Repair",
      images: [
        "/images/pc-rgb-workbench.jpg",
        "/images/desktop-motherboard.jpg",
        "/images/hp-disassembly.jpg"
      ],
      details: [
        "Desktop SMPS & Power Supply replacement",
        "Custom gaming & office PC assembly",
        "Deep virus, malware & ransomware removal",
        "Overheating resolution & liquid cooling setup",
        "Data backup, recovery & Windows re-installation"
      ],
      estimatedTime: "Same Day Turnaround"
    },
    {
      id: "passport-photo",
      title: "Passport Size Photo Printing",
      icon: "camera",
      tagline: "Instant High-Gloss Prints, All Visa & Govt Format Dimensions",
      images: [
        "/images/passport-photos.jpg",
        "/images/storage-ram-upgrade.jpg"
      ],
      details: [
        "Instant passport, stamp & visa size photo printing",
        "Professional digital background enhancement & retouching",
        "High-density premium glossy photo paper",
        "Sets of 8, 16, 32, or 64 photo sheets",
        "Digital soft-copy sent straight to your WhatsApp or Email"
      ],
      estimatedTime: "5 - 10 Minutes Instant"
    },
    {
      id: "cctv-installation",
      title: "CCTV Installation",
      icon: "cctv",
      tagline: "HD Security Cameras, NVR/DVR Setup & Remote Phone Monitoring",
      images: [
        "/images/cctv-surveillance.jpg",
        "/images/desktop-motherboard.jpg"
      ],
      details: [
        "Free on-site security survey for Home, Office, or Shop",
        "Full HD 1080p & 4K IP Dome & Bullet camera setups",
        "Night-vision & motion alert setup",
        "Remote live viewing on Android, iPhone & Laptop",
        "Annual maintenance & camera realignment services"
      ],
      estimatedTime: "1 — 2 Days Installation"
    }
  ],
  ownerProfile: {
    name: "Jyotimoni Bezbaruah",
    role: "Lead Hardware Technician & Founder",
    experience: "10+ Years Tech Expertise",
    image: "/images/jyotimoni-passport.jpeg",
    bio: "Certified electronics & hardware technician delivering precision diagnostics, chip-level micro-soldering, CCTV surveillance engineering, and instant photographic solutions across Kamrup (R), Assam."
  }
};

const os = require('os');

let inMemoryCache = null;

function getDbPath() {
  if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), 'bytecare-db.json');
  }
  return DB_FILE;
}

function readDb() {
  if (inMemoryCache) {
    return inMemoryCache;
  }

  // 1. Try reading writable runtime path (e.g. /tmp in serverless)
  const targetPath = getDbPath();
  try {
    if (fs.existsSync(targetPath)) {
      const raw = fs.readFileSync(targetPath, 'utf8');
      inMemoryCache = JSON.parse(raw);
      return inMemoryCache;
    }
  } catch (err) {
    // Ignore and fallback
  }

  // 2. Try reading bundled DB_FILE
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      inMemoryCache = JSON.parse(raw);
      return inMemoryCache;
    }
  } catch (err) {
    // Ignore and fallback
  }

  inMemoryCache = JSON.parse(JSON.stringify(defaultData));
  return inMemoryCache;
}

function writeDb(data) {
  inMemoryCache = data;
  const targetPath = getDbPath();
  try {
    const parentDir = path.dirname(targetPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    // Gracefully handle read-only filesystem in serverless environments
    console.warn('⚠️ [Storage] Read-only filesystem in serverless runtime. State retained in-memory & Firestore:', err.message);
  }
}

// Helpers
function generateTrackingId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BC-${randomNum}-KMR`;
}

module.exports = {
  readDb,
  writeDb,
  generateTrackingId,

  // Tickets
  getTickets: () => readDb().tickets,
  getTicketByIdentifier: (identifier) => {
    const db = readDb();
    const cleanId = (identifier || '').trim().toUpperCase();
    const cleanPhone = (identifier || '').trim().replace(/\D/g, '');

    return db.tickets.filter(t => {
      const matchId = t.id.toUpperCase() === cleanId;
      const matchPhone = cleanPhone.length >= 6 && t.phone.replace(/\D/g, '').includes(cleanPhone);
      return matchId || matchPhone;
    });
  },
  addTicket: (ticketData) => {
    const db = readDb();
    const newId = generateTrackingId();
    const newTicket = {
      id: newId,
      customerName: ticketData.customerName || 'Customer',
      phone: ticketData.phone || '',
      email: ticketData.email || '',
      serviceType: ticketData.serviceType || 'General Service',
      deviceModel: ticketData.deviceModel || 'N/A',
      problemDescription: ticketData.problemDescription || '',
      status: 'Pending', // Default
      estimatedCost: ticketData.estimatedCost || 0,
      techNotes: 'Job request submitted online. Awaiting technician inspection.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.tickets.unshift(newTicket);
    writeDb(db);
    return newTicket;
  },
  updateTicket: (id, updates) => {
    const db = readDb();
    const idx = db.tickets.findIndex(t => t.id === id);
    if (idx === -1) return null;

    db.tickets[idx] = {
      ...db.tickets[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    writeDb(db);
    return db.tickets[idx];
  },

  // Contacts
  getContacts: () => readDb().contacts,
  addContact: (contactData) => {
    const db = readDb();
    const newContact = {
      id: `CON-${Date.now().toString().slice(-4)}`,
      name: contactData.name || 'Anonymous',
      phone: contactData.phone || '',
      email: contactData.email || '',
      subject: contactData.subject || 'General Inquiry',
      message: contactData.message || '',
      status: 'Unread',
      createdAt: new Date().toISOString()
    };
    db.contacts.unshift(newContact);
    writeDb(db);
    return newContact;
  },
  updateContact: (id, updates) => {
    const db = readDb();
    const idx = db.contacts.findIndex(c => c.id === id);
    if (idx === -1) return null;

    db.contacts[idx] = {
      ...db.contacts[idx],
      ...updates
    };
    writeDb(db);
    return db.contacts[idx];
  },

  // Reviews
  getReviews: (onlyApproved = true) => {
    const reviews = readDb().reviews;
    if (onlyApproved) {
      return reviews.filter(r => r.approved);
    }
    return reviews;
  },
  addReview: (reviewData) => {
    const db = readDb();
    const newReview = {
      id: `REV-${Date.now().toString().slice(-4)}`,
      name: reviewData.name || 'Local Customer',
      location: reviewData.location || 'Kamrup (R)',
      rating: parseInt(reviewData.rating, 10) || 5,
      comment: reviewData.comment || '',
      service: reviewData.service || 'Service',
      createdAt: new Date().toISOString(),
      approved: false // Requires admin approval
    };
    db.reviews.unshift(newReview);
    writeDb(db);
    return newReview;
  },
  updateReview: (id, updates) => {
    const db = readDb();
    const idx = db.reviews.findIndex(r => r.id === id);
    if (idx === -1) return null;

    db.reviews[idx] = {
      ...db.reviews[idx],
      ...updates
    };
    writeDb(db);
    return db.reviews[idx];
  },

  // Services
  getServices: () => {
    const data = readDb();
    return data.services || defaultData.services;
  },
  updateService: (id, updates) => {
    const data = readDb();
    if (!data.services) data.services = defaultData.services;
    const idx = data.services.findIndex(s => s.id === id);
    if (idx === -1) return null;

    data.services[idx] = {
      ...data.services[idx],
      ...updates
    };
    writeDb(data);
    return data.services[idx];
  },
  addServiceImage: (id, imageUrl) => {
    const data = readDb();
    if (!data.services) data.services = defaultData.services;
    const idx = data.services.findIndex(s => s.id === id);
    if (idx === -1) return null;

    if (!Array.isArray(data.services[idx].images)) {
      data.services[idx].images = [];
    }
    if (imageUrl && !data.services[idx].images.includes(imageUrl)) {
      data.services[idx].images.push(imageUrl);
    }
    writeDb(data);
    return data.services[idx];
  },
  removeServiceImage: (id, imageIndex) => {
    const data = readDb();
    if (!data.services) data.services = defaultData.services;
    const idx = data.services.findIndex(s => s.id === id);
    if (idx === -1) return null;

    if (Array.isArray(data.services[idx].images) && data.services[idx].images[imageIndex] !== undefined) {
      data.services[idx].images.splice(imageIndex, 1);
    }
    writeDb(data);
    return data.services[idx];
  },

  // Owner Profile
  getOwnerProfile: () => {
    const data = readDb();
    return data.ownerProfile || defaultData.ownerProfile;
  },
  updateOwnerProfile: (updates) => {
    const data = readDb();
    data.ownerProfile = {
      ...(data.ownerProfile || defaultData.ownerProfile),
      ...updates
    };
    writeDb(data);
    return data.ownerProfile;
  },

  // Stats
  getStats: () => {
    const db = readDb();
    const totalTickets = db.tickets.length;
    const activeTickets = db.tickets.filter(t => ['Pending', 'Diagnosing', 'In Repair'].includes(t.status)).length;
    const readyTickets = db.tickets.filter(t => t.status === 'Ready for Pickup').length;
    const completedTickets = db.tickets.filter(t => t.status === 'Completed').length;
    const unreadContacts = db.contacts.filter(c => c.status === 'Unread').length;

    return {
      totalTickets,
      activeTickets,
      readyTickets,
      completedTickets,
      unreadContacts,
      totalReviews: db.reviews.length,
      totalServices: (db.services || []).length
    };
  }
};
