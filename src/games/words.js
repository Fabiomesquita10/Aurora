// Lista de palavras-alvo românticas (usadas como palavras secretas)
export const targetWords = [
  'AMOR',
  'SONHO',
  'BEIJO',
  'OLHAR',
  'TOCAR',
  'QUENTE',
  'DOCE',
  'PAIXAO',
  'GENTIL',
  'FELIZ',
  'UNIDO',
  'ABRACO',
  'DOCURA',
  'CUIDA',
  'ABRIGO',
  'CARINO',
  'AMIGO',
  'DOCIL',
  'TENRO',
  'TERNO',
  'CALOR',
  'SUAVE',
  'LINDO',
  'QUERO',
  'AMADA',
  'AMADO'
]
  .map(word => word.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  .filter(word => word.length === 5)
  .filter((word, index, self) => self.indexOf(word) === index)

// Lista de palavras válidas para validação
let validWordsSet = new Set()
let wordsLoaded = false
let wordsLoading = false

// Carregar palavras do repositório Wordle do GitHub
export const loadWordsFromGitHub = async () => {
  if (wordsLoaded || wordsLoading) return
  
  wordsLoading = true
  
  try {
    // Carregar lista de palavras de 5 letras em português do repositório Wordle
    const response = await fetch(
      'https://raw.githubusercontent.com/Hugo0/wordle/main/webapp/data/languages/pt/pt_5words.txt'
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const text = await response.text()
    const words = text
      .split('\n')
      .map(word => word.trim())
      .filter(word => word.length === 5)
      .map(word => word.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
      .filter(word => word.match(/^[A-Z]{5}$/)) // Apenas letras maiúsculas, 5 caracteres
    
    // Criar Set para pesquisa rápida
    words.forEach(word => validWordsSet.add(word))
    wordsLoaded = true
    
    console.log(`Carregadas ${validWordsSet.size} palavras válidas do repositório Wordle`)
  } catch (error) {
    console.error('Erro ao carregar palavras do GitHub:', error)
    // Se falhar, usar lista básica de palavras comuns
    const commonWords = [
      'AMOR', 'SONHO', 'BEIJO', 'OLHAR', 'TOCAR', 'QUENTE', 'DOCE', 'PAIXAO',
      'GENTIL', 'FELIZ', 'UNIDO', 'ABRACO', 'DOCURA', 'CUIDA', 'ABRIGO', 'CARINO',
      'AMIGO', 'DOCIL', 'TENRO', 'TERNO', 'CALOR', 'SUAVE', 'LINDO', 'QUERO',
      'AMADA', 'AMADO', 'COMER', 'BEBER', 'DORMIR', 'CORPO', 'MENTE', 'CANTO',
      'MUSICA', 'DANCA', 'LER', 'LIDOS', 'LIDAR', 'JOGAR', 'RIR', 'FALAR',
      'OUVIR', 'VER', 'SENTIR', 'PENSAR', 'LUTAR', 'VENCER', 'PERDER', 'GANHAR',
      'PARTIR', 'FICAR', 'IR', 'VIR', 'DAR', 'TER', 'FAZER', 'DIZER',
      'SABER', 'QUERER', 'PODER', 'DEVER', 'SER', 'ESTAR', 'HAVER', 'ABRIR',
      'FECHAR', 'ENTRAR', 'SAIR', 'ANDAR', 'CORRER', 'PARAR', 'ESPERAR', 'BUSCAR',
      'ENCONTRAR', 'ACHAR', 'OLHAR', 'ESCUTAR', 'APALPAR', 'CHEIRAR', 'PROVAR',
      'ACORDAR', 'SONHAR', 'APRENDER', 'ENSINAR', 'ESTUDAR', 'TRABALHAR', 'BRINCAR',
      'CANTAR', 'ESCREVER', 'DESENHAR', 'PINTAR', 'COZINHAR', 'LIMPAR', 'LAVAR',
      'COMPRAR', 'VENDER', 'PAGAR', 'GASTAR', 'GUARDAR', 'PROCURAR', 'PEGAR',
      'SOLTAR', 'ATIRAR', 'ACERTAR', 'ERRAR', 'TENTAR', 'CONSEGUIR', 'MUDAR',
      'CRIAR', 'CONSTRUIR', 'DESTRUIR', 'QUEBRAR', 'CONSERTAR', 'USAR', 'COLOCAR',
      'TIRAR', 'SEGURAR', 'LIBERTAR', 'DEIXAR', 'PERMITIR', 'IMPEDIR', 'EVITAR',
      'FUGIR', 'SEGUIR', 'SEPARAR', 'DIVIDIR', 'UNIR', 'JUNTAR', 'CONECTAR',
      'LIGAR', 'DESLIGAR', 'INICIAR', 'CONTINUAR', 'PAUSAR', 'ACELERAR', 'DIMINUIR',
      'AUMENTAR', 'CRESCER', 'REDUZIR', 'EXPANDIR', 'DOBRAR', 'ESTICAR', 'RELAR',
      'DESCANSAR', 'IMAGINAR', 'DESEJAR', 'TORCER', 'REZAR', 'PEDIR', 'SUPLICAR',
      'EXIGIR', 'ORDENAR', 'MANDAR', 'OBEDECER', 'RESPEITAR', 'HONRAR', 'ADMIRAR',
      'DESPREZAR', 'ODIAR', 'AMAR', 'GOSTAR', 'DETESTAR'
    ]
      .map(word => word.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
      .filter(word => word.length === 5)
    
    commonWords.forEach(word => validWordsSet.add(word))
    wordsLoaded = true
    
    console.warn(`Usando lista básica de ${validWordsSet.size} palavras devido a erro no carregamento`)
  } finally {
    wordsLoading = false
  }
}

// Inicializar palavras
export const initializeWords = async (callback) => {
  await loadWordsFromGitHub()
  callback(wordsLoaded)
}

// Verificar se uma palavra é válida
export const isValidWord = (word) => {
  if (!wordsLoaded) return false
  
  const normalizedWord = word.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  // Verificar se tem exatamente 5 letras
  if (!normalizedWord.match(/^[A-Z]{5}$/)) {
    return false
  }
  
  return validWordsSet.has(normalizedWord)
}
