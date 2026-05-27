import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Palette, Eye, Save, Check, Smartphone, Monitor, Tablet, Sparkles, Layout, Type } from 'lucide-react';
import { THEME_PRESETS, type ThemePreset } from '@/data/ThemePresets';
import ImageUpload from '@/components/ImageUpload';
import { useDashLang } from '@/context/DashLangContext';

const FONT_OPTIONS = ['Inter','Georgia','Playfair Display','Poppins','Roboto','Open Sans','Lato','Montserrat','Noto Sans Arabic'];
const BUTTON_STYLES = [{ key: 'rounded', label: 'Rounded' },{ key: 'pill', label: 'Pill' },{ key: 'rounded-lg', label: 'Large' },{ key: 'square', label: 'Square' }];
const CARD_STYLES = [{ key: 'shadow', label: 'Shadow' },{ key: 'bordered', label: 'Bordered' },{ key: 'shadow-lg', label: 'Deep' },{ key: 'flat', label: 'Flat' }];
const IMAGE_SHAPES = [{ key: 'rounded', label: 'Rounded' },{ key: 'rounded-lg', label: 'Large' },{ key: 'circle', label: 'Circle' },{ key: 'square', label: 'Square' }];
const CATEGORY_STYLES = [{ key: 'pills', label: 'Pills' },{ key: 'tabs', label: 'Tabs' },{ key: 'chips', label: 'Chips' },{ key: 'simple', label: 'Simple' }];
const HEADER_STYLES = [{ key: 'gradient', label: 'Gradient' },{ key: 'solid', label: 'Solid' },{ key: 'glass', label: 'Glass' }];
const LAYOUT_MODES = [{ key: 'list', label: 'List' },{ key: 'grid', label: 'Grid' },{ key: 'compact', label: 'Compact' }];
const SECTIONS = [
  { key: 'cover', label: 'Cover Image' },{ key: 'welcome', label: 'Welcome Text' },
  { key: 'popular_items', label: 'Popular Items' },{ key: 'categories', label: 'Categories' },
  { key: 'full_menu', label: 'Full Menu' },{ key: 'contact', label: 'Contact Info' },
];

export default function DesignEditor() {
  const { t, lang } = useDashLang();
  const L = (en: string, fr: string, ar: string, tr: string) =>
    ({ en, fr, ar, tr }[lang] ?? en);
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile'|'tablet'|'desktop'>('mobile');
  const [restaurant, setRestaurant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'themes'|'colors'|'typography'|'layout'|'content'|'sections'>('themes');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [designRes, profileRes] = await Promise.all([api.getDesign(), api.getRestaurantProfile()]);
      if (designRes?.success) setSettings(designRes.data.settings_json || {});
      if (profileRes?.success) setRestaurant(profileRes.data);
    } catch (e: any) { toast.error(e.message); }
    finally { setIsLoading(false); }
  };

  const set = (key: string, val: any) => setSettings((p: any) => ({ ...p, [key]: val }));

  const applyTheme = (t: ThemePreset) => {
    setSettings((p: any) => ({
      ...p,
      template: t.key,
      primaryColor: t.primaryColor,
      accentColor: t.accentColor,
      backgroundColor: t.backgroundColor,
      textColor: t.textColor,
      font: t.font,
      buttonStyle: t.buttonStyle,
      cardStyle: t.cardStyle,
      imageShape: t.imageShape,
      categoryStyle: t.categoryStyle,
      headerStyle: t.headerStyle,
      layoutMode: t.layoutMode,
      showAnimations: t.showAnimations,
    }));
    toast.success(`✨ ${t.name} theme applied`);
  };

  const toggleSection = (key: string) => setSettings((p: any) => {
    const sections = p.sections || [];
    const updated = sections.map((s: any) => s.type === key ? { ...s, enabled: !s.enabled } : s);
    if (!updated.find((s: any) => s.type === key)) updated.push({ type: key, enabled: true });
    return { ...p, sections: updated };
  });

  const isSectionEnabled = (key: string) => {
    const s = (settings.sections || []).find((s: any) => s.type === key);
    return s ? s.enabled !== false : true;
  };

  const save = async (publish = false) => {
    publish ? setIsPublishing(true) : setIsSaving(true);
    try {
      const payload = { settings_json: settings, template_key: settings.template || 'modern' };
      publish ? await api.publishDesign(payload) : await api.saveDesignDraft(payload);
      toast.success(publish ? 'Design published!' : 'Draft saved');
    } catch (e: any) { toast.error(e.message); }
    finally { publish ? setIsPublishing(false) : setIsSaving(false); }
  };

  const bg = settings.backgroundColor || '#FFFFFF';
  const txt = settings.textColor || '#111827';
  const primary = settings.primaryColor || '#F59E0B';
  const font = settings.font || 'Inter';

  const getPreviewWidth = () => ({ mobile: 'w-[360px]', tablet: 'w-[600px]', desktop: 'w-full' }[previewDevice]);
  const getBtnClass = () => ({ pill: 'rounded-full', 'rounded-lg': 'rounded-lg', square: 'rounded-none', rounded: 'rounded' }[settings.buttonStyle as string] || 'rounded');
  const getImgClass = () => ({ circle: 'rounded-full', 'rounded-lg': 'rounded-xl', square: 'rounded-none' }[settings.imageShape as string] || 'rounded-lg');

  const tabs = [
    { key: 'themes',     label: L('Themes','Thèmes','قوالب','Temalar'),           icon: Sparkles },
    { key: 'colors',     label: L('Colors','Couleurs','الألوان','Renkler'),        icon: Palette },
    { key: 'typography', label: L('Fonts','Polices','الخطوط','Yazı Tipleri'),      icon: Type },
    { key: 'layout',     label: L('Layout','Mise en page','التخطيط','Düzen'),     icon: Layout },
    { key: 'content',    label: L('Content','Contenu','المحتوى','İçerik'),        icon: Eye },
    { key: 'sections',   label: L('Sections','Sections','الأقسام','Bölümler'),   icon: Check },
  ];

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-amber-500" /></div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.design} Editor</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{L('Customize how your menu looks to customers', 'Personnalisez l\'apparence de votre menu', 'خصّص مظهر قائمتك للعملاء', 'Menünüzün görünümünü özelleştirin')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => save(false)} disabled={isSaving} variant="outline" className="dark:border-gray-600 dark:text-gray-200">
            <Save className="w-4 h-4 mr-2" />{isSaving ? t.saving : t.save + ' Draft'}
          </Button>
          <Button onClick={() => save(true)} disabled={isPublishing} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Check className="w-4 h-4 mr-2" />{isPublishing ? t.saving : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-3">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 justify-center ${
                  activeTab === key ? 'bg-white dark:bg-gray-700 shadow-sm text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}>
                <Icon className="w-3 h-3" />{label}
              </button>
            ))}
          </div>

          {/* THEMES TAB */}
          {activeTab === 'themes' && (
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm dark:text-white">Choose a Theme</CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">One click to transform your entire menu</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {THEME_PRESETS.map((t) => (
                    <button key={t.key} onClick={() => applyTheme(t)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] ${
                        settings.template === t.key ? 'border-amber-500 ring-2 ring-amber-200 dark:ring-amber-800' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                      }`}>
                      {/* Theme preview swatch */}
                      <div className="h-20 relative" style={{ backgroundColor: t.backgroundColor }}>
                        {/* Simulated menu cards */}
                        <div className="absolute inset-x-3 top-3 bottom-3 space-y-1">
                          <div className="h-2.5 rounded" style={{ backgroundColor: t.primaryColor, width: '60%' }} />
                          <div className="h-1.5 rounded opacity-40" style={{ backgroundColor: t.textColor, width: '80%' }} />
                          <div className="flex gap-1 mt-1">
                            {[1,2].map(i => (
                              <div key={i} className="flex-1 h-7 rounded" style={{ backgroundColor: `${t.primaryColor}25` }}>
                                <div className="m-1 h-1.5 rounded" style={{ backgroundColor: t.primaryColor }} />
                              </div>
                            ))}
                          </div>
                        </div>
                        {settings.template === t.key && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="px-2 py-1.5 bg-white dark:bg-gray-700 text-left">
                        <p className="text-xs font-semibold dark:text-white">{t.emoji} {t.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{t.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* COLORS TAB */}
          {activeTab === 'colors' && (
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="pt-4 space-y-3">
                {[
                  { key: 'primaryColor', label: 'Primary Color' },
                  { key: 'accentColor', label: 'Accent Color' },
                  { key: 'backgroundColor', label: 'Background' },
                  { key: 'textColor', label: 'Text Color' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-sm dark:text-gray-300">{label}</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings[key] || '#000000'}
                        onChange={(e) => set(key, e.target.value)}
                        className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-16">{settings[key] || '#000000'}</span>
                    </div>
                  </div>
                ))}

                {/* Color Palettes - Quick pick */}
                <div className="pt-2 border-t dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick palettes</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ['#F59E0B','#FCD34D','#0F0F0F','#F9FAFB'],
                      ['#10B981','#6EE7B7','#F0FDF4','#064E3B'],
                      ['#8B5CF6','#C4B5FD','#1E1B4B','#EDE9FE'],
                      ['#DC2626','#FCA5A5','#FFF8F0','#1C1917'],
                      ['#0EA5E9','#7DD3FC','#F0F9FF','#0C4A6E'],
                      ['#EC4899','#FBCFE8','#FFF1F2','#831843'],
                    ].map((palette, i) => (
                      <button key={i} onClick={() => setSettings((p: any) => ({
                        ...p, primaryColor: palette[0], accentColor: palette[1],
                        backgroundColor: palette[2], textColor: palette[3]
                      }))} className="flex rounded-lg overflow-hidden border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500">
                        {palette.map((c, j) => <div key={j} className="w-5 h-7" style={{ backgroundColor: c }} />)}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TYPOGRAPHY TAB */}
          {activeTab === 'typography' && (
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="pt-4 space-y-4">
                <div>
                  <Label className="text-sm dark:text-gray-300 mb-1.5 block">{t.description?.replace('Description','Font Family') || 'Font Family'}</Label>
                  <select value={font} onChange={(e) => set('font', e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm dark:text-gray-200">
                    {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                {/* Font preview */}
                <div className="rounded-xl border dark:border-gray-700 p-4" style={{ fontFamily: font }}>
                  <p className="font-bold text-lg dark:text-white">Menu Title</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Item description text preview</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: primary }}>650 DA</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* LAYOUT TAB */}
          {activeTab === 'layout' && (
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="pt-4 space-y-4">
                {[
                  { label: 'Layout Mode', key: 'layoutMode', options: LAYOUT_MODES },
                  { label: 'Header Style', key: 'headerStyle', options: HEADER_STYLES },
                  { label: 'Button Style', key: 'buttonStyle', options: BUTTON_STYLES },
                  { label: 'Card Style', key: 'cardStyle', options: CARD_STYLES },
                  { label: 'Image Shape', key: 'imageShape', options: IMAGE_SHAPES },
                  { label: 'Category Style', key: 'categoryStyle', options: CATEGORY_STYLES },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">{label}</Label>
                    <div className="flex flex-wrap gap-2">
                      {options.map((o) => (
                        <button key={o.key} onClick={() => set(key, o.key)}
                          className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                            settings[key] === o.key ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                          }`}>{o.label}</button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Animations toggle */}
                <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium dark:text-gray-200">Scroll Animations</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Items fade in when scrolling</p>
                  </div>
                  <button onClick={() => set('showAnimations', !settings.showAnimations)}
                    className={`w-11 h-6 rounded-full transition-all ${settings.showAnimations ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow mx-1 transition-transform ${settings.showAnimations ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="pt-4 space-y-4">
                <div>
                  <Label className="text-xs dark:text-gray-300">Welcome Text</Label>
                  <textarea value={settings.welcomeText || ''} onChange={(e) => set('welcomeText', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm dark:text-gray-200 resize-none" rows={2} />
                </div>
                <div>
                  <Label className="text-xs dark:text-gray-300">Offer Banner</Label>
                  <input type="text" value={settings.offerBanner || ''} onChange={(e) => set('offerBanner', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm dark:text-gray-200"
                    placeholder="e.g. Free delivery today!" />
                </div>
                <div>
                  <Label className="text-xs dark:text-gray-300 mb-2 block">{t.coverImage}</Label>
                  <ImageUpload value={restaurant?.cover_image_url} uploadType="cover" aspectRatio="wide"
                    onChange={async (url) => {
                      await api.updateRestaurantProfile({ cover_image_url: url });
                      setRestaurant((p: any) => ({ ...p, cover_image_url: url }));
                    }} />
                </div>
                <div>
                  <Label className="text-xs dark:text-gray-300 mb-2 block">{t.logo}</Label>
                  <ImageUpload value={restaurant?.logo_url} uploadType="logo" aspectRatio="square"
                    onChange={async (url) => {
                      await api.updateRestaurantProfile({ logo_url: url });
                      setRestaurant((p: any) => ({ ...p, logo_url: url }));
                    }} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* SECTIONS TAB */}
          {activeTab === 'sections' && (
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {SECTIONS.map((s) => (
                    <label key={s.key} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input type="checkbox" checked={isSectionEnabled(s.key)} onChange={() => toggleSection(s.key)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500" />
                      <span className="text-sm dark:text-gray-200">{s.label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-sm sticky top-4 dark:bg-gray-800">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 dark:text-white">
                <Eye className="w-4 h-4 text-amber-500" /> Live Preview
              </CardTitle>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                {[{k:'mobile',I:Smartphone},{k:'tablet',I:Tablet},{k:'desktop',I:Monitor}].map(({k,I}) => (
                  <button key={k} onClick={() => setPreviewDevice(k as any)}
                    className={`p-1.5 rounded-md transition-colors ${previewDevice===k ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}>
                    <I className="w-4 h-4 dark:text-gray-300" />
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center bg-gray-100 dark:bg-gray-900 rounded-xl p-4 overflow-auto min-h-[500px]">
                <div className={`${getPreviewWidth()} bg-white rounded-2xl overflow-hidden shadow-lg`}
                  style={{ backgroundColor: bg, color: txt, fontFamily: font, minHeight: 480 }}>

                  {/* Cover */}
                  <div className="h-28 relative" style={{
                    background: settings.headerStyle === 'gradient'
                      ? `linear-gradient(135deg, ${primary}, ${settings.accentColor || primary}88)`
                      : settings.headerStyle === 'glass'
                      ? `${primary}20`
                      : primary
                  }}>
                    {restaurant?.cover_image_url && (
                      <img src={restaurant.cover_image_url.startsWith('http') ? restaurant.cover_image_url : `http://localhost:5000${restaurant.cover_image_url}`}
                        alt="" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>

                  <div className="p-4 -mt-8 relative z-10">
                    {restaurant?.logo_url && (
                      <img src={restaurant.logo_url.startsWith('http') ? restaurant.logo_url : `http://localhost:5000${restaurant.logo_url}`}
                        alt="" className="w-14 h-14 object-cover border-2 mb-2" style={{ borderColor: bg, borderRadius: settings.imageShape === 'circle' ? '50%' : 8 }} />
                    )}
                    <h3 className="font-bold text-base">{restaurant?.name || 'Your Restaurant'}</h3>
                    {settings.welcomeText && <p className="text-xs opacity-70 mt-1">{settings.welcomeText}</p>}
                    {settings.offerBanner && (
                      <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium text-center" style={{ backgroundColor: `${primary}20`, color: primary }}>
                        {settings.offerBanner}
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
                    {['All','Starters','Mains','Drinks'].map((cat, i) => {
                      const active = i === 1;
                      return (
                        <span key={cat} className={`px-3 py-1 text-xs whitespace-nowrap ${
                          settings.categoryStyle === 'tabs' ? `border-b-2 ${active?'border-current font-medium':'border-transparent opacity-50'}` :
                          settings.categoryStyle === 'simple' ? (active?'font-bold':'opacity-50') :
                          `rounded-full ${active?'text-white':'opacity-60'}`
                        }`} style={active ? { backgroundColor: settings.categoryStyle==='simple'||settings.categoryStyle==='tabs' ? 'transparent' : primary, color: settings.categoryStyle==='simple'||settings.categoryStyle==='tabs' ? primary : 'white' } : {}}>
                          {cat}
                        </span>
                      );
                    })}
                  </div>

                  {/* Items */}
                  <div className={`px-4 pb-4 ${settings.layoutMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}`}>
                    {[{ name: 'Classic Burger', price: 650 },{ name: 'Pepperoni Pizza', price: 780 },{ name: 'Caesar Salad', price: 420 }].map(item => (
                      <div key={item.name} className={`flex gap-2 p-2 rounded-xl ${
                        settings.cardStyle === 'shadow-lg' ? 'shadow-lg bg-white' :
                        settings.cardStyle === 'bordered' ? 'border' :
                        settings.cardStyle === 'flat' ? '' : 'shadow-sm bg-white'
                      }`} style={{ borderColor: `${txt}15`, backgroundColor: settings.cardStyle==='flat' ? `${txt}05` : undefined }}>
                        <div className={`w-14 h-14 bg-gray-200 flex-shrink-0 ${getImgClass()}`} />
                        <div className="flex-1">
                          <p className="text-xs font-semibold truncate">{item.name}</p>
                          <p className="text-[10px] opacity-60">Freshly prepared</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-bold" style={{ color: primary }}>{item.price} DA</span>
                            <div className={`w-6 h-6 flex items-center justify-center ${getBtnClass()}`} style={{ backgroundColor: primary }}>
                              <span className="text-white text-xs">+</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
