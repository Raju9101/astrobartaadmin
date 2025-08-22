'use client';

import { useFormStatus } from 'react-dom';
import { addAstrologer, updateAstrologer, State } from '@/lib/actions';
import { Astrologer, Expertise } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useActionState, useEffect, useState } from 'react';
import Image from 'next/image';

interface AstrologerFormProps {
  astrologer?: Astrologer;
  expertise: Expertise[];
}

export default function AstrologerForm({ astrologer, expertise }: AstrologerFormProps) {
  const { toast } = useToast();
  const initialState: State = { message: null, errors: {} };
  const action = astrologer ? updateAstrologer.bind(null, astrologer.id) : addAstrologer;
  const [state, dispatch] = useActionState(action, initialState);
  const [imagePreview, setImagePreview] = useState<string | null>(astrologer?.profile_image ? `https://api.astrobarta.com${astrologer.profile_image}` : null);

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.errors ? "destructive" : "default",
        title: state.errors ? "Error" : "Success",
        description: state.message,
      });
    }
  }, [state, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const expertiseId = astrologer ? expertise.find(e => e.name === astrologer.expertise)?.id.toString() : undefined;

  return (
    <form action={dispatch}>
      <Card>
        <CardHeader>
          <CardTitle>{astrologer ? 'Edit Astrologer Details' : 'New Astrologer Details'}</CardTitle>
          <CardDescription>Fill in the form to {astrologer ? 'update the' : 'add a new'} astrologer profile.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" defaultValue={astrologer?.name} required aria-describedby="name-error" />
            <div id="name-error" aria-live="polite" aria-atomic="true">
              {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" defaultValue={astrologer?.email} required aria-describedby="email-error" />
            <div id="email-error" aria-live="polite" aria-atomic="true">
              {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expertise_id">Expertise</Label>
            <Select name="expertise_id" defaultValue={expertiseId}>
              <SelectTrigger aria-describedby="expertise-error">
                <SelectValue placeholder="Select expertise" />
              </SelectTrigger>
              <SelectContent>
                {expertise.map((e) => (
                  <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div id="expertise-error" aria-live="polite" aria-atomic="true">
              {state.errors?.expertise_id && <p className="text-sm text-destructive">{state.errors.expertise_id[0]}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">Experience (years)</Label>
            <Input id="experience" name="experience" type="number" defaultValue={astrologer?.experience} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Languages</Label>
            <Input id="language" name="language" defaultValue={astrologer?.language} placeholder="e.g., English, Hindi" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={astrologer?.location} placeholder="e.g., Delhi, India" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" defaultValue={astrologer?.bio} required rows={5} aria-describedby="bio-error" />
            <div id="bio-error" aria-live="polite" aria-atomic="true">
              {state.errors?.bio && <p className="text-sm text-destructive">{state.errors.bio[0]}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile_image">Profile Image</Label>
            {imagePreview && (
              <div className="my-2">
                <Image src={imagePreview} alt="Profile preview" width={80} height={80} className="rounded-lg object-cover" />
              </div>
            )}
            <Input id="profile_image" name="profile_image" type="file" accept="image/*" onChange={handleImageChange} aria-describedby="image-error" />
            <p className="text-sm text-muted-foreground">
              {astrologer ? 'Upload a new image to replace the current one.' : 'Max 5MB. JPG, PNG, GIF.'}
            </p>
            <div id="image-error" aria-live="polite" aria-atomic="true">
              {state.errors?.profile_image && <p className="text-sm text-destructive">{state.errors.profile_image[0]}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href="/astrologers">Cancel</Link>
          </Button>
          <SubmitButton text={astrologer ? 'Update Astrologer' : 'Add Astrologer'} />
        </CardFooter>
      </Card>
    </form>
  );
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? 'Saving...' : text}
    </Button>
  );
}
