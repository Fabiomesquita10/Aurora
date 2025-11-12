# Checklist Pré-Deploy - Aurora Advent Calendar

## ✅ Funcionalidades Prontas

- [x] Build funciona sem erros
- [x] 27 jogos implementados e funcionais
- [x] 25 dias configurados no calendário
- [x] Sistema de login e autenticação
- [x] Sistema de pontos dinâmico
- [x] Loja funcional
- [x] Backups automáticos
- [x] Persistência de dados (localStorage + JSON)
- [x] QR codes (3 ficheiros presentes)
- [x] Músicas (5 ficheiros presentes)
- [x] Foto do puzzle presente
- [x] Foto do PhotoTrivia presente

## ⚠️ Problemas a Corrigir ANTES do Uso

### 1. Quiz (Dia 5) - URGENTE
**Problema**: Todas as 5 perguntas são idênticas ("Onde foi?") com a mesma resposta.

**Solução**: 
- Editar `src/config/calendar-config.json` (dia 5, linha ~234-284)
- Substituir por 5 perguntas personalizadas sobre o vosso relacionamento
- Exemplos de perguntas que podem ser usadas:
  - "Qual foi o nosso primeiro encontro?"
  - "Onde nos conhecemos?"
  - "Qual é a nossa música favorita?"
  - "Qual é o nosso restaurante favorito?"
  - "Qual foi a nossa primeira viagem juntos?"

### 2. PhotoTrivia (Dia 20) - IMPORTANTE
**Problema**: As 3 fotos apontam para a mesma imagem (`photo_1.JPG`), mas têm respostas diferentes ("fatima", "geres", "algarve").

**Soluções possíveis**:
- **Opção A (Recomendada)**: Adicionar 2 fotos adicionais:
  - Criar `photo_2.JPG` e `photo_3.JPG` na pasta `src/games/PhotoTrivia/photos/`
  - Atualizar o config para apontar para as fotos corretas
- **Opção B**: Se só há uma foto, ajustar para que todas as 3 perguntas usem a mesma foto com a mesma resposta

### 3. Puzzle (Dia 15) - CORRIGIDO ✅
**Problema**: Path da imagem usa `.jpg` mas o ficheiro é `.JPG`
**Status**: ✅ Corrigido - path atualizado para `.JPG`

## 📝 Observações (Não Críticas)

1. **Aviso de eval no BombWire**: Não é crítico, mas pode ser melhorado no futuro
2. **Tamanho do bundle (728KB)**: Funciona bem, mas pode ser otimizado depois com code splitting
3. **Frase do Wordle**: Configurada como "O TEU CORAÇÃO É LINDO E MEU TODO DIA" - verificar se está correto

## 🚀 Próximos Passos

1. **Personalizar Quiz (Dia 5)**: Adicionar perguntas reais sobre o casal
2. **PhotoTrivia (Dia 20)**: Adicionar 2 fotos adicionais OU ajustar configuração
3. **Testar todos os jogos**: Fazer um teste completo de todos os 25 dias
4. **Verificar palavras do Wordle**: Confirmar que todas as palavras estão corretas
5. **Testar em produção**: Fazer build e testar localmente antes do deploy

## 📋 Verificação Final

Antes de considerar o site "pronto para a prenda":

- [ ] Quiz personalizado com perguntas reais
- [ ] PhotoTrivia com 3 fotos diferentes (ou config ajustado)
- [ ] Testar todos os 25 dias
- [ ] Verificar que todas as palavras do Wordle estão corretas
- [ ] Verificar que todas as respostas dos jogos estão corretas
- [ ] Testar login e criação de perfil
- [ ] Testar sistema de pontos e loja
- [ ] Testar backups automáticos
- [ ] Verificar QR codes (imprimir e testar scan)
- [ ] Testar músicas (verificar que tocam corretamente)
- [ ] Testar em diferentes navegadores
- [ ] Verificar responsividade (mobile/tablet/desktop)

## 🎁 Status Atual

**Pronto para uso?**: ⚠️ **Quase** - Falta apenas personalizar o Quiz e PhotoTrivia

O site está funcional e técnicamente pronto, mas precisa de conteúdo personalizado nos jogos mencionados acima para uma experiência completa e significativa.

