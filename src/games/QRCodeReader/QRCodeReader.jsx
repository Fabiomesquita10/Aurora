import React, { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import './QRCodeReader.css'

function QRCodeReader({ qrCodes, day, onWin, onComplete, onGameAttempt }) {
  const [scannedCodes, setScannedCodes] = useState([])
  const [currentMessage, setCurrentMessage] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [gameStatus, setGameStatus] = useState('waiting') // waiting, scanning, won, final-answer
  const [startTime] = useState(Date.now())
  const [uploadedImage, setUploadedImage] = useState(null)
  const [isReadingImage, setIsReadingImage] = useState(false)
  const [finalAnswer, setFinalAnswer] = useState('')
  const [answerError, setAnswerError] = useState('')
  const html5QrCodeRef = useRef(null)
  const scannerRef = useRef(null)
  const fileInputRef = useRef(null)

  // QR codes padrão se não fornecidos
  const defaultQRCodes = [
    { id: 'qr1', code: 'QR_CODE_1', message: '🎉 Primeiro QR encontrado! Continua a procurar!' },
    { id: 'qr2', code: 'QR_CODE_2', message: '🌟 Segundo QR encontrado! Falta mais um!' },
    { id: 'qr3', code: 'QR_CODE_3', message: '🏆 Terceiro QR encontrado! Parabéns, completaste a caça ao tesouro!' }
  ]

  const gameQRCodes = qrCodes || defaultQRCodes

  useEffect(() => {
    return () => {
      // Limpar scanner quando componente desmonta
      // Usar uma função auxiliar para parar de forma segura
      if (html5QrCodeRef.current) {
        // Usar setTimeout para evitar que o erro seja lançado durante o unmount
        setTimeout(() => {
          if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().catch((err) => {
              // Ignorar completamente erros de "not running", "not paused" ou "Cannot stop"
              // Estes são erros esperados quando o scanner não está ativo
              const errorMsg = err?.message || err?.toString() || ''
              if (!errorMsg.includes('not running') && 
                  !errorMsg.includes('not paused') && 
                  !errorMsg.includes('Cannot stop')) {
                // Só logar se for um erro diferente
                console.warn('Erro inesperado ao parar scanner no cleanup:', err)
              }
            })
            // Limpar a referência
            try {
              html5QrCodeRef.current.clear()
            } catch (e) {
              // Ignorar erros ao limpar
            }
          }
        }, 0)
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      setIsScanning(true)
      setGameStatus('scanning')
      
      // Criar instância do scanner
      const html5QrCode = new Html5Qrcode(scannerRef.current.id)
      html5QrCodeRef.current = html5QrCode

      // Iniciar scanner
      await html5QrCode.start(
        { facingMode: "environment" }, // Câmera traseira
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText, decodedResult) => {
          handleQRCodeScanned(decodedText)
        },
        (errorMessage) => {
          // Erros são ignorados (scanner continua)
        }
      )
    } catch (err) {
      console.error('Erro ao iniciar scanner:', err)
      alert('❌ Erro ao aceder à câmera. Verifica as permissões do browser.')
      setIsScanning(false)
      setGameStatus('waiting')
    }
  }

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        // Tentar parar o scanner
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
      } catch (err) {
        // Ignorar completamente erros de "not running", "not paused" ou "Cannot stop"
        // Estes são erros esperados quando o scanner não está ativo
        const errorMsg = err?.message || err?.toString() || ''
        if (!errorMsg.includes('not running') && 
            !errorMsg.includes('not paused') && 
            !errorMsg.includes('Cannot stop')) {
          // Só logar se for um erro diferente
          console.warn('Erro inesperado ao parar scanner:', err)
        }
      }
    }
    setIsScanning(false)
    if (gameStatus === 'scanning') {
      setGameStatus('waiting')
    }
  }

  const handleQRCodeScanned = (scannedText) => {
    // Verificar se já foi escaneado
    if (scannedCodes.some(scanned => scanned.code === scannedText)) {
      // Se já foi escaneado e veio de uma imagem, limpar a imagem
      if (uploadedImage) {
        handleRemoveImage()
      }
      return // Já foi escaneado
    }

    // Procurar o QR code correspondente
    const qrCode = gameQRCodes.find(qr => qr.code === scannedText || qr.id === scannedText)
    
    if (qrCode) {
      // Adicionar à lista de códigos escaneados
      const newScannedCodes = [...scannedCodes, qrCode]
      setScannedCodes(newScannedCodes)
      
      // Mostrar mensagem
      setCurrentMessage(qrCode.message)
      
      // Parar scanner temporariamente para mostrar mensagem (só se estiver a correr)
      if (isScanning) {
        stopScanning()
      }
      
      // Se veio de uma imagem, limpar após mostrar mensagem
      if (uploadedImage) {
        setTimeout(() => {
          handleRemoveImage()
        }, 1000)
      }
      
      // Verificar se todos foram encontrados
      if (newScannedCodes.length === gameQRCodes.length) {
        // Quando encontra o último QR code, pedir a resposta final
        // Não completar o jogo ainda - esperar pela resposta
        setGameStatus('final-answer')
        // Não fechar o modal - deixar aberto para ela escrever a resposta
      }
    } else {
      // QR code não reconhecido
      setCurrentMessage('❌ QR Code não reconhecido! Tenta outro.')
      setTimeout(() => {
        setCurrentMessage(null)
        // Se veio de uma imagem, limpar para tentar outra
        if (uploadedImage) {
          handleRemoveImage()
        }
      }, 2000)
    }
  }

  const handleCloseMessage = () => {
    // Se está no estado final-answer, não fechar o modal
    if (gameStatus === 'final-answer') {
      return // Não fechar - ela precisa escrever a resposta
    }
    
    setCurrentMessage(null)
    // Se ainda não ganhou e não há imagem carregada, continuar a escanear com câmera
    if (gameStatus !== 'won' && scannedCodes.length < gameQRCodes.length && !uploadedImage) {
      startScanning()
    }
  }

  const handleSubmitFinalAnswer = () => {
    // Respostas aceites (case insensitive)
    const correctAnswers = ['mala', 'a mala', 'ir à mala', 'ir a mala', 'a tua mala', 'tua mala']
    const answerLower = finalAnswer.trim().toLowerCase()
    
    if (correctAnswers.includes(answerLower)) {
      // Resposta correta!
      setAnswerError('')
      
      // Fechar o modal primeiro
      setCurrentMessage(null)
      
      // Parar scanner se estiver a correr
      stopScanning()
      
      // Mudar para estado won
      setGameStatus('won')
      
      // Calcular tempo decorrido
      const elapsedTime = Math.round((Date.now() - startTime) / 1000)
      
      // Registar tentativa
      setTimeout(() => {
        if (onGameAttempt && day) {
          onGameAttempt('qr-code', day, {
            won: true,
            attempts: scannedCodes.length,
            errors: 0,
            metadata: {
              timeSeconds: elapsedTime,
              scannedCodes: scannedCodes.map(qr => qr.id),
              finalAnswer: finalAnswer
            }
          })
        }
      }, 100)
      
      if (onWin) {
        setTimeout(() => onWin(scannedCodes.length), 300)
      }
      if (onComplete) {
        setTimeout(() => onComplete(scannedCodes.length, true), 300)
      }
    } else {
      // Resposta incorreta
      setAnswerError('❌ Resposta incorreta! Tenta novamente. 💡 Dica: Onde guardas as tuas coisas quando viajas?')
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      alert('❌ Por favor, seleciona um ficheiro de imagem (JPG, PNG, etc.)')
      return
    }

    // Criar URL da imagem
    const imageUrl = URL.createObjectURL(file)
    setUploadedImage(imageUrl)
    
    // Ler QR code da imagem
    readQRFromImage(file)
  }

  const readQRFromImage = async (file) => {
    console.log('📷 Iniciando leitura de QR code da imagem:', file.name, file.size, 'bytes')
    setIsReadingImage(true)
    
    try {
      // Criar instância do Html5Qrcode se não existir
      // Para upload de imagens, não precisamos do scannerRef renderizado
      if (!html5QrCodeRef.current) {
        console.log('🔧 Criando nova instância do Html5Qrcode')
        
        // Verificar se o scannerRef existe, senão usar um ID fixo
        let scannerId = 'qr-scanner-upload'
        
        if (scannerRef.current && scannerRef.current.id) {
          scannerId = scannerRef.current.id
          console.log('✅ Usando scannerRef existente:', scannerId)
        } else {
          // Criar elemento temporário se não existir
          let tempDiv = document.getElementById(scannerId)
          if (!tempDiv) {
            tempDiv = document.createElement('div')
            tempDiv.id = scannerId
            tempDiv.style.display = 'none'
            tempDiv.style.position = 'absolute'
            tempDiv.style.visibility = 'hidden'
            document.body.appendChild(tempDiv)
            console.log('✅ Criado elemento temporário para scanner:', scannerId)
          }
        }
        
        html5QrCodeRef.current = new Html5Qrcode(scannerId)
        console.log('✅ Instância Html5Qrcode criada com sucesso')
      }

      let decodedText = null
      
      // Primeira tentativa: ler diretamente do ficheiro
      console.log('🔄 Tentativa 1: Lendo QR code diretamente do ficheiro...')
      try {
        decodedText = await html5QrCodeRef.current.scanFile(file, false)
        console.log('✅ Tentativa 1 bem-sucedida! QR code:', decodedText)
      } catch (firstError) {
        console.log('⚠️ Tentativa 1 falhou:', firstError.message)
        console.log('🔄 Tentativa 2: Processando imagem antes de ler...')
        
        // Segunda tentativa: processar a imagem primeiro
        try {
          // Carregar imagem
          const img = new Image()
          const imageUrl = URL.createObjectURL(file)
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              console.log('📐 Dimensões da imagem:', img.width, 'x', img.height)
              resolve()
            }
            img.onerror = reject
            img.src = imageUrl
          })
          
          // Criar canvas para processar
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Redimensionar se muito pequena
          const minSize = 300
          let scale = 1
          if (img.width < minSize || img.height < minSize) {
            scale = Math.max(minSize / img.width, minSize / img.height)
            canvas.width = Math.round(img.width * scale)
            canvas.height = Math.round(img.height * scale)
            console.log(`🔍 Redimensionando imagem: ${img.width}x${img.height} → ${canvas.width}x${canvas.height} (scale: ${scale.toFixed(2)})`)
          } else {
            canvas.width = img.width
            canvas.height = img.height
          }
          
          // Desenhar imagem no canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          console.log('🎨 Imagem desenhada no canvas')
          
          // Converter canvas para blob
          const blob = await new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) {
                console.log('📦 Canvas convertido para blob:', blob.size, 'bytes')
                resolve(blob)
              } else {
                reject(new Error('Erro ao converter canvas para blob'))
              }
            }, file.type || 'image/png')
          })
          
          // Criar novo ficheiro do blob processado
          const processedFile = new File([blob], file.name, { type: file.type || 'image/png' })
          console.log('🔄 Tentando ler QR code do ficheiro processado...')
          
          decodedText = await html5QrCodeRef.current.scanFile(processedFile, false)
          console.log('✅ Tentativa 2 bem-sucedida! QR code:', decodedText)
          
          URL.revokeObjectURL(imageUrl)
        } catch (processError) {
          console.error('❌ Processamento de imagem falhou:', processError)
          // Se o processamento falhar, usar o erro original
          throw firstError
        }
      }
      
      if (decodedText && decodedText.trim()) {
        const trimmedCode = decodedText.trim()
        console.log('✅ QR code lido com sucesso:', trimmedCode)
        setIsReadingImage(false)
        // Processar o QR code escaneado
        handleQRCodeScanned(trimmedCode)
      } else {
        console.error('❌ QR code lido mas vazio')
        throw new Error('QR code não encontrado na imagem')
      }
    } catch (error) {
      console.error('❌ Erro ao ler QR code da imagem:', error)
      console.error('Stack trace:', error.stack)
      setIsReadingImage(false)
      
      // Verificar diferentes tipos de erro
      const errorMessage = error.message || error.toString() || ''
      const errorString = JSON.stringify(error, null, 2)
      
      console.log('📋 Detalhes completos do erro:', {
        message: errorMessage,
        name: error.name,
        string: errorString,
        error: error
      })
      
      if (errorMessage.includes('No QR code found') || 
          errorMessage.includes('QR code não encontrado') ||
          errorMessage.includes('NotFoundException') ||
          errorString.includes('No QR code found') ||
          errorString.includes('NotFoundException')) {
        setCurrentMessage('❌ Não foi possível encontrar um QR code nesta imagem.\n\nVerifica se:\n• A imagem está nítida\n• O QR code está completo e visível\n• A imagem não está muito escura ou desfocada\n• O QR code não está cortado ou distorcido\n\n💡 Dica: Tenta usar a câmera para escanear diretamente!')
        setTimeout(() => {
          setCurrentMessage(null)
        }, 6000)
      } else if (errorMessage.includes('file format') || errorMessage.includes('format')) {
        setCurrentMessage('❌ Formato de imagem não suportado.\n\nPor favor, usa JPG ou PNG.')
        setTimeout(() => {
          setCurrentMessage(null)
        }, 4000)
      } else {
        // Outro tipo de erro - mostrar detalhes
        console.warn('⚠️ Erro desconhecido ao ler QR code:', error)
        setCurrentMessage(`❌ Erro ao processar a imagem.\n\nErro: ${errorMessage}\n\nTenta:\n• Usar uma imagem mais nítida\n• Verificar se o QR code está completo\n• Tentar outra imagem\n• Usar a câmera para escanear diretamente\n• Verificar se o ficheiro não está corrompido\n\n💡 Abre a consola (F12) para mais detalhes.`)
        setTimeout(() => {
          setCurrentMessage(null)
        }, 7000)
      }
    }
  }

  const handleRemoveImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage)
      setUploadedImage(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Garantir que o modal fecha quando o jogo é ganho
  useEffect(() => {
    if (gameStatus === 'won') {
      setCurrentMessage(null)
      // Parar scanner se estiver a correr (usar stopScanning que já trata os erros)
      if (isScanning) {
        stopScanning()
      }
    }
  }, [gameStatus])

  if (gameStatus === 'won') {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000)
    const minutes = Math.floor(elapsedTime / 60)
    const seconds = elapsedTime % 60
    const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
    
    return (
      <div className="qr-reader-container">
        <div className="qr-reader-result">
          <h2>🎉 Parabéns!</h2>
          <p className="result-text">Encontraste todos os QR codes e descobriste o destino final!</p>
          <div className="result-stats">
            <p>QR codes encontrados: {scannedCodes.length}/{gameQRCodes.length}</p>
            <p>Tempo: {timeDisplay}</p>
            {finalAnswer && <p>Resposta final: {finalAnswer}</p>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="qr-reader-container">
      <div className="qr-reader-header">
        <h2>📱 Caça ao Tesouro - QR Codes</h2>
        <p className="qr-reader-subtitle">
          Encontra e escaneia os 3 QR codes escondidos!
        </p>
        <div className="qr-reader-progress">
          <p>QR codes encontrados: {scannedCodes.length}/{gameQRCodes.length}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(scannedCodes.length / gameQRCodes.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {!isScanning && gameStatus === 'waiting' && !uploadedImage && (
        <div className="qr-reader-start">
          <button className="qr-start-button" onClick={startScanning}>
            🎥 Iniciar Scanner (Câmera)
          </button>
          <p className="qr-hint">Permite acesso à câmera quando solicitado</p>
          
          <div className="qr-upload-divider">
            <span>ou</span>
          </div>
          
          <div className="qr-upload-section">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="qr-image-upload"
            />
            <label htmlFor="qr-image-upload" className="qr-upload-button">
              📷 Carregar Imagem com QR Code
            </label>
            <p className="qr-hint">Seleciona uma foto que contenha um QR code</p>
          </div>
        </div>
      )}

      {uploadedImage && (
        <div className="qr-image-preview">
          <div className="qr-image-container">
            <img src={uploadedImage} alt="QR Code" className="qr-uploaded-image" />
            {isReadingImage && (
              <div className="qr-reading-overlay">
                <div className="qr-loading-spinner"></div>
                <p>A ler QR code...</p>
              </div>
            )}
          </div>
          <div className="qr-image-actions">
            <button className="qr-remove-button" onClick={handleRemoveImage}>
              ❌ Remover Imagem
            </button>
            <label htmlFor="qr-image-upload" className="qr-upload-button">
              📷 Carregar Outra Imagem
            </label>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="qr-reader-scanning">
          <div className="qr-scanner-container">
            <div id="qr-scanner" ref={scannerRef} className="qr-scanner"></div>
          </div>
          <button className="qr-stop-button" onClick={stopScanning}>
            ⏸️ Parar Scanner
          </button>
          <p className="qr-scanning-hint">Aponta a câmera para o QR code</p>
        </div>
      )}

      {currentMessage && (
        <div className="qr-message-overlay" onClick={gameStatus === 'final-answer' ? undefined : handleCloseMessage}>
          <div className="qr-message-box" onClick={(e) => e.stopPropagation()}>
            <h3>{currentMessage}</h3>
            
            {gameStatus === 'final-answer' ? (
              <div className="qr-final-answer-section">
                <p className="qr-final-question">
                  🎯 Onde é que o caixeiro te levou?<br/>
                  <small>Escreve a resposta final:</small>
                </p>
                <input
                  type="text"
                  className="qr-answer-input"
                  value={finalAnswer}
                  onChange={(e) => {
                    setFinalAnswer(e.target.value)
                    setAnswerError('')
                  }}
                  placeholder="Ex: mala, a mala, ir à mala..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmitFinalAnswer()
                    }
                  }}
                  autoFocus
                />
                {answerError && (
                  <p className="qr-answer-error">{answerError}</p>
                )}
                <button className="qr-message-close" onClick={handleSubmitFinalAnswer}>
                  ✅ Confirmar Resposta
                </button>
              </div>
            ) : (
              <button className="qr-message-close" onClick={handleCloseMessage}>
                Continuar
              </button>
            )}
          </div>
        </div>
      )}

      {scannedCodes.length > 0 && (
        <div className="qr-scanned-list">
          <h3>QR Codes Encontrados:</h3>
          <ul>
            {scannedCodes.map((qr, index) => (
              <li key={qr.id}>
                ✓ {index + 1}. {qr.message || `QR Code ${index + 1}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default QRCodeReader

