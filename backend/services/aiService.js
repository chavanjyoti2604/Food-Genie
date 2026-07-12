const axios = require('axios');

/**
 * Service to interface with Groq API
 * Fallback to mock generation if GROQ_API_KEY is not configured.
 */

const getGroqChatCompletion = async (prompt) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API Key not configured');
  }

  const model = process.env.GROQ_MODEL || 'llama3-8b-8192';

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
};

// 1. Food Recommendation
const recommendFood = async (mood, budget, foodType, preference, cuisine) => {
  const prompt = `You are an expert food recommendation assistant.
Recommend food items based on:
Mood: ${mood}
Budget: ₹${budget}
Food Type: ${foodType}
Preference: ${preference} (Veg/Non-Veg)
Cuisine Preference: ${cuisine}

Return:
1. Recommended Food
2. Restaurant Name
3. Estimated Cost
4. Reason for Recommendation

Make sure the output is concise, structured and friendly.`;

  try {
    return await getGroqChatCompletion(prompt);
  } catch (error) {
    console.log('AI Service Error (Recommend Food), using fallback: ', error.message);
    
    // Detailed Fallback Mock Responses based on inputs
    const isVeg = preference.toLowerCase() === 'veg';
    const cost = Math.min(budget, 250);
    
    let foodItem = isVeg ? 'Paneer Tikka Masala with Garlic Naan' : 'Chicken Dum Biryani';
    let restaurant = 'Spice Villa';
    let reason = `Based on your mood (${mood}) and budget (₹${budget}), this meal provides a satisfying, energy-rich, and comforting dining experience.`;

    if (mood.toLowerCase() === 'tired') {
      foodItem = isVeg ? 'Special Dal Khichdi with Roasted Papad' : 'Hot Chicken Soup & Hakka Noodles';
      restaurant = 'Healthy Bowls & Woks';
      reason = 'Since you are tired, a warm, comforting, and easy-to-digest meal is perfect to help you relax and recover.';
    } else if (mood.toLowerCase() === 'happy' || mood.toLowerCase() === 'excited') {
      foodItem = isVeg ? 'Double Cheese Margherita Pizza with Garlic Bread' : 'Crispy Chicken Wings & Loaded Fries';
      restaurant = 'The Bistro Club';
      reason = `To match your celebratory and ${mood} vibe, a delicious cheese-loaded treat is the perfect choice!`;
    } else if (cuisine.toLowerCase().includes('south indian')) {
      foodItem = 'Masala Dosa & Idli Combo with Filter Coffee';
      restaurant = 'Dakshin Express';
      reason = 'A classic south Indian combo is light on the stomach, fits your budget perfectly, and satisfies your cravings.';
    } else if (cuisine.toLowerCase().includes('chinese')) {
      foodItem = isVeg ? 'Veg Schezwan Fried Rice & Veg Manchurian' : 'Chicken Fried Rice & Chilli Chicken';
      restaurant = 'Red Dragon Chinese';
      reason = 'Spicy and flavorful Chinese combo to satisfy your tastebuds within your budget.';
    }

    return `1. Recommended Food: ${foodItem}
2. Restaurant Name: ${restaurant}
3. Estimated Cost: ₹${cost}
4. Reason for Recommendation: ${reason}`;
  }
};

// 2. Review Summarizer
const summarizeReviews = async (reviews) => {
  if (!reviews || reviews.length === 0) {
    return 'No reviews available to summarize.';
  }

  const reviewsText = reviews.map((r) => `- ${r.rating} stars: ${r.review}`).join('\n');
  const prompt = `You are a review summarization assistant.
Analyze the following customer reviews and generate a concise restaurant review summary.

Reviews:
${reviewsText}

Provide:
1. Overall Summary
2. Positive Highlights
3. Common Complaints

Be concise and objective.`;

  try {
    return await getGroqChatCompletion(prompt);
  } catch (error) {
    console.log('AI Service Error (Summarize Reviews), using fallback: ', error.message);
    
    // Extract positive and negative traits from actual reviews to mock accurately
    const ratings = reviews.map(r => r.rating);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    
    let overall = 'Customers generally have a positive experience here, enjoying the overall food quality and staff courtesy.';
    let positives = 'Fast delivery, generous food portions, and authentic spices.';
    let negatives = 'Slightly higher delivery costs and occasional delays during rush hours.';

    if (avgRating >= 4.2) {
      overall = 'Highly rated restaurant loved by customers for its exceptional food quality, cleanliness, and swift service.';
      positives = 'Amazing taste, fresh ingredients, helpful staff, and great packaging.';
      negatives = 'Waiting times on weekends and popular dishes selling out fast.';
    } else if (avgRating < 3.2) {
      overall = 'Customers raise concerns regarding service consistency and delivery timelines.';
      positives = 'Affordable pricing and decent variety of menu options.';
      negatives = 'Slow delivery times, food arriving cold, and poor customer support response.';
    }

    return `1. Overall Summary: ${overall}
2. Positive Highlights:
   - ${positives}
3. Common Complaints:
   - ${negatives}`;
  }
};

// 3. Food Description Generator
const generateFoodDescription = async (foodName) => {
  const prompt = `You are a professional food content writer.
Generate an attractive food description.

Food Name:
${foodName}

Return a 50-80 word description suitable for a food ordering website. Make it sound delicious, fresh, and appetizing.`;

  try {
    return await getGroqChatCompletion(prompt);
  } catch (error) {
    console.log('AI Service Error (Food Description), using fallback: ', error.message);
    
    // Fallback Mock Descriptions
    const cleanName = foodName.toLowerCase();
    
    if (cleanName.includes('paneer')) {
      return `${foodName} features fresh, pillowy soft paneer cubes cooked in a savory, aromatic blend of traditional Indian spices. Grilled or simmered to perfection, each bite yields a rich, smoky, and melt-in-your-mouth flavor that pairs beautifully with freshly baked flatbreads.`;
    }
    if (cleanName.includes('chicken') || cleanName.includes('biryani')) {
      return `Indulge in our signature ${foodName}, prepared with premium ingredients and marinated in a secret blend of herbs and spices. Slow-cooked to locks in flavors, it delivers a tender, succulent, and highly aromatic profile that is satisfyingly authentic.`;
    }
    if (cleanName.includes('pizza') || cleanName.includes('pasta')) {
      return `Savor the rich Italian flavors in this delicious ${foodName}. Made with freshly prepared dough, a tangy vine-ripened tomato sauce, and topped with a luxurious layer of melted mozzarella cheese and gourmet herbs for that perfect, comforting bite.`;
    }
    if (cleanName.includes('burger') || cleanName.includes('sandwich')) {
      return `Get ready for a flavor explosion! This premium ${foodName} is loaded with a juicy, seasoned patty, crisp lettuce, ripe tomatoes, and layered with our signature house sauce, all sandwiched between a soft toasted bun.`;
    }
    
    // Generic default delicious food description
    return `${foodName} is a delicious, chef-crafted delicacy made using the freshest local ingredients and a premium blend of spices. Carefully prepared to satisfy your cravings, it boasts an incredible texture and an authentic, mouthwatering taste that keeps you coming back for more.`;
  }
};

module.exports = {
  recommendFood,
  summarizeReviews,
  generateFoodDescription,
};
