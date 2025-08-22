'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const API_KEY = "ee54848dsqwdeeegdeeffg654987545564%%";

const FormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  expertise_id: z.coerce.number().min(1, "Please select an expertise."),
  bio: z.string().min(10, "Bio must be at least 10 characters."),
  experience: z.string().optional(),
  language: z.string().optional(),
  location: z.string().optional(),
  profile_image: z.instanceof(File).optional().refine(file => !file || file.size <= 5 * 1024 * 1024, 'Max image size is 5MB.'),
});

export type State = {
  errors?: {
    [key: string]: string[] | undefined;
  };
  message?: string | null;
};

export async function addAstrologer(prevState: State, formData: FormData) {
  const validatedFields = FormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create astrologer. Please check the fields.',
    };
  }
  
  const register_date = new Date().toISOString().split('T')[0];
  formData.append('register_date', register_date);
  
  // Remove empty optional fields so the API can use its defaults
  if (!formData.get('experience')) formData.delete('experience');
  if (!formData.get('language')) formData.delete('language');
  if (!formData.get('location')) formData.delete('location');
  const profileImage = formData.get('profile_image') as File;
  if (!profileImage || profileImage.size === 0) {
    formData.delete('profile_image');
  }

  try {
    const response = await fetch(`https://api.astrobarta.com/register_astrologer.php?api_key=${API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        return {
            message: `API Error: ${result.error || result.errors?.join(', ') || response.statusText}`,
            errors: result.errors ? { _form: result.errors } : undefined
        };
    }
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Astrologer.',
    };
  }

  revalidatePath('/astrologers');
  redirect('/astrologers');
}

export async function updateAstrologer(id: number, prevState: State, formData: FormData) {
  const validatedFields = FormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to update astrologer. Please check the fields.',
    };
  }

  formData.append('astrologer_id', id.toString());
  
  // Remove empty optional fields so the API can use its defaults
  if (!formData.get('experience')) formData.delete('experience');
  if (!formData.get('language')) formData.delete('language');
  if (!formData.get('location')) formData.delete('location');
  const profileImage = formData.get('profile_image') as File;
  if (!profileImage || profileImage.size === 0) {
    formData.delete('profile_image');
  }

  try {
    const response = await fetch(`https://api.astrobarta.com/update_profile_astrologer.php?api_key=${API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        const errorMessage = result.error || (Array.isArray(result.errors) ? result.errors.join(', ') : response.statusText);
        return {
            message: `API Error: ${errorMessage}`,
            errors: result.errors ? { _form: Array.isArray(result.errors) ? result.errors : [result.error] } : undefined,
        };
    }
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Astrologer.',
    };
  }
  
  revalidatePath('/astrologers');
  revalidatePath(`/astrologers/edit/${id}`);
  redirect('/astrologers');
}

const BookingStatusSchema = z.object({
  id: z.coerce.number(),
  status: z.enum(['accepted', 'cancelled']),
  remarks: z.string().optional(),
});

export async function updateBookingStatus(prevState: State, formData: FormData) {
  const validatedFields = BookingStatusSchema.safeParse({
    id: formData.get('id'),
    status: formData.get('status'),
    remarks: formData.get('remarks'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid data provided.',
    };
  }

  const { id, status, remarks } = validatedFields.data;

  try {
    const response = await fetch(`https://api.astrobarta.com/update_booking.php?api_key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        booking_status: status,
        remarks: remarks || '',
      }),
    });

    const result = await response.json();

    if (result.status !== 'success') {
      return {
        message: `API Error: ${result.message || result.error || 'Failed to update booking.'}`,
      };
    }

    revalidatePath('/bookings');
    return { message: 'Booking status updated successfully.' };

  } catch (error) {
    return {
      message: 'Database Error: Failed to update booking status.',
    };
  }
}

const CallRequestStatusSchema = z.object({
  id: z.coerce.number(),
  status: z.enum(['call completed', 'cancelled']),
  remark: z.string().min(1, 'Remark is required.'),
});

export async function updateCallRequestStatus(prevState: State, formData: FormData) {
  const validatedFields = CallRequestStatusSchema.safeParse({
    id: formData.get('id'),
    status: formData.get('status'),
    remark: formData.get('remark'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid data provided. Please fill all fields.',
    };
  }

  const { id, status, remark } = validatedFields.data;

  // Map frontend status to the new backend statuses
  const apiStatusMap: { [key: string]: string } = {
    'call completed': 'call approve',
    'cancelled': 'call request can cancel',
  };
  const apiStatus = apiStatusMap[status];

  try {
    const response = await fetch(`https://api.astrobarta.com/update_call_request.php?api_key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        status: apiStatus,
        remark: remark,
      }),
    });

    const result = await response.json();
    
    if (result.message !== 'Call request updated successfully') {
      const errorMessage = result.message || result.error || (Array.isArray(result.errors) ? result.errors.join(', ') : 'Failed to update call request.');
      return {
        message: `API Error: ${errorMessage}`,
      };
    }

    revalidatePath('/call-requests');
    return { message: 'Call request status updated successfully.' };

  } catch (error) {
    return {
      message: 'Database Error: Failed to update call request status.',
    };
  }
}
