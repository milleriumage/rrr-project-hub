import React, { useState, useEffect } from 'react';
import { useCredits } from '../hooks/useCredits';
import { User } from '../types';
import Notification from '../components/Notification';

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

const Account: React.FC = () => {
    const { currentUser, updateUserProfile } = useCredits();
    const [formData, setFormData] = useState<Partial<User>>(currentUser || {});
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        setFormData(currentUser || {});
    }, [currentUser]);
    
    if (!currentUser) {
        return <div>Loading...</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'vitrineSlug') {
            setFormData({ ...formData, [name]: slugify(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handlePictureChange = () => {
        const newPic = `https://i.pravatar.cc/150?u=${Date.now()}`;
        updateUserProfile({ profilePictureUrl: newPic });
        setNotification('Profile picture updated!');
        setTimeout(() => setNotification(null), 2000);
    }
    
    const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setNotification('Please select an image file');
            setTimeout(() => setNotification(null), 2000);
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setNotification('Image size must be less than 5MB');
            setTimeout(() => setNotification(null), 2000);
            return;
        }

        try {
            const { supabase } = await import('../src/integrations/supabase/client');
            
            // Upload to Supabase Storage in user-specific folder
            const fileExt = file.name.split('.').pop();
            const filePath = `${currentUser.id}/${Date.now()}.${fileExt}`;
            const { data, error } = await supabase.storage
                .from('profile-pictures')
                .upload(filePath, file, { upsert: true });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(filePath);

            // Update profile in Supabase database
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ profile_picture_url: publicUrl })
                .eq('id', currentUser.id);
                
            if (updateError) throw updateError;

            // Update local context
            updateUserProfile({ profilePictureUrl: publicUrl });
            setNotification('Profile picture uploaded successfully!');
            setTimeout(() => setNotification(null), 2000);
        } catch (error) {
            console.error('Upload error:', error);
            setNotification('Failed to upload image');
            setTimeout(() => setNotification(null), 2000);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const { supabase } = await import('../src/integrations/supabase/client');
            
            // Update profile in Supabase
            const { error } = await supabase
                .from('profiles')
                .update({
                    username: formData.username,
                    vitrine_slug: formData.vitrineSlug
                })
                .eq('id', currentUser.id);
            
            if (error) throw error;
            
            // Update local context
            updateUserProfile(formData);
            setNotification('Profile saved successfully!');
            setTimeout(() => setNotification(null), 2000);
        } catch (error) {
            console.error('Error saving profile:', error);
            setNotification('Failed to save profile');
            setTimeout(() => setNotification(null), 2000);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {notification && <Notification message={notification} type="success" />}
            <h1 className="text-3xl font-bold text-white mb-6">My Account</h1>
            <div className="bg-neutral-800 rounded-lg shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <img src={currentUser.profilePictureUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                        <div className="flex flex-col space-y-2">
                            <button type="button" onClick={handlePictureChange} className="bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg">Change Picture</button>
                            <label className="bg-neutral-700 text-white font-semibold py-2 px-4 rounded-lg text-center cursor-pointer hover:bg-neutral-600 transition-colors">
                                Upload Media
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleMediaUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                     <div>
                        <label htmlFor="username" className="block text-sm font-medium text-neutral-300">Username</label>
                        <input type="text" name="username" id="username" value={formData.username || ''} onChange={handleChange} className="mt-1 block w-full bg-neutral-700 border-neutral-600 rounded-md py-2 px-3 text-white" />
                    </div>
                     <div>
                        <label htmlFor="vitrineSlug" className="block text-sm font-medium text-neutral-300">Vitrine Username (URL)</label>
                        <input type="text" name="vitrineSlug" id="vitrineSlug" value={formData.vitrineSlug || ''} onChange={handleChange} className="mt-1 block w-full bg-neutral-700 border-neutral-600 rounded-md py-2 px-3 text-white" />
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-neutral-400">Your public URL: /vitrine/{formData.vitrineSlug}</p>
                            <button
                                type="button"
                                onClick={() => {
                                    const url = `${window.location.origin}/vitrine/${formData.vitrineSlug}`;
                                    navigator.clipboard.writeText(url);
                                    setNotification('Showcase link copied!');
                                    setTimeout(() => setNotification(null), 2000);
                                }}
                                className="text-xs text-blue-400 hover:text-blue-300 underline"
                            >
                                Copy Link
                            </button>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-300">Email</label>
                        <input type="email" name="email" id="email" value={currentUser.email || ''} disabled className="mt-1 block w-full bg-neutral-700 border-neutral-600 rounded-md py-2 px-3 text-neutral-500 cursor-not-allowed" />
                        <p className="text-xs text-neutral-400 mt-1">Email cannot be changed for security reasons</p>
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    const { supabase } = await import('../src/integrations/supabase/client');
                                    const { error } = await supabase.auth.resend({
                                        type: 'signup',
                                        email: currentUser.email!
                                    });
                                    
                                    if (error) throw error;
                                    
                                    setNotification('Verification email sent! Check your inbox.');
                                    setTimeout(() => setNotification(null), 3000);
                                } catch (err) {
                                    setNotification('Failed to send verification email');
                                    setTimeout(() => setNotification(null), 3000);
                                }
                            }}
                            className="mt-2 text-sm text-brand-primary hover:text-brand-light underline"
                        >
                            Resend Email Verification
                        </button>
                    </div>
                     {/* Add more fields as needed, e.g., age, gender, phone */}

                    <div className="pt-2">
                         <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-primary hover:bg-brand-primary/90">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Account;