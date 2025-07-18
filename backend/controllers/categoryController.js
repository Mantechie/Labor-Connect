import Category from '../models/Category.js';

// GET /api/categories
export const getCategories = async (req, res) => {
  try {
    let categories = await Category.find({});
    // Optionally seed if empty
    if (categories.length === 0) {
      categories = await Category.insertMany([
        { title: 'Mason', hindiTitle: 'राज मिस्त्री', iconUrl: 'https://cdn-icons-png.flaticon.com/128/7857/7857909.png' },
        { title: 'Construction Laborer', hindiTitle: 'निर्माण मजदूर', iconUrl: 'https://cdn-icons-png.flaticon.com/128/10036/10036255.png' },
        { title: 'Welder', hindiTitle: 'वेल्डर', iconUrl: 'https://cdn-icons-png.flaticon.com/128/9439/9439182.png' },
        { title: 'Electrician', hindiTitle: 'बिजली मिस्त्री', iconUrl: 'https://cdn-icons-png.flaticon.com/128/307/307943.png' },
        { title: 'Plumber', hindiTitle: 'प्लंबर', iconUrl: 'https://cdn-icons-png.flaticon.com/128/10365/10365972.png' },
        { title: 'Painter', hindiTitle: 'पेंटर', iconUrl: 'https://cdn-icons-png.flaticon.com/128/1995/1995491.png' },
        { title: 'Housekeeping Staff', hindiTitle: 'सफाई कर्मचारी', iconUrl: 'https://cdn-icons-png.flaticon.com/128/995/995066.png' },
        { title: 'Cook / Kitchen Helper', hindiTitle: '', iconUrl: 'https://cdn-icons-png.flaticon.com/128/1830/1830839.png' },
        { title: 'Driver', hindiTitle: 'ड्राइवर', iconUrl: 'https://cdn-icons-png.flaticon.com/128/4900/4900915.png' },
        { title: 'Caretaker / Watchman', hindiTitle: 'चौकीदार', iconUrl: 'https://cdn-icons-png.flaticon.com/128/10047/10047446.png' },
        { title: 'AC / Appliance Technician', hindiTitle: '', iconUrl: 'https://cdn-icons-png.flaticon.com/128/9936/9936516.png' },
        { title: 'Gardener', hindiTitle: 'माली', iconUrl:'https://cdn-icons-png.flaticon.com/128/1544/1544052.png' },
        { title: 'Furniture Carpenter', hindiTitle: 'बढ़ई',  iconUrl: 'https://cdn-icons-png.flaticon.com/128/307/307963.png' },
        { title: 'Crane Operator', hindiTitle: '', iconUrl: 'https://cdn-icons-png.flaticon.com/128/3129/3129531.png' },
        // ...add more as needed
      ]);
    }
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}; 