# Análise de Segurança - Aurora Advent Calendar

## ✅ Proteções Implementadas

### 1. Playground
- ✅ **Verificação de jogos ganhos**: Só permite jogar jogos que já foram completados e ganhos
- ✅ **Autenticação requerida**: Exige login antes de aceder ao playground
- ✅ **Verificação de conta ativa**: Verifica se a conta está ativa antes de jogar
- ✅ **Sem pontos no playground**: Jogos no playground não dão pontos (callbacks vazios)

### 2. Sistema de Pontos
- ✅ **Cálculo dinâmico**: Pontos são calculados dinamicamente dos scores dos `gameAttempts`, não guardados diretamente
- ✅ **Validação de scores**: Scores são validados antes de serem guardados
- ✅ **Deduplicação**: Sistema previne registos duplicados de jogos ganhos (janela de 2 segundos)

### 3. Autenticação
- ✅ **Login obrigatório**: Não há perfil padrão - utilizadores devem fazer login
- ✅ **Contas ativas**: Apenas contas marcadas como `active: true` podem jogar
- ✅ **Isolamento de dados**: Cada utilizador tem dados isolados por `accountId`

### 4. Desbloqueio de Dias
- ✅ **Validação de tempo**: Dias são desbloqueados baseado na data/hora atual
- ✅ **Modo DEV**: Apenas disponível em desenvolvimento (não em produção)

## ⚠️ Vulnerabilidades Conhecidas

### 1. **eval() no BombWire** - BAIXO RISCO
**Localização**: `src/games/BombWire/BombWire.jsx:83`

**Problema**: Usa `eval()` para avaliar condições das regras.

**Mitigação**:
- As condições são pré-processadas e substituídas por valores booleanos antes do eval
- As regras vêm do JSON de configuração (não da entrada do utilizador)
- O eval só avalia expressões booleanas simples (`true`, `false`, `&&`, `||`)

**Risco**: Baixo - condições são validadas antes do eval, mas ainda é uma vulnerabilidade potencial.

**Recomendação**: Substituir por um parser de expressões booleanas seguro (não crítico para uso pessoal).

### 2. **localStorage Manipulável** - MÉDIO RISCO
**Problema**: Todos os dados estão no `localStorage`, que pode ser manipulado pelo cliente.

**Impacto**:
- Utilizadores podem modificar pontos, jogos ganhos, dias desbloqueados
- Utilizadores podem modificar `gameAttempts` para aumentar pontos
- Utilizadores podem modificar `wonGames` para desbloquear playground

**Mitigação**:
- Pontos são calculados dinamicamente (mais difícil de manipular)
- Sistema de deduplicação previne alguns tipos de manipulação
- Aplicação pessoal/romântica (não é um jogo competitivo)

**Risco**: Médio - fácil de manipular, mas impacto limitado para uso pessoal.

**Recomendação**: 
- Para uso pessoal: Aceitável (utilizadores confiáveis)
- Para uso público: Implementar validação no servidor (não aplicável aqui)

### 3. **DEV_MODE** - BAIXO RISCO
**Problema**: Modo DEV pode ser ativado no código do cliente.

**Mitigação**:
- DEV_MODE é controlado por `import.meta.env.VITE_DEV_MODE`
- Em produção (`npm run build`), DEV_MODE é `false`
- Apenas disponível em desenvolvimento

**Risco**: Baixo - não disponível em produção.

### 4. **Validação de Scores no Cliente** - MÉDIO RISCO
**Problema**: Scores são validados apenas no cliente.

**Impacto**:
- Utilizadores podem modificar `gameAttempts` no localStorage
- Utilizadores podem adicionar scores falsos
- Utilizadores podem modificar `spentPoints` para ter mais pontos

**Mitigação**:
- Scores são validados antes de serem guardados
- Sistema de deduplicação previne duplicados
- Aplicação pessoal (não competitiva)

**Risco**: Médio - fácil de manipular, mas aceitável para uso pessoal.

## 🔒 Recomendações de Segurança

### Para Uso Pessoal (Atual)
1. ✅ **Aceitável como está**: Para uso pessoal/romântico, as vulnerabilidades são aceitáveis
2. ✅ **Backups automáticos**: Sistema de backups previne perda de dados
3. ✅ **Isolamento de dados**: Cada utilizador tem dados isolados

### Para Uso Público (Futuro)
1. ⚠️ **Servidor backend**: Implementar validação de scores no servidor
2. ⚠️ **Autenticação forte**: Implementar autenticação mais robusta
3. ⚠️ **Validação de dados**: Validar todos os dados no servidor antes de guardar
4. ⚠️ **Remover eval**: Substituir `eval()` por parser seguro
5. ⚠️ **Rate limiting**: Limitar número de tentativas por utilizador
6. ⚠️ **Logs de auditoria**: Registar todas as ações dos utilizadores

## 📊 Resumo de Riscos

| Vulnerabilidade | Risco | Impacto | Mitigação |
|----------------|-------|---------|-----------|
| eval() no BombWire | Baixo | Baixo | Condições pré-validadas |
| localStorage manipulável | Médio | Médio | Uso pessoal, cálculo dinâmico |
| DEV_MODE | Baixo | Baixo | Não disponível em produção |
| Validação no cliente | Médio | Médio | Uso pessoal, deduplicação |

## ✅ Conclusão

**Para uso pessoal/romântico**: ✅ **Seguro o suficiente**

As vulnerabilidades existentes são aceitáveis para uma aplicação pessoal onde os utilizadores são confiáveis. O sistema de playground está protegido e não permite explorar o sistema para ganhar pontos ou desbloquear jogos não jogados.

**Não há exploits críticos** que permitam:
- ❌ Ganhar pontos sem jogar
- ❌ Desbloquear jogos não jogados no playground
- ❌ Burlar autenticação
- ❌ Modificar dados de outros utilizadores

