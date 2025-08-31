// config/bins.ts

// A interface que descreve a estrutura de cada emissor
interface Issuer {
  bins: number[]
  rules: {
    minLength: number
    maxLength: number
    type: 'numeric' | 'alphanumeric'
  }
}

// O objeto de configuração
const binsConfig = {
  itau: {
    bins: [474538, 403247, 550209],
    rules: { minLength: 4, maxLength: 4, type: 'numeric' },
  },
  santander: {
    bins: [515590, 517756],
    rules: { minLength: 6, maxLength: 6, type: 'numeric' },
  },
  // ✅ Usamos 'satisfies' para validar o tipo sem perder as chaves específicas
} satisfies Record<string, Issuer>

export default binsConfig

/**
 * Tipagem para inferência estática em toda a aplicação.
 */
declare module '@adonisjs/core/types' {
  // ✅ No AdonisJS v6, a interface correta para estender é 'Config'
  export interface Config {
    bins: typeof binsConfig
  }
}