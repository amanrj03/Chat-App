import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface UserProfileProps {
  onClose: () => void;
}

const UserProfile = ({ onClose }: UserProfileProps) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    bio: '',
    gender: '',
    dateOfBirth: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        bio: data.bio || '',
        gender: data.gender || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
      });
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleUpdate = async () => {
    try {
      await api.updateProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    try {
      await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully');
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.profilePicture} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {profile ? getInitials(profile.name) : '??'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                disabled={!isEditing}
                placeholder="Male/Female/Other"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleUpdate} className="flex-1">
                  Save Changes
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} className="flex-1">
                  Edit Profile
                </Button>
                <Button
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  variant="outline"
                  className="flex-1"
                >
                  Change Password
                </Button>
              </>
            )}
          </div>

          {/* Password Change Section */}
          {showPasswordChange && (
            <div className="space-y-4 p-4 border border-border rounded-lg">
              <h3 className="font-semibold">Change Password</h3>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                />
              </div>
              <Button onClick={handlePasswordChange} className="w-full">
                Update Password
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
