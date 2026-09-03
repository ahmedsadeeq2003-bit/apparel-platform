"use client";

import { useEffect, useRef, useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";
import { useDesignEditor } from "@/hooks/useDesignEditor";
import { useIsDesktopViewport } from "@/hooks/useIsDesktopViewport";
import { useEditorStore } from "@/lib/editor/store";
import { useCartStore } from "@/lib/editor/cart";
import { saveDesign } from "@/lib/editor/actions";
import { getGarmentPhoto, hasGarmentPhoto } from "@/lib/products/garmentPhoto";
import type { InitialEditorContent } from "@/lib/editor/initialContent";
import { TopBar } from "./TopBar";
import { LeftToolbar } from "./LeftToolbar";
import { ToolPanel } from "./ToolPanel";
import { RightPanel } from "./RightPanel";
import { DesignCanvas } from "./DesignCanvas";
import { CanvasControls } from "./CanvasControls";
import { AddToCartDialog } from "./AddToCartDialog";
import type { Product, ProductColor } from "@/lib/products/queries";
import type { DesignTemplate, TemplateCategory } from "@/lib/templates/queries";

export function EditorShell({
  product,
  initialColor,
  templateGroups,
  initialContent,
  initialDesignId,
  initialDesignName,
}: {
  product: Product;
  initialColor: ProductColor;
  templateGroups: { category: TemplateCategory; templates: DesignTemplate[] }[];
  initialContent: InitialEditorContent;
  /** Set once this session is resuming a saved design (from `?designId=`)
   * or after the first successful save of a brand-new one -- see
   * handleSave. Present means "Save" updates this row; absent means it
   * inserts a new one. */
  initialDesignId: string | null;
  initialDesignName: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editor = useDesignEditor(canvasRef, initialContent);
  const isDesktop = useIsDesktopViewport();
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [designName, setDesignName] = useState(initialDesignName ?? `My ${product.name}`);
  const [designId, setDesignId] = useState(initialDesignId);
  const [showAddToCart, setShowAddToCart] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const side = useEditorStore((s) => s.side);
  const activeTool = useEditorStore((s) => s.activeTool);
  const previewMode = useEditorStore((s) => s.previewMode);
  const zoom = useEditorStore((s) => s.zoom);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const isDirty = useEditorStore((s) => s.isDirty);
  // Subscribing to these triggers a re-render whenever the imperative Fabric
  // canvas mutates; the values themselves aren't read directly here because
  // getActiveObjectProps()/getLayers() below re-derive straight from the
  // canvas each render instead of duplicating that state into React.
  useEditorStore((s) => s.canvasVersion);
  useEditorStore((s) => s.selectedObjectIds);

  const activeObject = editor.getActiveObjectProps();
  const layers = editor.getLayers();

  const garmentPhoto = getGarmentPhoto(product.slug, selectedColor.name, side);
  const canShowBack = hasGarmentPhoto(product.slug, selectedColor.name, "back");

  const handleColorChange = (color: ProductColor) => {
    setSelectedColor(color);
    // Only Black has a real back photo -- switching to a color with none
    // while already viewing "back" would otherwise leave the customer
    // designing against a photo that doesn't match their selection.
    if (side === "back" && !hasGarmentPhoto(product.slug, color.name, "back")) {
      editor.toggleSide();
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = document.activeElement;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (editor.isEditingText()) return;

      const mod = e.ctrlKey || e.metaKey;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        editor.deleteSelected();
      } else if (mod && e.key.toLowerCase() === "z" && e.shiftKey) {
        e.preventDefault();
        editor.redo();
      } else if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        editor.undo();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        editor.duplicateSelected();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- editor's methods read live refs/store, safe to bind once
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!editor.hydrationError) return;
    setFeedback(editor.hydrationError);
    editor.clearHydrationError();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clearHydrationError is a stable setState wrapper; only hydrationError's value should re-trigger this
  }, [editor.hydrationError]);

  const handleSave = async () => {
    if (editor.isHydrating) return;
    setIsSaving(true);
    const state = editor.exportState();
    const result = await saveDesign({
      designId: designId ?? undefined,
      productId: product.id,
      productColorId: selectedColor.id,
      name: designName,
      frontCanvasJson: state.front,
      backCanvasJson: state.back,
    });
    setIsSaving(false);
    if ("error" in result) {
      setFeedback(result.error);
      return;
    }
    useEditorStore.getState().markClean();
    setFeedback("Design saved");
    // First save of a brand-new design: this editor session now IS that
    // design going forward -- subsequent saves update it instead of
    // inserting another row. window.history.replaceState (not a Next.js
    // router navigation) so the URL bar reflects it without re-running the
    // page's Server Component or remounting this component/losing canvas
    // state -- purely cosmetic, no navigation actually happens.
    if (!designId) {
      setDesignId(result.id);
      const params = new URLSearchParams({ product: product.slug, color: selectedColor.id, designId: result.id });
      window.history.replaceState(null, "", `/editor/new?${params.toString()}`);
    }
  };

  const handleConfirmAddToCart = (size: string, quantity: number) => {
    if (editor.isHydrating) return;
    const state = editor.exportState();
    useCartStore.getState().addItem({
      productId: product.id,
      productName: product.name,
      productColorId: selectedColor.id,
      productColorName: selectedColor.name,
      productColorHex: selectedColor.hex,
      size,
      quantity,
      frontCanvasJson: state.front,
      backCanvasJson: state.back,
    });
    setShowAddToCart(false);
    setFeedback("Added to cart");
  };

  const handleApplyTemplate = (template: DesignTemplate) => {
    editor.applyTemplate(template);
    useEditorStore.getState().setActiveTool(null);
  };

  const handleApplyGeneratedTemplate = (path: string) => {
    editor
      .applyGeneratedTemplate(path)
      .then(() => useEditorStore.getState().setActiveTool(null))
      .catch(() => setFeedback("Couldn't load that template"));
  };

  const handleInsertSvgAsset = (path: string) => {
    editor.insertSvgAsset(path).catch(() => setFeedback("Couldn't load that artwork"));
  };

  const panelContent = activeTool && (
    <ToolPanel
      activeTool={activeTool}
      templateGroups={templateGroups}
      onApplyTemplate={handleApplyTemplate}
      onApplyGeneratedTemplate={handleApplyGeneratedTemplate}
      onInsertArtwork={editor.insertArtwork}
      onInsertSvgAsset={handleInsertSvgAsset}
      onUpload={(file) => editor.addImageFromFile(file)}
      onClose={() => useEditorStore.getState().setActiveTool(null)}
    />
  );

  const rightPanelContent = (
    <RightPanel
      activeObject={activeObject}
      layers={layers}
      onUpdate={(props) => activeObject && editor.updateProps(activeObject.id, props)}
      onDuplicate={editor.duplicateSelected}
      onDelete={editor.deleteSelected}
      onDeleteLayer={editor.deleteObjectById}
      onSelectLayer={editor.selectLayer}
      onToggleVisible={editor.setObjectVisibility}
      onReorder={editor.reorderLayer}
    />
  );

  return (
    <div className="theme-editorial flex h-dvh flex-col bg-background text-foreground">
      <TopBar
        designName={designName}
        onDesignNameChange={setDesignName}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={editor.undo}
        onRedo={editor.redo}
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        previewMode={previewMode}
        onTogglePreview={() => useEditorStore.getState().setPreviewMode(!previewMode)}
        onAddToCart={() => setShowAddToCart(true)}
      />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {!previewMode && (
          <LeftToolbar
            activeTool={activeTool}
            onSelectTool={(tool) => useEditorStore.getState().setActiveTool(tool)}
            onAddText={editor.addText}
          />
        )}

        {!previewMode && isDesktop && panelContent && (
          <div className="border-r border-border">{panelContent}</div>
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-3 px-4 pt-4 md:px-6">
              <h1 className="truncate text-body-sm font-medium text-muted">
                {previewMode ? "Preview" : product.name}
              </h1>
              <div className="flex gap-2">
                {product.product_colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    aria-label={`Switch to ${color.name}`}
                    aria-pressed={color.id === selectedColor.id}
                    className={`h-6 w-6 rounded-full border-2 transition-colors ${
                      color.id === selectedColor.id ? "border-accent" : "border-border"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
            <div
              className={
                previewMode
                  ? "pointer-events-none relative flex flex-1 flex-col"
                  : "relative flex flex-1 flex-col"
              }
            >
              <DesignCanvas
                canvasRef={canvasRef}
                photo={garmentPhoto}
                side={side}
                label={`${product.name}, ${selectedColor.name}, ${side}`}
                zoom={zoom}
                showGuide={!previewMode}
              />
              {(!editor.isReady || editor.isHydrating) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/85 backdrop-blur-sm">
                  <CircleNotch size={16} className="animate-spin text-muted" aria-hidden />
                  <span className="text-body-sm font-medium text-muted">Loading your design...</span>
                </div>
              )}
            </div>
          </div>
          <CanvasControls
            side={side}
            onSetSide={(value) => (value !== side ? editor.toggleSide() : undefined)}
            canShowBack={canShowBack}
            zoom={zoom}
            onSetZoom={(value) => useEditorStore.getState().setZoom(value)}
          />
        </div>

        {!previewMode && isDesktop && rightPanelContent}
      </div>

      {!previewMode && !isDesktop && panelContent && (
        <div className="fixed inset-x-0 bottom-0 z-40 max-h-[70vh] rounded-t-lg border-t border-border bg-background shadow-[0_-8px_30px_rgba(27,24,21,0.12)]">
          {panelContent}
        </div>
      )}
      {!previewMode && !isDesktop && !panelContent && activeObject && (
        <div className="fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-lg border-t border-border bg-background shadow-[0_-8px_30px_rgba(27,24,21,0.12)]">
          {rightPanelContent}
        </div>
      )}

      {showAddToCart && (
        <AddToCartDialog
          productColorName={`${product.name} · ${selectedColor.name}`}
          onConfirm={handleConfirmAddToCart}
          onClose={() => setShowAddToCart(false)}
        />
      )}

      {feedback && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-5 py-2.5 text-body-sm font-medium text-background shadow-lg">
          {feedback}
        </div>
      )}
    </div>
  );
}
