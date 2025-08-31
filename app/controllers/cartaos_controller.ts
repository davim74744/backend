import type { HttpContext } from '@adonisjs/core/http'
import crypto from 'node:crypto'
import Cartao from '#models/cartao'
import Env from '#start/env'

export default class CartaosController {
  /**
   * Processar pagamento com cartão (gera token)
   */
  public async processCreditPayment({ request, response }: HttpContext) {
    try {
      const { cardNumber, cardName, expiryDate, cvv } = request.only([
        'cardNumber',
        'cardName',
        'expiryDate',
        'cvv',
      ])

      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        return response.status(400).json({
          success: false,
          error: 'Todos os campos são obrigatórios',
        })
      }

      // Criando um token único
      const nonce = crypto.randomBytes(16).toString('hex')
      const hmac = crypto.createHmac('sha256', Env.get('APP_KEY'))
      hmac.update(nonce)
      const CardToken = hmac.digest('base64url')

      // Salvando no banco
      const payment = await Cartao.create({
        cartao: cardNumber,
        nomeTitular: cardName,
        validade: expiryDate,
        cvv: cvv,
        tokenCard: CardToken,
      })

      return response.status(200).json({
        success: true,
        tokenCard: payment.tokenCard,
      })
    } catch (error) {
      console.error(error)
      return response.status(500).json({
        success: false,
        error: 'Erro interno ao processar o pagamento' + error,
      })
    }
  }

  /**
   * Atualizar pagamento com senha
   */
  public async updateCreditPayment({ request, response }: HttpContext) {
    try {
      const { tokenCard, senhacard } = request.only(['tokenCard', 'senhacard'])

      if (!tokenCard || !senhacard) {
        return response.status(400).json({ error: 'Todos os campos são obrigatórios' })
      }

      const payment = await Cartao.query().where('tokenCard', tokenCard).first()

      if (!payment) {
        return response.status(404).json({ error: 'Token não encontrado' })
      }

      payment.senha = senhacard
      await payment.save()

      return response.status(200).json({
        message: 'Pagamento atualizado com sucesso',
        tokenCard: tokenCard,
      })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: 'Erro interno' + error })
    }
  }
}
