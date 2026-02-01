import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OfferCard from "../../../components/OfferCard";


export const dynamic = "force-dynamic";

export default async function SellerOffersPage() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookies() }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div className="text-white p-8">Please log in.</div>;

  // Get all offers for cars owned by this seller
  const { data: offers } = await supabase
    .from("offers")
    .select(`*, car:cars(title), buyer:profiles(full_name)`)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Offers for Your Cars</h1>
      <div>
        {offers && offers.length > 0 ? (
          offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} isSeller onStatusChange={() => {}} />
          ))
        ) : (
          <div className="text-gray-400">No offers yet.</div>
        )}
      </div>
    </div>
  );
}
