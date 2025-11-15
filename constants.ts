import { type CreditPackage, type ContentItem, SubscriptionPlan, User } from './types';

// Fix: Add and export REWARD_AMOUNT constant.
export const REWARD_AMOUNT = 100;

export const INITIAL_USERS: User[] = [
    {
        id: '20251103-003',
        role: 'user',
        username: 'RegularUser123',
        profilePictureUrl: 'https://i.pravatar.cc/150?u=user',
        followers: ['20251103-001', '20251103-002'],
        following: ['20251103-001'],
        email: 'user@example.com',
        vitrineSlug: 'regular-user-123',
    },
    {
        id: '20251103-001',
        role: 'creator',
        username: 'ArtisticCreator',
        profilePictureUrl: 'https://i.pravatar.cc/150?u=creator',
        followers: ['20251103-003'],
        following: ['20251103-002', '20251103-003'],
        email: 'creator@example.com',
        vitrineSlug: 'artistic-creator',
    },
     {
        id: '20251103-002',
        role: 'developer',
        username: 'DevAdmin',
        profilePictureUrl: 'https://i.pravatar.cc/150?u=developer',
        followers: [],
        following: ['20251103-001'],
        email: 'dev@example.com',
        vitrineSlug: 'dev-admin',
    }
];

// REMOVED: INITIAL_CREDIT_PACKAGES - Now loaded from Supabase credit_packages table
// Credit packages are now managed entirely in Supabase for security and consistency

export const INITIAL_CONTENT_ITEMS: ContentItem[] = [
    { id: 'item1', creatorId: '20251103-001', title: 'Galactic Voyager', price: 150, imageUrl: 'https://picsum.photos/seed/item1/600/800', userReactions: {'20251103-003': '😍', '20251103-001': '', '20251103-002': '❤️'}, mediaCount: {images: 1, videos: 0}, blurLevel: 5, likedBy: ['20251103-003', '20251103-002'], sharedBy: ['20251103-003', '20251103-002'], createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), tags: ['#space', '#scifi', '#art'] },
    { id: 'item2', creatorId: '20251103-001', title: 'Mystic Forest', price: 200, imageUrl: 'https://picsum.photos/seed/item2/600/800', userReactions: {'20251103-003': '😲', '20251103-001': '', '20251103-002': ''}, mediaCount: {images: 3, videos: 1}, blurLevel: 8, likedBy: ['20251103-003'], sharedBy: ['20251103-003'], createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), tags: ['#fantasy', '#nature', '#magic'] },
    { id: 'item3', creatorId: '20251103-001', title: 'Cyberpunk Alley', price: 120, imageUrl: 'https://picsum.photos/seed/item3/600/800', userReactions: {'20251103-003': '😂', '20251103-001': '😂', '20251103-002': ''}, mediaCount: {images: 5, videos: 0}, blurLevel: 2, likedBy: [], sharedBy: [], createdAt: new Date().toISOString(), tags: ['#cyberpunk', '#scifi', '#neon'] },
    { id: 'item4', creatorId: '20251103-002', title: 'Oceanic Dreams', price: 250, imageUrl: 'https://picsum.photos/seed/item4/600/800', userReactions: {'20251103-003': '❤️', '20251103-001': '😘', '20251103-002': ''}, mediaCount: {images: 1, videos: 0}, blurLevel: 10, likedBy: ['20251103-003', '20251103-001'], sharedBy: ['20251103-003', '20251103-001', '20251103-002'], createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(), tags: ['#ocean', '#dream', '#art'] }
];

// REMOVED: INITIAL_SUBSCRIPTION_PLANS - Now loaded from Supabase subscription_plans table
// Subscription plans are now managed entirely in Supabase for security and consistency