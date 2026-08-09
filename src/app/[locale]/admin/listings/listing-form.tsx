'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/i18n/config';

type ProjectOpt = { id: string; name: string };
type Photo = { storage_path: string; public_url: string; is_primary?: boolean };

export function ListingForm({ locale, projects }: { locale: Locale; projects: ProjectOpt[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [projectId, setProjectId] = useState(projects[0]?.id ?? '');
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [propertyType, setPropertyType] = useState('chalet');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [areaSqm, setAreaSqm] = useState('110');
  const [floor, setFloor] = useState('');
  const [viewKind, setViewKind] = useState<string>('');
  const [price, setPrice] = useState('');
  const [finishing, setFinishing] = useState('fully');
  const [deliveryStatus, setDeliveryStatus] = useState('ready');
  const [rentalPeriod, setRentalPeriod] = useState('monthly');
  const [furnished, setFurnished] = useState(false);
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [amenitiesText, setAmenitiesText] = useState('pool, beach, security, parking');
  const [videoUrl, setVideoUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);

  async function onFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('file', f));
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? json.error ?? 'Upload failed');
      setPhotos((prev) => [...prev, ...json.files.map((f: Photo, i: number) => ({
        storage_path: f.storage_path,
        public_url: f.public_url,
        is_primary: prev.length === 0 && i === 0
      }))]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx).map((p, i) => ({ ...p, is_primary: i === 0 })));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!projectId) { setError('Pick a project'); return; }
    if (!price) { setError('Price is required'); return; }
    start(async () => {
      const body = {
        project_id: projectId,
        listing_type: listingType,
        status,
        property_type: propertyType,
        bedrooms: bedrooms ? Number(bedrooms) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        area_sqm: areaSqm ? Number(areaSqm) : null,
        floor: floor ? Number(floor) : null,
        view_kind: viewKind || null,
        price: Number(price),
        currency: 'EGP',
        finishing: listingType === 'sale' ? finishing : null,
        delivery_status: listingType === 'sale' ? deliveryStatus : null,
        rental_period: listingType === 'rent' ? rentalPeriod : null,
        furnished: listingType === 'rent' ? furnished : null,
        title_en: titleEn || null,
        title_ar: titleAr || null,
        description_en: descEn || null,
        description_ar: descAr || null,
        amenities: amenitiesText.split(',').map((s) => s.trim()).filter(Boolean),
        video_url: videoUrl || null,
        featured,
        verified: true,
        photos: photos.map((p, i) => ({
          storage_path: p.storage_path,
          public_url: p.public_url,
          sort_order: i,
          is_primary: i === 0
        }))
      };
      const res = await fetch('/api/admin/listings', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok) { setError(json?.error?.message ?? JSON.stringify(json.error)); return; }
      router.push(`/${locale}/admin/listings`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6" dir="ltr">
      {/* MAIN column */}
      <div className="space-y-6">
        <Card title="Basics">
          <Row>
            <Field label="Project">
              <select required value={projectId} onChange={(e) => setProjectId(e.target.value)} className="input">
                <option value="">—</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Listing type">
              <select value={listingType} onChange={(e) => setListingType(e.target.value as 'sale' | 'rent')} className="input">
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
              </select>
            </Field>
            <Field label="Property type">
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="input">
                {['chalet','villa','townhouse','twin_house','penthouse','duplex','apartment','studio'].map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </Field>
          </Row>
          <Row>
            <Field label="Bedrooms"><input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="input" /></Field>
            <Field label="Bathrooms"><input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="input" /></Field>
            <Field label="Area (sqm)"><input type="number" value={areaSqm} onChange={(e) => setAreaSqm(e.target.value)} className="input" /></Field>
            <Field label="Floor"><input type="number" value={floor} onChange={(e) => setFloor(e.target.value)} className="input" /></Field>
          </Row>
          <Row>
            <Field label="View">
              <select value={viewKind} onChange={(e) => setViewKind(e.target.value)} className="input">
                <option value="">—</option>
                {['sea','pool','lagoon','golf','garden','side'].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
          </Row>
        </Card>

        <Card title="Titles & description">
          <Row>
            <Field label="Title (English)"><input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="input" placeholder="2BR Chalet with sea view" /></Field>
            <Field label="Title (Arabic)"><input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} className="input" placeholder="شاليه غرفتين بإطلالة بحر" dir="rtl" /></Field>
          </Row>
          <Field label="Description (English)"><textarea rows={4} value={descEn} onChange={(e) => setDescEn(e.target.value)} className="input" /></Field>
          <Field label="Description (Arabic)"><textarea rows={4} value={descAr} onChange={(e) => setDescAr(e.target.value)} className="input" dir="rtl" /></Field>
          <Field label="Amenities (comma separated)"><input value={amenitiesText} onChange={(e) => setAmenitiesText(e.target.value)} className="input" /></Field>
        </Card>

        <Card title="Commercials">
          <Row>
            <Field label="Price (EGP)"><input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="input" placeholder="6500000" /></Field>
            {listingType === 'sale' ? (
              <>
                <Field label="Finishing">
                  <select value={finishing} onChange={(e) => setFinishing(e.target.value)} className="input">
                    <option value="fully">fully</option><option value="semi">semi</option><option value="core_shell">core & shell</option>
                  </select>
                </Field>
                <Field label="Delivery">
                  <select value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)} className="input">
                    <option value="ready">ready</option><option value="under_construction">under construction</option>
                  </select>
                </Field>
              </>
            ) : (
              <>
                <Field label="Rental period">
                  <select value={rentalPeriod} onChange={(e) => setRentalPeriod(e.target.value)} className="input">
                    {['daily','weekly','monthly','seasonal','annual'].map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </Field>
                <Field label="Furnished">
                  <select value={String(furnished)} onChange={(e) => setFurnished(e.target.value === 'true')} className="input">
                    <option value="true">Yes</option><option value="false">No</option>
                  </select>
                </Field>
              </>
            )}
          </Row>
        </Card>

        <Card title="Media">
          <Field label="Photos (JPG/PNG/WebP, up to 10 MB each)">
            <input type="file" multiple accept="image/*" onChange={onFilesPicked} className="block text-sm" />
            {uploading && <div className="text-xs text-slate-500 mt-2">Uploading…</div>}
          </Field>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
              {photos.map((p, i) => (
                <div key={p.storage_path} className="relative aspect-square rounded overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.public_url} alt="" className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute top-1 left-1 bg-stella-700 text-white text-[10px] px-1.5 py-0.5 rounded">Cover</span>}
                  <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-white/90 rounded-full w-6 h-6 text-xs">✕</button>
                </div>
              ))}
            </div>
          )}
          <Field label="Video URL (YouTube)">
            <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="input" placeholder="https://youtu.be/... or https://youtube.com/watch?v=..." />
          </Field>
        </Card>
      </div>

      {/* SIDEBAR — publish controls */}
      <aside className="space-y-4 lg:sticky lg:top-6 h-fit">
        <Card title="Publish">
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')} className="input">
              <option value="published">Published (live now)</option>
              <option value="draft">Draft</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured on home
          </label>
          {error && <div className="rounded bg-red-50 border border-red-200 text-red-800 p-2 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={pending || uploading}
            className="w-full rounded-md bg-stella-700 hover:bg-stella-800 text-white py-2 font-semibold disabled:opacity-40"
          >
            {pending ? 'Saving…' : 'Save listing'}
          </button>
        </Card>
      </aside>

      <style jsx>{`
        .input { width: 100%; border: 1px solid rgb(226 232 240); border-radius: 6px; padding: 8px 10px; font-size: 14px; background: white; }
        .input:focus { outline: 2px solid rgb(14 99 201); outline-offset: 1px; }
      `}</style>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-white p-5 space-y-4">
      <div className="font-semibold text-slate-900">{title}</div>
      {children}
    </section>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}
