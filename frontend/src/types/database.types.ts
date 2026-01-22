export interface Database {
    public: {
        Tables: {
            tickets: {
                Row: {
                    id: string
                    created_at: string
                    description: string
                    category: 'Técnico' | 'Facturación' | 'Comercial'
                    sentiment: 'Positivo' | 'Neutral' | 'Negativo'
                    processed: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    description: string
                    category: 'Técnico' | 'Facturación' | 'Comercial'
                    sentiment: 'Positivo' | 'Neutral' | 'Negativo'
                    processed?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    description?: string
                    category?: 'Técnico' | 'Facturación' | 'Comercial'
                    sentiment?: 'Positivo' | 'Neutral' | 'Negativo'
                    processed?: boolean
                }
            }
        }
    }
}
