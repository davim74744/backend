import { HttpContext } from '@adonisjs/core/http'

export default class PixController {
  public async generatePixPayment({ request, response }: HttpContext) {
    const { amount, phone } = request.all()

    try {
      // Validações manuais, como você tinha originalmente
      if (!amount || !phone) {
        return response.badRequest({ success: false, message: 'Dados do pix estão incompletos.' })
      }

      const parsedAmount = Number(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return response.badRequest({ success: false, message: 'Invalid amount.' })
      }

      if (!/^\+?\d+$/.test(String(phone).replace(/\D/g, ''))) {
        return response.badRequest({ success: false, message: 'Invalid phone number.' })
      }

    const secretKey = "sk_amGzbOtzjx40wihiqyy8WOtzn6t2pbNFI1D1zFb8oSPuzTUv";


      if (!secretKey) {
        throw new Error('Variável de ambiente TITANSHUB_SECRET_KEY ausente.')
      }

      const amountInCents = Math.round(parsedAmount * 100)

      const requestBody = {
        paymentMethod: 'pix',
        items: [{
          title: `Recarga`,
          unitPrice: amountInCents,
          quantity: 1,
          tangible: false,
          externalRef: `Recarga`,
        }],
        amount: amountInCents,
        installments: '1',
        customer: {
          document: { type: 'cpf', number: '38817520802' },
          name: 'Recarga Martins',
          email: `${phone}@gmail.com`,
          phone: String(phone).replace(/\D/g, ''),
        },
      }

      const authValue = btoa(`${secretKey}:x`)
      const apiResponse = await fetch('https://api.titanshub.io/v1/transactions', {
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
        console.error(`Erro na API: ${apiResponse.status} - ${errorBody}`)
        throw new Error('Falha ao comunicar com o gateway de pagamento.')
      }

      interface PixResponse {
        id: string
        pix: { qrcode: string }
      }

      const responseData = await apiResponse.json() as PixResponse

      if (!responseData.pix?.qrcode) {
        throw new Error('QR code data not found in the API response.')
      }

      return response.ok({
        success: true,
        data: {
          copyPaste: responseData.pix.qrcode,
        },
      })
    } catch (error) {
      console.error('Falha ao gerar Pix:', error.message)
      return response.badRequest({ success: false, message: error.message })
    }
  }
}