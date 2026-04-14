'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { storageService } from '@/services/storage.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, Save, Loader2 } from 'lucide-react';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'];

export default function ProfilePage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    adress: '',
  });

  useEffect(() => {
    if (user && !authLoading) {
      setFormData((prev) => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        adress: user.adress || '',
      }));
    }
  }, [user, authLoading]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const { data } = await authService.updateMe(formData);
      storageService.setUser(data);
      refreshUser();
      alert('Profil mis à jour !');
    } catch {
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validation du Format
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Format non supporté. Utilisez JPG, PNG ou SVG.');
      return;
    }

    // 2. Validation de la Taille
    if (file.size > MAX_FILE_SIZE) {
      alert('Le fichier est trop lourd. Maximum 2MB autorisé.');
      return;
    }

    setLogoLoading(true);
    try {
      const { data } = await authService.uploadLogo(file);

      // On met à jour l'utilisateur dans le stockage local pour refléter le changement
      if (user) {
        storageService.setUser({ ...user, logo_url: data.logo_url });
      }

      alert('Logo mis à jour avec succès !');
      window.location.reload();
    } catch {
      alert("Erreur lors de l'upload du logo sur le serveur.");
    } finally {
      setLogoLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 py-8">
              <Skeleton className="h-40 w-40 rounded-xl" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-40" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <header>
        <h1 className="font-heading text-foreground text-3xl font-bold">
          Mon Profil
        </h1>
        <p className="text-muted-foreground">
          Gérez vos informations et votre identité visuelle.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* SECTION LOGO */}
        <Card className="border-border/50 shadow-sm md:col-span-1">
          <CardHeader className="bg-muted/20 border-b py-4">
            <CardTitle className="text-sm font-semibold tracking-wider uppercase">
              Logo de l&apos;entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-8">
            <div className="group border-border bg-muted/30 hover:border-primary/50 relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors">
              {user?.logo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.logo_url}
                  alt="Logo"
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2">
                  <Camera size={40} strokeWidth={1.5} />
                  <span className="text-xs">Aucun logo</span>
                </div>
              )}

              {logoLoading && (
                <div className="bg-background/60 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
                  <Loader2 className="text-primary animate-spin" size={24} />
                </div>
              )}
            </div>

            <div className="w-full space-y-3">
              <Label
                htmlFor="logo-upload"
                className={`bg-primary text-primary-foreground flex w-full cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 ${logoLoading ? 'pointer-events-none opacity-50' : ''}`}
              >
                <Camera size={16} />
                {user?.logo_url ? 'Changer le logo' : 'Ajouter un logo'}
              </Label>
              <Input
                id="logo-upload"
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.svg"
                onChange={handleLogoUpload}
                disabled={logoLoading}
              />
              <div className="rounded-lg bg-blue-500/5 p-3 text-center">
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Formats :{' '}
                  <strong className="text-foreground">PNG, JPG, SVG</strong>
                  <br />
                  Poids max : <strong className="text-foreground">2 Mo</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION INFOS */}
        <Card className="border-border/50 shadow-sm md:col-span-2">
          <CardHeader className="bg-muted/20 border-b py-4">
            <CardTitle className="text-sm font-semibold tracking-wider uppercase">
              Détails du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="py-6">
            <form
              key={user?.id || 'loading'}
              onSubmit={handleUpdateProfile}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    placeholder="Ex: Clément"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    placeholder="Ex: Martin"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  Email{' '}
                  <span className="text-muted-foreground text-[10px] uppercase">
                    (Non modifiable)
                  </span>
                </Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="bg-muted/50 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adress">Adresse professionnelle</Label>
                <Input
                  id="adress"
                  placeholder="123 Rue de la Paix, 75000 Paris"
                  value={formData.adress}
                  onChange={(e) =>
                    setFormData({ ...formData, adress: e.target.value })
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full gap-2 shadow-sm sm:w-auto"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Sauvegarder les changements
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
