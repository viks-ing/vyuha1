import React, { useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Switch } from '../components/ui/Switch';
import { Button } from '../components/ui/Button';
import { User, Bell, Sliders, Save, Key } from 'lucide-react';

export const Settings: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    notificationSettings,
    updateNotificationSettings,
    preferences,
    updatePreferences,
    showToast,
  } = useCompany();

  const [accountForm, setAccountForm] = useState(userProfile);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirmPass: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleAccountSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateUserProfile(accountForm);
      setIsSaving(false);
      showToast('Account details saved');
    }, 400);
  };

  const handlePasswordSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      showToast('New passwords do not match!');
      return;
    }
    showToast('Password updated successfully');
    setPasswordForm({ current: '', newPass: '', confirmPass: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">System Preferences & Settings</h2>
        <p className="text-sm text-slate-600">
          Configure alerts, threshold alerts, team notification channels, and account security.
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Information Card */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <User className="w-5 h-5 text-sky-600" />
              Account & User Information
            </CardTitle>
            <CardDescription>Personal details and organizational access credentials</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAccountSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={accountForm.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAccountForm({ ...accountForm, name: e.target.value })
                  }
                  required
                />

                <Input
                  label="Work Email Address"
                  type="email"
                  value={accountForm.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAccountForm({ ...accountForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Role / Title"
                  value={accountForm.role}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAccountForm({ ...accountForm, role: e.target.value })
                  }
                />

                <Input
                  label="Phone Number"
                  value={accountForm.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAccountForm({ ...accountForm, phone: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" isLoading={isSaving}>
                  <Save className="w-4 h-4 mr-1.5" /> Save Profile Info
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Notifications Settings Card */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <Bell className="w-5 h-5 text-amber-600" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Control automated risk alerts and summary email dispatches</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 divide-y divide-slate-100">
            <Switch
              label="Risk Alerts"
              description="Receive notifications whenever an individual risk factor score increases by >5 points."
              checked={notificationSettings.riskAlerts}
              onCheckedChange={(val: boolean) => updateNotificationSettings({ riskAlerts: val })}
            />

            <Switch
              label="Critical Alerts"
              description="Immediate high-priority mobile & email alerts for severe weather or route closures."
              checked={notificationSettings.criticalAlerts}
              onCheckedChange={(val: boolean) => updateNotificationSettings({ criticalAlerts: val })}
            />

            <Switch
              label="Weekly Reports"
              description="Receive weekly automated PDF executive briefing summaries."
              checked={notificationSettings.weeklyReports}
              onCheckedChange={(val: boolean) => updateNotificationSettings({ weeklyReports: val })}
            />

            <Switch
              label="Email Notifications"
              description="Deliver alert notifications directly to your primary work email."
              checked={notificationSettings.emailNotifications}
              onCheckedChange={(val: boolean) => updateNotificationSettings({ emailNotifications: val })}
            />
          </CardContent>
        </Card>

        {/* Dashboard Preferences Card */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <Sliders className="w-5 h-5 text-emerald-600" />
              Dashboard & Threshold Preferences
            </CardTitle>
            <CardDescription>Customize default view models and warning trigger sensitivity</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Default Dashboard View"
                value={preferences.defaultView}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  updatePreferences({ defaultView: e.target.value as any })
                }
                options={[
                  { value: 'Overview', label: 'Overview Dashboard' },
                  { value: 'Risk Analysis', label: 'Detailed Risk Analysis Focus' },
                  { value: 'Alerts Focus', label: 'Active Alerts Priority' },
                ]}
              />

              <Input
                label="Critical Risk Threshold Score"
                type="number"
                min="50"
                max="95"
                value={preferences.riskThreshold}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updatePreferences({ riskThreshold: parseInt(e.target.value) || 75 })
                }
                helperText="Scores above this threshold flag red critical status."
              />
            </div>
          </CardContent>
        </Card>

        {/* Security / Password Card */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <Key className="w-5 h-5 text-rose-600" />
              Password & Security
            </CardTitle>
            <CardDescription>Update your account access password</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={passwordForm.current}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPasswordForm({ ...passwordForm, current: e.target.value })
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.newPass}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPasswordForm({ ...passwordForm, newPass: e.target.value })
                  }
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.confirmPass}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPasswordForm({ ...passwordForm, confirmPass: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="outline" size="sm">
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
