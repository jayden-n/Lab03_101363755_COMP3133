import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedDatabase from './seeding.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dotenv.config(); // Load environment variables

// Connect to MongoDB

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
	address: {
		building: String,
		street: String,
		zipcode: String,
	},
	city: String,
	cuisine: String,
	name: String,
	restaurant_id: String,
});

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// API to return all restaurant details
app.get('/restaurants', async (req, res) => {
	try {
		const restaurants = await Restaurant.find();
		res.json(restaurants);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// API to return all restaurant details by cuisine
app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
	try {
		const restaurants = await Restaurant.find({ cuisine: req.params.cuisine });
		res.json(restaurants);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// API to return selected columns sorted by restaurant_id
app.get('/restaurants', async (req, res) => {
	const sortBy = req.query.sortBy || 'ASC';
	try {
		const sortOrder = sortBy.toUpperCase() === 'DESC' ? -1 : 1;
		const restaurants = await Restaurant.find(
			{},
			{ id: 1, cuisine: 1, name: 1, city: 1, restaurant_id: 1 },
		).sort({ restaurant_id: sortOrder });
		res.json(restaurants);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// API to return restaurants details by cuisine and city with sorting
app.get('/restaurants/:cuisine', async (req, res) => {
	try {
		const restaurants = await Restaurant.find(
			{ cuisine: req.params.cuisine, city: { $ne: 'Brooklyn' } },
			{ id: 0, cuisine: 1, name: 1, city: 1 },
		).sort({ name: 1 });
		res.json(restaurants);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});
// REST API to return specific restaurant details with criteria
app.get('/restaurants/Delicatessen', async (req, res) => {
	try {
		const restaurants = await Restaurant.find(
			{
				cuisine: 'Delicatessen',
				city: { $ne: 'Brooklyn' },
			},
			'cuisines name city -_id',
		).sort('name');
		res.json(restaurants);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Start the server
app.listen(PORT, async () => {
	await seedDatabase();
	console.log(`Server is running on http://localhost:${PORT}`);
});

// seedDatabase().then(() => {
// 	// Start the server after seeding
// 	app.listen(PORT, () => {
// 		console.log(`Server is running on http://localhost:${PORT}`);
// 	});
// });
