
import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Edit, Save, X, Camera, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUserProfile, useUpdateUserProfile, useUploadProfilePicture, useRemoveProfilePicture, useChangePassword } from '../hooks/useUserProfile';
import { UserProfileUpdateDto, ChangePasswordDto } from '../types/api';
import ImageUpload from '../components/ui/image-upload';

const UserProfile: React.FC = () => {
  const { isRTL, t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // API hooks
  const { data: profileResult, isLoading } = useCurrentUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const uploadPictureMutation = useUploadProfilePicture();
  const removePictureMutation = useRemoveProfilePicture();
  const changePasswordMutation = useChangePassword();

  const profile = profileResult?.data;

  const [formData, setFormData] = useState<UserProfileUpdateDto>({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
    phoneNumber: profile?.phoneNumber || '',
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordDto>({
    currentPassword: '',
    newPassword: '',
  });

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      const result = await updateProfileMutation.mutateAsync(formData);
      if (result.success) {
        toast.success(t('profileSavedSuccess'));
        setIsEditing(false);
      } else {
        toast.error(result.errorMessage || t('failedToSaveProfile'));
      }
    } catch (error) {
      toast.error(t('failedToSaveProfile'));
    }
  };

  const handleProfilePictureSelect = async (file: File) => {
    try {
      const result = await uploadPictureMutation.mutateAsync(file);
      if (result.success) {
        toast.success(t('profilePictureUploadedSuccess'));
      } else {
        toast.error(result.errorMessage || t('failedToUploadPicture'));
      }
    } catch (error) {
      toast.error(t('failedToUploadPicture'));
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      const result = await removePictureMutation.mutateAsync();
      if (result.success) {
        toast.success(t('profilePictureRemovedSuccess'));
      } else {
        toast.error(result.errorMessage || t('failedToRemovePicture'));
      }
    } catch (error) {
      toast.error(t('failedToRemovePicture'));
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error(t('fillAllFields'));
      return;
    }

    try {
      const result = await changePasswordMutation.mutateAsync(passwordData);
      if (result.success) {
        toast.success(t('passwordChangedSuccess'));
        setShowChangePassword(false);
        setPasswordData({ currentPassword: '', newPassword: '' });
      } else {
        toast.error(result.errorMessage || t('failedToChangePassword'));
      }
    } catch (error) {
      toast.error(t('failedToChangePassword'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-sm">
            {t('loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background p-4 sm:p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t('userProfile')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isRTL ? 'إدارة معلوماتك الشخصية وإعداداتك' : 'Manage your personal information and settings'}
            </p>
          </div>
          <div className={`flex flex-wrap items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              onClick={() => setShowChangePassword(!showChangePassword)}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Lock className="w-4 h-4" />
              {t('changePassword')}
            </Button>
            <Button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={updateProfileMutation.isPending}
              size="sm"
              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {isEditing 
                ? (updateProfileMutation.isPending ? t('saving') : t('save'))
                : t('edit')
              }
            </Button>
          </div>
        </div>

        {/* Change Password Section */}
        {showChangePassword && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Lock className="w-5 h-5" />
                {t('changePassword')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('currentPassword')}
                  </label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className={isRTL ? 'text-right' : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('newPassword')}
                  </label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className={isRTL ? 'text-right' : ''}
                  />
                </div>
              </div>
              <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Button 
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  size="sm"
                >
                  {changePasswordMutation.isPending ? t('changing') : t('change')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowChangePassword(false)}
                >
                  {t('cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profile Picture Section */}
          <div className="lg:col-span-4">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <User className="w-5 h-5" />
                  {t('profilePicture')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onImageSelect={handleProfilePictureSelect}
                  onImageRemove={handleRemoveProfilePicture}
                  preview={profile?.profilePictureUrl}
                  disabled={uploadPictureMutation.isPending || removePictureMutation.isPending}
                />
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {t('clickToChangePicture')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <CardTitle className="text-lg">{t('personalInfo')}</CardTitle>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <X className="w-4 h-4" />
                      {t('cancel')}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('firstName')}
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!isEditing}
                      className={isRTL ? 'text-right' : ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('lastName')}
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!isEditing}
                      className={isRTL ? 'text-right' : ''}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('email')}
                  </label>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className={`flex-1 ${isRTL ? 'text-right' : ''}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('phoneNumber')}
                  </label>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      value={formData.phoneNumber || ''}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      disabled={!isEditing}
                      className={`flex-1 ${isRTL ? 'text-right' : ''}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Calendar className="w-5 h-5" />
                  {t('accountInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('username')}
                    </label>
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {profile?.userName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('role')}
                    </label>
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {profile?.role || t('user')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('createdAt')}
                    </label>
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('lastLogin')}
                    </label>
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  {profile?.tenantName && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        {t('organization')}
                      </label>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {profile.tenantName}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
