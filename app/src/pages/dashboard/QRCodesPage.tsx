import { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { QrCode, RefreshCw, Copy, Printer, Instagram, Download, AlertCircle } from 'lucide-react';
import { useDashLang } from '@/context/DashLangContext';

const BACKEND = 'http://localhost:5000';

interface QRCodeItem {
  id: number;
  table_number: number;
  qr_url: string;
  qr_image_url: string;
}

/** Stable image URL — adds cache-bust only when forced refresh */
function makeImgUrl(qr: QRCodeItem, bust?: number): string {
  const base = qr.qr_image_url.startsWith('http')
    ? qr.qr_image_url
    : `${BACKEND}${qr.qr_image_url}`;
  return bust ? `${base}?t=${bust}` : base;
}

export default function QRCodesPage() {
  const { t } = useDashLang();
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tableCount, setTableCount] = useState(15);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [printTarget, setPrintTarget] = useState<QRCodeItem | null>(null);
  const [imgBust, setImgBust] = useState(0); // only updated after generation
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [qrRes, profileRes] = await Promise.all([api.getQRCodes(), api.getRestaurantProfile()]);
      // Backend now returns sorted by table_number ASC
      if (qrRes?.success) setQrCodes(qrRes.data || []);
      if (profileRes?.success) {
        setRestaurant(profileRes.data);
        setTableCount(profileRes.data.table_count || 15);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const baseUrl = `${window.location.origin}/r/${restaurant?.slug || 'demo-restaurant'}`;
      const response = await api.generateQRCodes({ table_count: tableCount, base_url: baseUrl });
      if (response?.success) {
        toast.success(`✅ Generated ${response.data?.length || 0} QR codes`);
        // Force fresh images after generation
        setImgBust(Date.now());
        await loadData();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUrl = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('URL copied!');
  };

  const handleDownload = async (qr: QRCodeItem) => {
    try {
      const url = makeImgUrl(qr, imgBust || undefined);
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = qr.table_number === 0 ? 'qr-general.png' : `qr-table-${qr.table_number}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      toast.error('Download failed');
    }
  };

  const handlePrint = (qr: QRCodeItem) => {
    setPrintTarget(qr);
    setTimeout(() => window.print(), 300);
  };

  const logoSrc = restaurant?.logo_url
    ? (restaurant.logo_url.startsWith('http') ? restaurant.logo_url : `${BACKEND}${restaurant.logo_url}`)
    : null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-amber-500" />
      </div>
    );
  }

  return (
    <>
      {/* ── PRINT TEMPLATE (hidden on screen, visible only when printing) ── */}
      {printTarget && (
        <div
          ref={printRef}
          className="hidden print:flex print:flex-col print:items-center print:justify-center print:min-h-screen print:p-10 print:bg-white print:font-sans"
        >
          {logoSrc && (
            <img src={logoSrc} alt="Logo" className="print:w-24 print:h-24 print:object-contain print:mb-4 print:rounded-xl" />
          )}
          <h1 className="print:text-4xl print:font-bold print:text-center print:mb-2 print:tracking-tight">
            {restaurant?.name || 'Restaurant'}
          </h1>
          {restaurant?.phone && (
            <p className="print:text-sm print:text-gray-500 print:mb-6">📞 {restaurant.phone}</p>
          )}
          <div className="print:border-4 print:border-gray-900 print:rounded-2xl print:p-3 print:mb-5">
            <img src={makeImgUrl(printTarget, imgBust || undefined)} alt="QR Code" className="print:w-64 print:h-64" />
          </div>
          <div className="print:bg-gray-900 print:text-white print:rounded-xl print:px-10 print:py-3 print:mb-5">
            <p className="print:text-2xl print:font-bold print:text-center">
              {printTarget.table_number === 0 ? '📋 General Menu' : `🪑 Table ${printTarget.table_number}`}
            </p>
          </div>
          <p className="print:text-sm print:text-gray-400 print:text-center print:mb-4">
            Scan with your phone camera to order
          </p>
          {restaurant?.instagram_handle && (
            <p className="print:text-sm print:text-gray-500">📷 @{restaurant.instagram_handle}</p>
          )}
        </div>
      )}

      {/* ── SCREEN UI ── */}
      <div className="space-y-6 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.qrCodesTitle}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.generateHint}
            </p>
          </div>
        </div>

        {/* Generate Section */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">{t.generateQR}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">{t.numberOfTables}</label>
              <input
                type="number"
                value={tableCount}
                onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
                className="h-10 w-32 px-3 rounded-md border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                min={1}
                max={200}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? t.generating : t.generateAll}
            </Button>

            {/* Instagram field */}
            <div className="ml-auto">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                <Instagram className="w-3 h-3" /> Instagram handle (shown on print)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="yourhandle"
                  defaultValue={restaurant?.instagram_handle || ''}
                  id="instagram-input"
                  className="h-10 w-44 px-3 rounded-md border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                />
                <button
                  onClick={async () => {
                    const val = (document.getElementById('instagram-input') as HTMLInputElement)?.value;
                    await api.updateRestaurantProfile({ instagram_handle: val });
                    setRestaurant((p: any) => ({ ...p, instagram_handle: val }));
                    toast.success('Saved!');
                  }}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-xs font-medium"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Grid — sorted by table_number from backend */}
        {qrCodes.length > 0 ? (
          <>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {qrCodes.length} QR codes — General Menu (Table 0) first, then Table 1 to {qrCodes.length - 1}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {qrCodes.map((qr) => (
                <Card key={qr.id} className="border-0 shadow-sm dark:bg-gray-800 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    {/* QR Image */}
                    <div className="w-full aspect-square bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-3 overflow-hidden border border-gray-100 dark:border-gray-600">
                      {qr.qr_image_url ? (
                        <img
                          key={`${qr.id}-${imgBust}`}  // re-mount on new generation
                          src={makeImgUrl(qr, imgBust || undefined)}
                          alt={qr.table_number === 0 ? 'General Menu QR' : `Table ${qr.table_number} QR`}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            // Show fallback icon if image fails to load
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style');
                          }}
                        />
                      ) : null}
                      <AlertCircle
                        className="w-10 h-10 text-gray-300 dark:text-gray-600"
                        style={{ display: qr.qr_image_url ? 'none' : undefined }}
                      />
                    </div>

                    {/* Label */}
                    <p className="text-sm font-semibold dark:text-white mb-0.5">
                      {qr.table_number === 0 ? `📋 ${t.general}` : `${t.table} ${qr.table_number}`}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <button
                        onClick={() => copyUrl(qr.qr_url)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title={t.copyUrl}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(qr)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title={t.download}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrint(qr)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title={t.print}
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            <QrCode className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">{t.noQRYet}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-4">
              {t.generateHint}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
