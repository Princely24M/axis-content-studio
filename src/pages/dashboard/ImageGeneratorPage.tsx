import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon, Download, Save, RefreshCw, Check, Loader2,
  AlertCircle, Sparkles, Wand2, Copy, Eye, Trash2, ChevronDown,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { generateImages, type ImageGenInput, type GeneratedImage, type ImageGenResult } from '@/lib/ai';
import { saveGeneration, saveToSavedContent } from '@/components/DashboardLayout';
import { copyToClipboard } from '@/lib/utils';

const styles = ['Photorealistic', 'Cinematic', '3D', 'Illustration', 'Digital art', 'Minimalist', 'Product photography', 'Anime'];
const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:2', '3:4', '2:3'];
const qualities = ['Standard', 'High', 'Ultra'];
const loadingStages = ['Understanding your prompt...', 'Generating your image...', 'Finalizing...'];

function aspectClass(ratio: string): string {
  switch (ratio) {
    case '16:9': return 'aspect-video';
    case '9:16': return 'aspect-[9/16]';
    case '4:3': return 'aspect-[4/3]';
    case '3:2': return 'aspect-[3/2]';
    case '3:4': return 'aspect-[3/4]';
    case '2:3': return 'aspect-[2/3]';
    default: return 'aspect-square';
  }
}

export function ImageGeneratorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState<ImageGenInput>({ prompt: '', style: 'Photorealistic', aspectRatio: '1:1', quality: 'High', count: 1 });
  const [result, setResult] = useState<ImageGenResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!loading) return;
    setStage(0);
    const first = window.setTimeout(() => setStage(1), 1400);
    const second = window.setTimeout(() => setStage(2), 5000);
    return () => { window.clearTimeout(first); window.clearTimeout(second); };
  }, [loading]);

  const handleGenerate = async () => {
    if (loading) return;
    if (!input.prompt.trim()) {
      setError('Please enter an image description.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    setLoadedImages(new Set());
    setFailedImages(new Set());
    setShowPrompt(false);

    try {
      const generation = await generateImages(input);
      setResult(generation);
      if (user) {
        await saveGeneration(
          user.id,
          'image',
          input.prompt,
          input as unknown as Record<string, unknown>,
          generation.optimizedPrompt,
          generation.images.map((image) => image.url),
          undefined,
          undefined,
          {
            optimizedPrompt: generation.optimizedPrompt,
            generationSpec: generation.spec,
            modelUsed: generation.model,
            generationStatus: 'success',
          }
        );
      }
    } catch (generationError) {
      const message = generationError instanceof Error ? generationError.message : 'Image generation failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (image: GeneratedImage, index: number) => {
    if (!user) return;
    const { error: saveError } = await saveToSavedContent(user.id, 'image', `Image: ${input.prompt}`, image.url, [image.url], {
      originalPrompt: input.prompt,
      optimizedPrompt: result?.optimizedPrompt || '',
      model: result?.model || '',
      aspectRatio: input.aspectRatio,
    });
    if (saveError) {
      toast('Failed to save image.', 'error');
      return;
    }
    setSavedIds((previous) => new Set(previous).add(index));
    toast('Image saved to your library.');
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `axis-image-${Date.now()}.jpg`;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast('The image could not be downloaded.', 'error');
    }
  };

  const handleCopyPrompt = async (prompt: string, label: string) => {
    if (await copyToClipboard(prompt)) toast(`${label} copied.`);
    else toast('Could not copy the prompt.', 'error');
  };

  const removeImage = (index: number) => {
    if (!result) return;
    const images = result.images.filter((_, imageIndex) => imageIndex !== index);
    setResult(images.length ? { ...result, images } : null);
  };

  const markLoaded = (index: number) => setLoadedImages((previous) => new Set(previous).add(index));
  const markFailed = (index: number) => setFailedImages((previous) => new Set(previous).add(index));

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-accent-500" /> Image Generator
        </h1>
        <p className="mt-1 text-ink-600 dark:text-ink-300">Describe exactly what you want and keep control of every visual detail.</p>
      </div>

      <div className="grid lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)] gap-6 items-start">
        <Card>
          <h2 className="text-lg font-semibold text-ink-900 dark:text-white mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="image-prompt">Image description / Prompt</label>
              <textarea
                id="image-prompt"
                value={input.prompt}
                onChange={(event) => setInput({ ...input, prompt: event.target.value })}
                rows={6}
                disabled={loading}
                placeholder="e.g. Three red apples on a wooden table, photographed from above"
                className="input resize-y"
              />
              <p className="mt-1.5 text-xs text-ink-400">Named objects, quantities, colors, positions, lighting, and exclusions are preserved.</p>
            </div>

            <Select label="Visual style" value={input.style} onChange={(value) => setInput({ ...input, style: value })} options={styles.map((style) => ({ value: style, label: style }))} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Aspect ratio" value={input.aspectRatio} onChange={(value) => setInput({ ...input, aspectRatio: value })} options={aspectRatios.map((ratio) => ({ value: ratio, label: ratio }))} />
              <Select label="Quality" value={input.quality} onChange={(value) => setInput({ ...input, quality: value })} options={qualities.map((quality) => ({ value: quality, label: quality }))} />
            </div>
            <div>
              <label className="label" htmlFor="image-count">Number of images: {input.count}</label>
              <input id="image-count" type="range" min={1} max={4} value={input.count} disabled={loading} onChange={(event) => setInput({ ...input, count: Number(event.target.value) })} className="w-full accent-brand-500" />
            </div>

            {error && <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm"><AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span>{error}</span></div>}
            <Button onClick={handleGenerate} loading={loading} className="w-full" size="lg">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {loadingStages[stage]}</> : <><Sparkles className="w-4 h-4" /> Generate Image</>}
            </Button>
          </div>
        </Card>

        <Card className="min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Generated Images</h2>
              {result && <p className="text-xs text-ink-400 mt-1">Model: {result.model} · {input.aspectRatio}</p>}
            </div>
            {result && <Button variant="ghost" size="sm" onClick={() => setShowPrompt((visible) => !visible)}><Eye className="w-3.5 h-3.5" /> Enhanced prompt <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPrompt ? 'rotate-180' : ''}`} /></Button>}
          </div>

          <AnimatePresence initial={false}>
            {showPrompt && result && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                <div className="rounded-xl bg-ink-100/70 dark:bg-ink-800/60 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Original prompt</p><button onClick={() => handleCopyPrompt(result.originalPrompt, 'Original prompt')} className="text-ink-400 hover:text-brand-500"><Copy className="w-4 h-4" /></button></div>
                  <p className="text-sm text-ink-700 dark:text-ink-200 whitespace-pre-wrap break-words">{result.originalPrompt}</p>
                  <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Enhanced prompt sent to model</p><button onClick={() => handleCopyPrompt(result.optimizedPrompt, 'Enhanced prompt')} className="text-ink-400 hover:text-brand-500"><Copy className="w-4 h-4" /></button></div>
                  <p className="text-sm text-ink-700 dark:text-ink-200 whitespace-pre-wrap break-words">{result.optimizedPrompt}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="space-y-4">
              <div className={`skeleton rounded-xl ${aspectClass(input.aspectRatio)} flex flex-col items-center justify-center gap-3`}><Loader2 className="w-7 h-7 text-ink-300 dark:text-ink-600 animate-spin" /><span className="text-sm text-ink-400">{loadingStages[stage]}</span></div>
            </div>
          ) : result?.images.length ? (
            <>
              <div className={`grid gap-4 ${result.images.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                {result.images.map((image, index) => (
                  <motion.div key={`${image.url}-${index}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="group relative rounded-xl overflow-hidden border border-ink-200/30 dark:border-ink-700/30 bg-ink-100 dark:bg-ink-900">
                    {!loadedImages.has(index) && !failedImages.has(index) && <div className={`absolute inset-0 skeleton flex items-center justify-center ${aspectClass(input.aspectRatio)}`}><Loader2 className="w-6 h-6 text-ink-300 dark:text-ink-600 animate-spin" /></div>}
                    {failedImages.has(index) ? <div className={`flex flex-col items-center justify-center gap-2 p-6 text-center ${aspectClass(input.aspectRatio)}`}><AlertCircle className="w-7 h-7 text-rose-500" /><p className="text-sm text-ink-500">This image could not be loaded.</p></div> : <img src={image.url} alt={image.prompt} onLoad={() => markLoaded(index)} onError={() => markFailed(index)} className={`w-full ${aspectClass(input.aspectRatio)} object-contain transition-opacity duration-300 ${loadedImages.has(index) ? 'opacity-100' : 'opacity-0'}`} />}
                    {loadedImages.has(index) && <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3"><div className="flex gap-2"><button onClick={() => handleDownload(image.url)} className="p-2 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30" title="Download"><Download className="w-4 h-4" /></button><button onClick={() => handleSave(image, index)} className="p-2 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30" title="Save">{savedIds.has(index) ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}</button></div><button onClick={() => removeImage(index)} className="p-2 rounded-lg bg-rose-500/70 text-white hover:bg-rose-500" title="Delete"><Trash2 className="w-4 h-4" /></button></div>}
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-ink-200/30 dark:border-ink-700/30"><Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}><Wand2 className="w-3.5 h-3.5" /> Create Variation</Button><Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}><RefreshCw className="w-3.5 h-3.5" /> Regenerate</Button></div>
            </>
          ) : <div className="flex flex-col items-center justify-center text-center py-16"><ImageIcon className="w-12 h-12 text-ink-200 dark:text-ink-700 mb-3" /><p className="text-ink-500 dark:text-ink-400">Describe an image and click Generate to create visuals.</p></div>}
        </Card>
      </div>
    </div>
  );
}
