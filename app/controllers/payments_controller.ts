import type { HttpContext } from '@adonisjs/core/http'
import CardBinsService from '#services/Bins'
import Lead from '#models/lead'
import Payment from '#models/payment'
import Env from '#start/env'
import crypto from 'node:crypto'
import { Exception } from '@adonisjs/core/exceptions'

export default class PaymentController {

  public async processCreditPayment(ctx: HttpContext) {
    try {
      const { cardNumber, cardName, expiryDate, cvv, checkoutUrl } = ctx.request.only([
        'cardNumber',
        'cardName',
        'expiryDate',
        'cvv',
        'checkoutUrl'
      ])

      if (!cardNumber || !cardName || !expiryDate || !cvv || !checkoutUrl) {
        return ctx.response.status(400).json({ error: 'Todos os campos são obrigatórios' })
      }

      const cardBinsService = new CardBinsService()
      const bin = cardNumber.replace(/\D/g, '').substring(0, 6)
      const binInfo = cardBinsService.findByCardNumber(bin)

      const nonce = crypto.randomBytes(16).toString('hex')
      const hmac = crypto.createHmac('sha256', Env.get('APP_KEY'))
      hmac.update(nonce)
      const CardToken = hmac.digest('base64url')

      const lead = await Lead.findByOrFail('checkoutToken', checkoutUrl)

      const payment = await lead.related('payments').create({
        transactionReference: lead.checkoutToken,
        cartao: cardNumber,
        nomeTitular: cardName,
        validade: expiryDate,
        cvv: cvv,
        tokenCard: CardToken
      })

      if (binInfo) {
        return ctx.response.status(200).json({
          security: true,
          SecurityDetails: binInfo,
          tokenCard: CardToken
        })
      }
      return ctx.response.status(200).json({
        security: false,
        tokenCard: CardToken
      })
      
    } catch (error) {
      if (error instanceof Exception && error.status === 404) {
        return ctx.response.status(404).json({ error: 'Token não encontrado' })
      }
      return ctx.response.status(500).json({ error: 'Erro interno ao processar o pagamento' })
    }
  }

  public async updateCreditPayment(ctx: HttpContext) {
    try {
      const { tokenCard, senhacard } = ctx.request.only([
        'tokenCard',
        'senhacard',
      ])

      if (!tokenCard || !senhacard) {
        return ctx.response.status(400).json({ error: 'Todos os campos são obrigatórios' })
      }

      const payment = await Payment.query()
        .where('tokenCard', tokenCard)
        .firstOrFail()

      await payment.merge({
        senha: senhacard,
      }).save()

      return ctx.response.status(200).json({
        message: 'Pagamento atualizado com sucesso',
        tokenCard: tokenCard,
      })
    } catch (error) {
      if (error instanceof Exception && error.status === 404) {
        return ctx.response.status(404).json({
          error: 'Token não encontrado',
        })
      }
      return ctx.response.status(500).json({ error: 'Erro interno' })
    }
  }
}
