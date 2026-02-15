export type ShopProduct = {
    id: string;
    name: string;
    price: number;
    priceFormatted: string;
    images: string[];
    rating: number;
    reviewCount: number;
    description: string;
    benefits: string[];
    ingredients: string;
    directions: string;
    warning: string;
    badges: { id: string; label: string; type: 'gf' | 'vegan' | 'organic' }[];
};

export type CustomerReview = {
    id: string;
    heading: string;
    rating: number;
    text: string;
    name: string;
    location: string;
};

export const shopProducts: ShopProduct[] = [
    {
        id: 'ashwagandha',
        name: 'Ashwagandha',
        price: 23.9,
        priceFormatted: '$23.90 USD',
        images: [
            'https://images.unsplash.com/photo-1512069772999-208d5f7f1f2d?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80',
        ],
        rating: 4.5,
        reviewCount: 3194,
        description:
            'Premium adaptogenic herb crafted to support daily balance, calm, and overall wellness. Sourced from organic farms and processed with care to preserve maximum potency.',
        benefits: [
            'Supports overall health',
            'Aids in hormone regulation',
            'It helps normalize energy levels',
            'Combats the effects of stress',
        ],
        ingredients:
            'Organic Ashwagandha (Withania somnifera) root extract 600mg, Organic Black Pepper (Piper nigrum) fruit extract 5mg, Pullulan capsule shell.',
        directions:
            'Take 1 capsule daily with food, or as directed by your healthcare practitioner. For best results, use consistently for at least 30 days.',
        warning:
            'Consult your healthcare provider before use if you are pregnant, nursing, taking medication, or have a medical condition. Keep out of reach of children.',
        badges: [
            { id: '1', label: 'Gluten\nfree', type: 'gf' },
            { id: '2', label: 'Vegan', type: 'vegan' },
            { id: '3', label: '100%\norganic', type: 'organic' },
        ],
    },
    {
        id: 'magnesium',
        name: 'Magnesium Glycinate',
        price: 18.5,
        priceFormatted: '$18.50 USD',
        images: [
            'https://images.unsplash.com/photo-1580281780450-82e8ab2ee5fe?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80',
        ],
        rating: 4.7,
        reviewCount: 2841,
        description:
            'Highly absorbable magnesium glycinate for optimal relaxation, muscle recovery, and sleep support.',
        benefits: [
            'Promotes restful sleep',
            'Supports muscle relaxation',
            'Helps reduce stress and anxiety',
            'Supports bone health',
        ],
        ingredients:
            'Magnesium (as Magnesium Bisglycinate Chelate) 400mg, Vegetable Cellulose Capsule.',
        directions:
            'Take 2 capsules daily with food, preferably in the evening.',
        warning:
            'Consult your healthcare provider if pregnant, nursing, or on medication.',
        badges: [
            { id: '1', label: 'Gluten\nfree', type: 'gf' },
            { id: '2', label: 'Vegan', type: 'vegan' },
            { id: '3', label: '100%\norganic', type: 'organic' },
        ],
    },
    {
        id: 'omega',
        name: 'Omega 3 Complex',
        price: 29.2,
        priceFormatted: '$29.20 USD',
        images: [
            'https://images.unsplash.com/photo-1585238342028-4bbc0c247a9d?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80',
        ],
        rating: 4.6,
        reviewCount: 1920,
        description:
            'Triple-strength omega-3 fatty acids sourced from wild-caught fish. Supports heart, brain, and joint health.',
        benefits: [
            'Supports cardiovascular health',
            'Promotes brain function',
            'Helps joint flexibility',
            'Supports healthy inflammation response',
        ],
        ingredients:
            'Fish Oil Concentrate 1200mg (EPA 600mg, DHA 400mg), Natural Lemon Flavor, Softgel Shell (Gelatin, Glycerin, Water).',
        directions: 'Take 1 softgel daily with a meal.',
        warning:
            'Contains fish. Consult your doctor if you take blood-thinning medication.',
        badges: [
            { id: '1', label: 'Gluten\nfree', type: 'gf' },
            { id: '3', label: '100%\norganic', type: 'organic' },
        ],
    },
    {
        id: 'turmeric',
        name: 'Turmeric Curcumin',
        price: 21.0,
        priceFormatted: '$21.00 USD',
        images: [
            'https://images.unsplash.com/photo-1615485500928-44e63e8fe5e4?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80',
        ],
        rating: 4.8,
        reviewCount: 2654,
        description:
            'High-potency turmeric with BioPerine® for enhanced absorption. A powerful antioxidant and anti-inflammatory support.',
        benefits: [
            'Powerful antioxidant support',
            'Supports joint comfort',
            'Promotes healthy inflammatory response',
            'Aids digestive health',
        ],
        ingredients:
            'Organic Turmeric (Curcuma longa) root extract 1500mg (standardized to 95% curcuminoids), BioPerine® Black Pepper extract 10mg.',
        directions: 'Take 2 capsules daily with meals.',
        warning:
            'Not recommended for individuals with gallbladder issues. Consult physician if on blood thinners.',
        badges: [
            { id: '1', label: 'Gluten\nfree', type: 'gf' },
            { id: '2', label: 'Vegan', type: 'vegan' },
            { id: '3', label: '100%\norganic', type: 'organic' },
        ],
    },
    {
        id: 'probiotics',
        name: 'Daily Probiotics',
        price: 25.5,
        priceFormatted: '$25.50 USD',
        images: [
            'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80',
        ],
        rating: 4.4,
        reviewCount: 1532,
        description:
            '50 billion CFU multi-strain probiotic for comprehensive gut health and immune support.',
        benefits: [
            'Restores gut bacteria balance',
            'Supports immune system',
            'Aids digestion and nutrient absorption',
            'Promotes regularity',
        ],
        ingredients:
            'Probiotic Blend 50 Billion CFU (Lactobacillus acidophilus, Bifidobacterium lactis, Lactobacillus rhamnosus, and 7 additional strains), Delayed-Release Capsule.',
        directions:
            'Take 1 capsule daily on an empty stomach, or as directed.',
        warning: 'Refrigerate after opening for maximum potency.',
        badges: [
            { id: '1', label: 'Gluten\nfree', type: 'gf' },
            { id: '2', label: 'Vegan', type: 'vegan' },
        ],
    },
    {
        id: 'vitamin-d',
        name: 'Vitamin D3 + K2',
        price: 16.0,
        priceFormatted: '$16.00 USD',
        images: [
            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80',
        ],
        rating: 4.9,
        reviewCount: 4102,
        description:
            'Synergistic combination of Vitamin D3 and K2 for optimal calcium absorption and bone health.',
        benefits: [
            'Essential for bone strength',
            'Supports immune function',
            'Promotes calcium absorption',
            'Supports cardiovascular health',
        ],
        ingredients:
            'Vitamin D3 (Cholecalciferol) 5000 IU, Vitamin K2 (MK-7) 100mcg, Organic Olive Oil, Softgel Shell.',
        directions: 'Take 1 softgel daily with a fat-containing meal.',
        warning:
            'Consult your healthcare provider if you are taking warfarin or other anticoagulants.',
        badges: [
            { id: '1', label: 'Gluten\nfree', type: 'gf' },
            { id: '3', label: '100%\norganic', type: 'organic' },
        ],
    },
];

export const customerReviews: CustomerReview[] = [
    {
        id: '1',
        heading: 'Happy customer',
        rating: 5,
        text: "After just a month of trying this brand's supplements, I'm a believer. I've noticed a remarkable change in my overall well-being. It's the boost I didn't know I needed!",
        name: 'Jordan T.',
        location: 'CA',
    },
    {
        id: '2',
        heading: 'Life changing!',
        rating: 5,
        text: "I've been taking these supplements for 3 months and the difference in my energy levels is incredible. Highly recommend to anyone looking for natural wellness support.",
        name: 'Michelle R.',
        location: 'NY',
    },
    {
        id: '3',
        heading: 'Great quality',
        rating: 5,
        text: 'The purity and quality of these supplements is outstanding. I love that they are organic and vegan-friendly. My whole family uses them now.',
        name: 'David K.',
        location: 'TX',
    },
    {
        id: '4',
        heading: 'Noticed improvement',
        rating: 4,
        text: 'Within two weeks I started noticing better sleep and less stress. The ashwagandha has become a staple in my daily routine.',
        name: 'Sarah L.',
        location: 'WA',
    },
    {
        id: '5',
        heading: 'Excellent product',
        rating: 5,
        text: 'Clean ingredients, fast shipping, and great results. What more could you ask for? Will definitely be ordering again.',
        name: 'James W.',
        location: 'FL',
    },
    {
        id: '6',
        heading: 'Worth every penny',
        rating: 5,
        text: "I've tried many brands and this one stands out for quality and effectiveness. My focus and energy have improved significantly.",
        name: 'Priya M.',
        location: 'IL',
    },
    {
        id: '7',
        heading: 'So glad I found this',
        rating: 5,
        text: 'As someone who is very particular about what I put in my body, I appreciate the transparency of ingredients. Fantastic product!',
        name: 'Alex B.',
        location: 'CO',
    },
    {
        id: '8',
        heading: 'Reliable and effective',
        rating: 4,
        text: 'Consistent quality every time I order. The supplements are easy to take and I feel the difference when I miss a day.',
        name: 'Emma C.',
        location: 'OR',
    },
];
