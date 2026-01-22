import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

// Cargar variables de entorno sin prefijo VITE_
dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true
    },
    define: {
        // Expone a la app las variables sin prefijo usando las claves VITE_ que exige Vite
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY),
        'import.meta.env.VITE_API_URL': JSON.stringify(process.env.API_URL),
        'import.meta.env.VITE_N8N_WEBHOOK_URL': JSON.stringify(process.env.N8N_WEBHOOK_URL),
    }
})
