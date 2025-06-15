"use client";
import { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "@/context/UserContext";
import {
  getUserProfile,
  updateUserProfile,
  updateProfilePhoto,
  deleteProfilePhoto,
  getUserStats,
  getUserFlares,
} from "@/lib/axios";
import { UserProfile, UserStats } from "@/types/user";
import { Flare } from "@/types/flare";
import Image from "next/image";
import { useRouter } from "next/navigation";

const AccountPage = () => {
  const router = useRouter();
  const { user, setUser } = useContext(UserContext);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userFlares, setUserFlares] = useState<Flare[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data on component mount
  useEffect(() => {
    // Don't redirect immediately - let UserContext load first
    if (user === null) {
      // Still loading or no user - wait
      return;
    }

    if (user === undefined || !user) {
      // User is definitely not logged in
      router.push("/");
      return;
    }

    loadUserData();
  }, [user, router]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [profileData, statsData, flaresData] = await Promise.all([
        getUserProfile(),
        getUserStats(),
        getUserFlares(),
      ]);

      setProfile(profileData);
      setStats(statsData);
      setUserFlares(flaresData.flares || []);
      setEditName(profileData.name);
      setEditUsername(profileData.username);
    } catch (err) {
      console.error("Failed to load user data:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      setError("");

      const updatedProfile = await updateUserProfile({
        name: editName,
        username: editUsername,
      });

      setProfile(updatedProfile);
      setUser({
        ...user!,
        name: updatedProfile.name,
        username: updatedProfile.username,
      });
      setIsEditing(false);
      setSuccess("Profile updated successfully!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB");
      return;
    }

    uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    try {
      setPhotoUploading(true);
      setError("");

      const updatedProfile = await updateProfilePhoto(file);
      setProfile(updatedProfile);
      setUser({
        ...user!,
        profile_photo_url: updatedProfile.profile_photo_url,
      });
      setSuccess("Profile photo updated!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setPhotoUploading(true);
      setError("");

      const updatedProfile = await deleteProfilePhoto();
      setProfile(updatedProfile);
      setUser({ ...user!, profile_photo_url: null });
      setSuccess("Profile photo deleted!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  if (loading || user === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  if (!user) {
    // This will trigger the redirect in useEffect
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Profile not found
          </h1>
          <button
            onClick={() => router.push("/")}
            className="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            ← Back to Map
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <div></div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Profile Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={updating}
                      className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 disabled:opacity-50"
                    >
                      {updating ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(profile.name);
                        setEditUsername(profile.username);
                        setError("");
                      }}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  ) : (
                    <p className="text-gray-900">@{profile.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{profile.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Since
                  </label>
                  <p className="text-gray-900">
                    {stats?.member_since ||
                      new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* User Flares */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                My Flares
              </h2>
              {userFlares.length === 0 ? (
                <p className="text-gray-600">
                  You haven't created any flares yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {userFlares.slice(0, 5).map((flare) => (
                    <div
                      key={flare.id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {flare.note}
                          </p>
                          <p className="text-sm text-gray-600">
                            {flare.place?.name || "Unknown location"} •{" "}
                            {flare.created_at
                              ? new Date(flare.created_at).toLocaleDateString()
                              : "Recently"}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            flare.category === "blue"
                              ? "bg-blue-100 text-blue-800"
                              : flare.category === "violet"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {flare.category}
                        </span>
                      </div>
                    </div>
                  ))}
                  {userFlares.length > 5 && (
                    <p className="text-sm text-gray-600 text-center">
                      And {userFlares.length - 5} more flares...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Photo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Photo
              </h3>

              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                  {profile.profile_photo_url ? (
                    <Image
                      src={profile.profile_photo_url}
                      alt="Profile photo"
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold">
                      {(profile.username || profile.name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  {photoUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="space-y-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoUploading}
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {profile.profile_photo_url
                      ? "Change Photo"
                      : "Upload Photo"}
                  </button>

                  {profile.profile_photo_url && (
                    <button
                      onClick={handleDeletePhoto}
                      disabled={photoUploading}
                      className="w-full text-red-600 py-2 px-4 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics */}
            {stats && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Statistics
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Flares</span>
                    <span className="font-semibold">{stats.total_flares}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Participants</span>
                    <span className="font-semibold">
                      {stats.total_participants}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold">
                      {stats.flares_this_month}
                    </span>
                  </div>

                  {stats.last_flare && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Flare</span>
                      <span className="font-semibold text-sm">
                        {new Date(stats.last_flare).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Category Breakdown */}
                {Object.keys(stats.category_breakdown).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Flare Categories
                    </h4>
                    <div className="space-y-1">
                      {Object.entries(stats.category_breakdown).map(
                        ([category, count]) => (
                          <div
                            key={category}
                            className="flex justify-between text-sm"
                          >
                            <span className="capitalize text-gray-600">
                              {category}
                            </span>
                            <span className="font-medium">{count}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
