import { useState, useEffect } from 'react';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  createdAt: number;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'User',
  email: '',
  avatar: 'U',
  bio: '',
  createdAt: Date.now(),
};

export default function ProfileView() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const savedProfile = localStorage.getItem('ollama-user-profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  };

  const saveProfile = () => {
    localStorage.setItem('ollama-user-profile', JSON.stringify(profile));
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const cancelEdit = () => {
    loadProfile();
    setIsEditing(false);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-[900px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#e8e8e8] mb-2">Profile</h1>
          <p className="text-[#8a8a8a]">Manage your personal information</p>
        </div>

        {/* Save Notification */}
        {saved && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Profile saved successfully
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-8">
          <div className="flex items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-5xl">
                {profile.avatar}
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e8e8e8] rounded-lg transition-all duration-150 text-sm">
                Change Avatar
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm text-[#8a8a8a] mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className="text-lg text-[#e8e8e8]">{profile.name}</div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-[#8a8a8a] mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                    placeholder="your.email@example.com"
                  />
                ) : (
                  <div className="text-lg text-[#e8e8e8]">{profile.email || 'Not set'}</div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm text-[#8a8a8a] mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="text-[#e8e8e8]">{profile.bio || 'No bio added yet'}</div>
                )}
              </div>

              {/* Member Since */}
              <div>
                <label className="block text-sm text-[#8a8a8a] mb-2">Member Since</label>
                <div className="text-[#e8e8e8]">{new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-[#3a3a3a]">
            {isEditing ? (
              <>
                <button
                  onClick={saveProfile}
                  className="px-6 py-2.5 bg-accent-orange hover-accent-orange text-white rounded-lg transition-all duration-150 font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-6 py-2.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e8e8e8] rounded-lg transition-all duration-150"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-accent-orange hover-accent-orange text-white rounded-lg transition-all duration-150 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
            <div className="text-sm text-[#8a8a8a] mb-1">Total Chats</div>
            <div className="text-3xl font-semibold text-[#e8e8e8]">
              {JSON.parse(localStorage.getItem('ollama-chat-history') || '[]').length}
            </div>
          </div>
          <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
            <div className="text-sm text-[#8a8a8a] mb-1">Projects</div>
            <div className="text-3xl font-semibold text-[#e8e8e8]">
              {JSON.parse(localStorage.getItem('ollama-projects') || '[]').length}
            </div>
          </div>
          <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
            <div className="text-sm text-[#8a8a8a] mb-1">Code Snippets</div>
            <div className="text-3xl font-semibold text-[#e8e8e8]">
              {JSON.parse(localStorage.getItem('ollama-code-snippets') || '[]').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
