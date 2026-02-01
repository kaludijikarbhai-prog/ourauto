import { supabase } from './supabase';
import { getUser } from './auth';
import type { DealerLeadWithDetails, LeadStatus } from './types';

// Re-export types
export type { DealerLeadWithDetails, LeadStatus };

/**
 * Get all leads for a dealer
 */
export async function getDealerLeads(): Promise<DealerLeadWithDetails[]> {
  try {
    const user = await getUser();
    if (!user) {
      return [];
    }

    // Get dealer's cars first
    const { data: dealerCars, error: carsError } = await supabase
      .from('cars')
      .select('id')
      .eq('user_id', user.id);

    if (carsError) {
      console.error('Get dealer cars error:', carsError);
      return [];
    }

    const carIds = dealerCars?.map((car) => car.id) || [];
    if (carIds.length === 0) {
      return [];
    }

    // Get leads for dealer's cars with car details
    const { data: leads, error: leadsError } = await supabase
      .from('dealer_leads')
      .select('*')
      .in('car_id', carIds)
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error('Get leads error:', leadsError);
      return [];
    }

    // Get all referenced cars and inspections
    const carIdSet = new Set((leads || []).map((l: any) => l.car_id));
    const inspectionIdSet = new Set(
      (leads || []).map((l: any) => l.inspection_id).filter(Boolean)
    );

    const [{ data: carsData }, { data: inspectionsData }] = await Promise.all([
      supabase.from('cars').select('id, owner_id, title, brand, model, year, price, city, km, status, created_at').in('id', Array.from(carIdSet)),
      inspectionIdSet.size > 0
        ? supabase
            .from('inspections')
            .select('id, date, time_slot, city')
            .in('id', Array.from(inspectionIdSet))
        : Promise.resolve({ data: [] }),
    ]);

    // Create maps for easy lookup
    const carMap = new Map(carsData?.map((c: any) => [c.id, c]) || []);
    const inspectionMap = new Map(inspectionsData?.map((i: any) => [i.id, i]) || []);

    // Map and flatten the response
    return (leads || []).map((item: any) => {
      const carData = carMap.get(item.car_id);
      const inspectionData = inspectionMap.get(item.inspection_id);

      return {
        id: item.id,
        dealer_id: item.dealer_id,
        car_id: item.car_id,
        inspection_id: item.inspection_id,
        status: item.status,
        created_at: item.created_at,
        car: {
          id: carData?.id || '',
          owner_id: carData?.owner_id || '',
          title: carData?.title || 'Unknown',
          brand: carData?.brand || 'Unknown',
          model: carData?.model || 'Unknown',
          year: carData?.year || 0,
          price: carData?.price || 0,
          city: carData?.city || 'Unknown',
          km: carData?.km || 0,
          status: carData?.status || 'active',
          created_at: carData?.created_at || new Date().toISOString(),
        } as any,
        inspection: inspectionData
          ? {
              date: inspectionData.date,
              time_slot: inspectionData.time_slot,
              city: inspectionData.city,
            }
          : undefined,
      } as DealerLeadWithDetails;
    });
  } catch (error) {
    console.error('Get dealer leads error:', error);
    return [];
  }
}

/**
 * Get single lead
 */
export async function getLead(leadId: string): Promise<DealerLeadWithDetails | null> {
  try {
    const { data: lead, error: leadError } = await supabase
      .from('dealer_leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('Get lead error:', leadError);
      return null;
    }

    if (!lead) {
      return null;
    }

    // Get car and inspection data
    const [{ data: carData }, { data: inspectionData }] = await Promise.all([
      supabase
        .from('cars')
        .select('id, owner_id, title, brand, model, year, price, city, km, status, created_at')
        .eq('id', lead.car_id)
        .single(),
      lead.inspection_id
        ? supabase
            .from('inspections')
            .select('id, date, time_slot, city')
            .eq('id', lead.inspection_id)
            .single()
        : Promise.resolve({ data: null }),
    ]);

    return {
      id: lead.id,
      dealer_id: lead.dealer_id,
      car_id: lead.car_id,
      inspection_id: lead.inspection_id,
      status: lead.status,
      created_at: lead.created_at,
      car: {
        id: carData?.id || '',
        owner_id: carData?.owner_id || '',
        title: carData?.title || 'Unknown',
        brand: carData?.brand || 'Unknown',
        model: carData?.model || 'Unknown',
        year: carData?.year || 0,
        price: carData?.price || 0,
        city: carData?.city || 'Unknown',
        km: carData?.km || 0,
        status: carData?.status || 'active',
        created_at: carData?.created_at || new Date().toISOString(),
      } as any,
      inspection: inspectionData
        ? {
            date: inspectionData.date,
            time_slot: inspectionData.time_slot,
            city: inspectionData.city,
          }
        : (undefined as any),
    };
  } catch (error) {
    console.error('Get lead error:', error);
    return null;
  }
}

/**
 * Create a new lead (when someone shows interest in a car)
 */
export async function createLead(input: {
  dealer_id: string;
  car_id: string;
  inspection_id?: string;
}): Promise<{ lead: DealerLeadWithDetails | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('dealer_leads')
      .insert([
        {
          dealer_id: input.dealer_id,
          car_id: input.car_id,
          inspection_id: input.inspection_id || null,
          status: 'new',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { lead: data as DealerLeadWithDetails };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create lead';
    return { lead: null, error: message };
  }
}

/**
 * Update lead status
 */
export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus
): Promise<{ lead: DealerLeadWithDetails | null; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify lead belongs to dealer's car
    const { data: lead } = await supabase
      .from('dealer_leads')
      .select('dealer_id, car_id')
      .eq('id', leadId)
      .single();

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Verify dealer owns the car
    const { data: car } = await supabase
      .from('cars')
      .select('user_id')
      .eq('id', lead.car_id)
      .single();

    if (car?.user_id !== user.id) {
      throw new Error('You do not have permission to update this lead');
    }

    const { data, error } = await supabase
      .from('dealer_leads')
      .update({ status })
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { lead: data as DealerLeadWithDetails };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update lead status';
    return { lead: null, error: message };
  }
}

/**
 * Get lead statistics
 */
export async function getLeadStats(): Promise<{
  total: number;
  new: number;
  contacted: number;
  interested: number;
  closed: number;
}> {
  try {
    const user = await getUser();
    if (!user) {
      return { total: 0, new: 0, contacted: 0, interested: 0, closed: 0 };
    }

    // Get dealer's cars
    const { data: dealerCars } = await supabase
      .from('cars')
      .select('id')
      .eq('user_id', user.id);

    const carIds = dealerCars?.map((car) => car.id) || [];
    if (carIds.length === 0) {
      return { total: 0, new: 0, contacted: 0, interested: 0, closed: 0 };
    }

    const { data } = await supabase
      .from('dealer_leads')
      .select('status')
      .in('car_id', carIds);

    const leads = data || [];
    const stats = {
      total: leads.length,
      new: leads.filter((l) => l.status === 'new').length,
      contacted: leads.filter((l) => l.status === 'contacted').length,
      interested: leads.filter((l) => l.status === 'interested').length,
      closed: leads.filter((l) => l.status === 'closed').length,
    };

    return stats;
  } catch (error) {
    console.error('Get stats error:', error);
    return { total: 0, new: 0, contacted: 0, interested: 0, closed: 0 };
  }
}

/**
 * Get all cars for a dealer
 */
export async function getDealerCars() {
  try {
    const user = await getUser();
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get dealer cars error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Get dealer cars error:', error);
    return [];
  }
}

/**
 * Get all inspections for dealer cars
 */
export async function getDealerInspections() {
  try {
    const user = await getUser();
    if (!user) {
      return [];
    }

    // Get dealer's cars
    const { data: dealerCars } = await supabase
      .from('cars')
      .select('id')
      .eq('user_id', user.id);

    const carIds = dealerCars?.map((car) => car.id) || [];
    if (carIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .in('car_id', carIds)
      .order('date', { ascending: true });

    if (error) {
      console.error('Get dealer inspections error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Get dealer inspections error:', error);
    return [];
  }
}
