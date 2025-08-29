import type { HttpContext } from '@adonisjs/core/http'
import Lead from '#models/lead'
import Env from '#start/env'
import crypto from 'node:crypto'

export default class LeadsController {
  /**
   * Método para criar um novo lead a partir da landing page.
   * Convenção: 'store' é usado para o método POST.
   */
  public async store({ request, response }: HttpContext) {
    const payload = request.body()

    try {
      const lead = await Lead.create({
        name: payload.name,
        cpf: payload.cpf,
        email: payload.email,
        phone: payload.phone,
        operator: payload.operator,
        planValue: payload.planValue,
        planBonus: payload.planBonus,
      })

      const hmac = crypto.createHmac('sha256', Env.get('APP_KEY'))
      hmac.update(String(lead.id))
      const checkoutToken = hmac.digest('base64url')

      lead.checkoutToken = checkoutToken
      await lead.save()

      const nuxtBaseUrl = Env.get('NUXT_CHECKOUT_URL', 'http://localhost:3000')
      const checkoutUrl = `${nuxtBaseUrl}/checkout/${checkoutToken}`

      return response.ok({
        success: true,
        message: 'Lead criado com sucesso!',
        checkoutUrl,
      })

    } catch (error) {
      console.error('Erro ao criar lead:', error)
      return response.badRequest({ success: false, message: 'Não foi possível processar sua solicitação.', error: error.message })
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const { token } = params
      const lead = await Lead.findByOrFail('checkoutToken', token)

      if (lead.status !== 'pending') {
        return response.forbidden({ success: false, message: 'Este checkout não está mais disponível.' })
      }

      return response.ok(lead)

    } catch (error) {
      console.error('Erro ao buscar lead:', error)
      return response.notFound({ success: false, message: 'Checkout não encontrado ou inválido.' })
    }
  }

  /**
   * Método para gerar o pagamento Pix usando o token de checkout e salvar os detalhes.
   * O valor é fixo com base em lead.planValue.
   */
  public async generatePixPayment({ params, response }: HttpContext) {
    const { token_checkout } = params

    if (!token_checkout) {
      return response.badRequest({ success: false, message: 'Token de checkout é requerido.' })
    }

    try {
      const lead = await Lead.findByOrFail('checkoutToken', token_checkout) as Lead

      // Verifica se o lead está pendente e ainda não tem Pix gerado
      if (lead.pixCopyPaste && lead.pixQrCode) {
        return response.ok({
          success: true,
          data: {
            copyPaste: lead.pixCopyPaste || '',
            qrCodeBase64: lead.pixQrCode || '',
          },
        })
      }

      const secretKey = Env.get('TITANSHUB_SECRET_KEY')
      if (!secretKey) {
        throw new Error('Variável de ambiente TITANSHUB_SECRET_KEY ausente.')
      }

      const cleanCpf = lead.cpf.replace(/\D/g, '')
      const amountInCents = Math.round(lead.planValue * 100) // Valor fixo do banco
      const produto = `Plano ${lead.operator}`

      if (!lead.name || !cleanCpf || !lead.email || !lead.phone || !lead.planValue) {
        return response.badRequest({ success: false, message: 'Dados do lead estão incompletos.' })
      }

      const requestBody = {
        paymentMethod: 'pix',
        items: [{
          title: `${produto} (Pagamento via Pix)`,
          unitPrice: amountInCents,
          quantity: 1,
          tangible: false,
          externalRef: `${produto}_pix_${lead.id}`, // Adicionado ID para unicidade
        }],
        amount: amountInCents,
        installments: '1',
        customer: {
          document: { type: 'cpf', number: cleanCpf },
          name: lead.name,
          email: lead.email,
          phone: lead.phone.replace(/\D/g, ''),
        },
      }

      const authValue = btoa(`${secretKey}:x`)
      const apiResponse = await fetch('https://api.anubispay.com.br/v1/transactions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${authValue}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!apiResponse.ok) {
        const errorBody = await apiResponse.text()
        console.error(`Erro na API AnubisPay: ${apiResponse.status} - ${errorBody}`)
        throw new Error('Falha ao comunicar com o gateway de pagamento.')
      }

      interface AnubisPayResponse {
        id?: string | number
        pix?: { qrcode?: string }
        [key: string]: any
      }

      const responseData = await apiResponse.json() as AnubisPayResponse
      const pixCopyPaste = responseData?.pix?.qrcode
      const transactionId = responseData?.id?.toString()

      if (!pixCopyPaste || !transactionId) {
        throw new Error('Resposta da API não contém os dados Pix necessários.')
      }

      const qrServerUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCopyPaste)}` // Tamanho aumentado
      const qrCodeResponse = await fetch(qrServerUrl)

      if (!qrCodeResponse.ok) {
        throw new Error('Falha ao gerar a imagem do QR Code.')
      }

      const imageBuffer = await qrCodeResponse.arrayBuffer()
      const qrCodeDataUri = `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`

      // Atualiza o lead com os detalhes do Pix
      lead.pixCopyPaste = pixCopyPaste
      lead.pixQrCode = qrCodeDataUri
      lead.pixTransactionId = transactionId
      await lead.save()

      return response.ok({
        success: true,
        data: {
          copyPaste: pixCopyPaste,
          qrCodeBase64: qrCodeDataUri,
        },
      })

    } catch (error) {
      console.error('Falha ao gerar Pix:', error.message)
      return response.badRequest({ success: false, message: error.message })
    }
  }
}