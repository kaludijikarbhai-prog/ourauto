import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";


export const dynamic = "force-dynamic";

export default async function MyOffersPage() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookies() }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div className="text-white p-8">Please log in.</div>;

  // Get all offers made by this buyer
  const { data: offers } = await supabase
    .from("offers")
    .select(`*, car:cars(title), seller:profiles(full_name)`)
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">My Offers</h1>
      <div>
        {offers && offers.length > 0 ? (
          offers.map((offer) => (
            <div key={offer.id} className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-4 shadow-lg">
              <div className="text-white font-semibold text-lg mb-1">{offer.car.title}</div>
              <div className="text-gray-400 text-sm mb-1">Seller: {offer.seller.full_name}</div>
              <div className="text-blue-400 font-bold text-xl mb-1">${offer.offer_price.toLocaleString()}</div>
              <div className={`text-sm font-medium ${offer.status === "pending" ? "text-yellow-400" : offer.status === "accepted" ? "text-green-400" : "text-red-400"}`}>Status: {offer.status}</div>
            </div>
          ))
        ) : (
          <div className="text-gray-400">No offers yet.</div>
        )}
      </div>
    </div>
  );
}
