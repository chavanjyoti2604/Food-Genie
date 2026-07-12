const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const FoodItem = require('../models/FoodItem');
const Review = require('../models/Review');

const seedData = async () => {
  try {
    // 1. Seed Admin User
    const adminExists = await User.findOne({ email: 'admin@foodgenai.com' });
    let adminUser;
    
    if (!adminExists) {
      adminUser = await User.create({
        name: 'App Administrator',
        email: 'admin@foodgenai.com',
        mobile: '9999999999',
        password: 'Admin@123', // Will be hashed via pre-save hook
        role: 'admin',
        address: {
          street: 'Admin HQ, Tech Park',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
        },
      });
      console.log('Admin user seeded (admin@foodgenai.com / Admin@123)');
    } else {
      adminExists.name = 'App Administrator';
      adminExists.password = 'Admin@123';
      adminExists.role = 'admin';
      adminUser = await adminExists.save();
      console.log('Admin user verified/reset (admin@foodgenai.com / Admin@123)');
    }

    // 2. Seed Test User
    const testUserExists = await User.findOne({ email: 'rahul@gmail.com' });
    let testUser;
    
    if (!testUserExists) {
      testUser = await User.create({
        name: 'Rahul Sharma',
        email: 'rahul@gmail.com',
        mobile: '9876543211',
        password: 'Password@123',
        role: 'user',
        address: {
          street: '45, Flat 102, HSR Layout',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560102',
        },
      });
      console.log('Test user seeded (rahul@gmail.com / Password@123)');
    } else {
      testUserExists.name = 'Rahul Sharma';
      testUserExists.password = 'Password@123';
      testUserExists.role = 'user';
      testUser = await testUserExists.save();
      console.log('Test user verified/reset (rahul@gmail.com / Password@123)');
    }

    // 2. Check if Restaurants exist
    const restaurantCount = await Restaurant.countDocuments();
    if (restaurantCount === 0) {
      console.log('Seeding restaurants, food items and reviews...');
      
      // Create Restaurants
      const r1 = await Restaurant.create({
        name: 'Spice Garden',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60',
        address: '102, Residency Road, Bangalore',
        cuisine: 'North Indian, Mughlai',
        rating: 4.5,
        deliveryCharge: 40,
        deliveryTime: 25,
        reviewSummary: `1. Overall Summary: Customers highly praise the restaurant for its rich North Indian flavors and fast delivery.
2. Positive Highlights:
   - Delicious Paneer Butter Masala and Butter Naan.
   - Generous portion sizes and great packaging.
3. Common Complaints:
   - Slightly high delivery charges during rain.`,
      });

      const r2 = await Restaurant.create({
        name: 'The Bistro Club',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=60',
        address: '5th Block, Koramangala, Bangalore',
        cuisine: 'Italian, Continental',
        rating: 4.2,
        deliveryCharge: 50,
        deliveryTime: 30,
        reviewSummary: `1. Overall Summary: A great place for Italian lovers. Fast delivery and consistent quality are frequently highlighted.
2. Positive Highlights:
   - Cheesy pizzas and creamy pastas.
   - Excellent garlic bread.
3. Common Complaints:
   - Occasional delivery delays during weekend peak hours.`,
      });

      const r3 = await Restaurant.create({
        name: 'Red Dragon Chinese',
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=60',
        address: 'MG Road, Indiranagar, Bangalore',
        cuisine: 'Chinese, Asian',
        rating: 3.9,
        deliveryCharge: 30,
        deliveryTime: 20,
        reviewSummary: `1. Overall Summary: Popular for quick Chinese comfort food. Customers appreciate the affordable pricing and spicy food flavor.
2. Positive Highlights:
   - Flavorful Schezwan Fried Rice and crispy Manchurian.
   - Fast and reliable delivery times.
3. Common Complaints:
   - Food is sometimes reported as a bit too oily.`,
      });

      const r4 = await Restaurant.create({
        name: 'Dakshin Express',
        image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=60',
        address: 'HSR Layout, Bangalore',
        cuisine: 'South Indian',
        rating: 4.7,
        deliveryCharge: 20,
        deliveryTime: 15,
        reviewSummary: `1. Overall Summary: Excellent reviews for authentic and affordable South Indian breakfast and meals. Swift delivery.
2. Positive Highlights:
   - Incredibly crispy Masala Dosas and soft Idlis.
   - Value for money options.
3. Common Complaints:
   - Chutney spills occasionally during transit.`,
      });

      // Create Food Items
      // Restaurant 1: Spice Garden
      await FoodItem.create([
        {
          restaurantId: r1._id,
          name: 'Paneer Butter Masala',
          image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=60',
          description: 'Cottage cheese cubes cooked in a rich, creamy tomato and cashew-based gravy, flavored with butter and fresh cream.',
          price: 240,
          type: 'veg',
          category: 'Main Course',
          rating: 4.6,
        },
        {
          restaurantId: r1._id,
          name: 'Butter Naan',
          image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&auto=format&fit=crop&q=60',
          description: 'Traditionally baked soft Indian flatbread made of refined flour, topped with a generous spread of butter.',
          price: 45,
          type: 'veg',
          category: 'Bread',
          rating: 4.5,
        },
        {
          restaurantId: r1._id,
          name: 'Chicken Dum Biryani',
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60',
          description: 'Aromatic long-grain basmati rice cooked with succulent chicken pieces in a rich blend of Mughlai spices, served with raita.',
          price: 290,
          type: 'non-veg',
          category: 'Main Course',
          rating: 4.8,
        },
      ]);

      // Restaurant 2: The Bistro Club
      await FoodItem.create([
        {
          restaurantId: r2._id,
          name: 'Cheese Margherita Pizza',
          image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=60',
          description: 'Classic thin-crust pizza loaded with premium mozzarella cheese, fresh basil, and signature Italian tomato sauce.',
          price: 320,
          type: 'veg',
          category: 'Main Course',
          rating: 4.3,
        },
        {
          restaurantId: r2._id,
          name: 'Garlic Bread with Cheese',
          image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&auto=format&fit=crop&q=60',
          description: 'Toasted baguette slices rubbed with garlic butter, topped with melted mozzarella and herbs.',
          price: 130,
          type: 'veg',
          category: 'Starter',
          rating: 4.4,
        },
        {
          restaurantId: r2._id,
          name: 'Alfredo Chicken Pasta',
          image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop&q=60',
          description: 'Penne pasta tossed in a rich, creamy parmesan cheese sauce with grilled chicken strips and mushrooms.',
          price: 280,
          type: 'non-veg',
          category: 'Main Course',
          rating: 4.1,
        },
      ]);

      // Restaurant 3: Red Dragon Chinese
      await FoodItem.create([
        {
          restaurantId: r3._id,
          name: 'Veg Schezwan Fried Rice',
          image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=60',
          description: 'Wok-tossed basmati rice cooked with fresh seasonal vegetables and spicy Schezwan sauce.',
          price: 180,
          type: 'veg',
          category: 'Main Course',
          rating: 3.9,
        },
        {
          restaurantId: r3._id,
          name: 'Veg Manchurian Gravy',
          image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=60',
          description: 'Fried vegetable balls tossed in a tangy, savory, and slightly spicy soy-based gravy.',
          price: 160,
          type: 'veg',
          category: 'Starter',
          rating: 4.0,
        },
        {
          restaurantId: r3._id,
          name: 'Chilli Chicken Dry',
          image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=60',
          description: 'Marinated fried chicken chunks tossed with bell peppers, onions, green chillies, and a savory soy-garlic glaze.',
          price: 210,
          type: 'non-veg',
          category: 'Starter',
          rating: 4.2,
        },
      ]);

      // Restaurant 4: Dakshin Express
      await FoodItem.create([
        {
          restaurantId: r4._id,
          name: 'Special Masala Dosa',
          image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=60',
          description: 'Crisp golden crepe made from fermented rice batter, stuffed with spiced potato mash, served with sambar and fresh coconut chutney.',
          price: 90,
          type: 'veg',
          category: 'Main Course',
          rating: 4.8,
        },
        {
          restaurantId: r4._id,
          name: 'Steamed Idli Combo',
          image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=60',
          description: 'Three soft, fluffy steamed rice cakes served with hot lentil sambar and assortment of chutneys.',
          price: 70,
          type: 'veg',
          category: 'Main Course',
          rating: 4.7,
        },
      ]);

      // Test user already seeded above

      // Seed Reviews
      await Review.create([
        {
          userId: testUser._id,
          restaurantId: r1._id,
          rating: 5,
          review: 'The Paneer Butter Masala was incredibly creamy and delicious. The naan was hot and buttery. Loved the quick delivery!',
        },
        {
          userId: testUser._id,
          restaurantId: r2._id,
          rating: 4,
          review: 'Nice thin crust pizza with good amount of cheese. The garlic bread was soft and seasoned perfectly.',
        },
        {
          userId: testUser._id,
          restaurantId: r3._id,
          rating: 4,
          review: 'Spicy Schezwan rice! Good quantity. Food was slightly oily but tasted great.',
        },
        {
          userId: testUser._id,
          restaurantId: r4._id,
          rating: 5,
          review: 'Best Masala Dosa in town. Extremely crisp and the coconut chutney was super fresh.',
        },
      ]);

      console.log('Seeding finished successfully.');
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

module.exports = seedData;
