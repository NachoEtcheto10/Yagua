import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Servicios de Neon que usa la tienda: Postgres (siempre), almacenamiento de imágenes y realtime
  preview: {
    realtime: true,
  },
  auth: false,
  buckets: {
    // Fotos de productos, banners y logos: lectura pública (se muestran en la tienda)
    assets: { access: "public_read" },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (!branch.exists) {
      // New non-default branches: auto-expire
      // Run `neon checkout <name>` to create a new branch with these settings
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});
