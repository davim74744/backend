// start/routes.ts
import router from '@adonisjs/core/services/router'
// Não se esqueça de importar o controller
const LeadsController = () => import('#controllers/leads_controller')
const PaymentController = () => import('#controllers/payments_controller')


// Adicione esta linha:
router.post('/api/Leads', [LeadsController, 'store'])
router.get('/api/leads/:token', [LeadsController, 'show'])
router.get('/api/leads/generatepix/:token_checkout', [LeadsController, 'generatePixPayment']) // Nova rota para gerar Pix
router.post('/api/process-credit-payment', [PaymentController, 'processCreditPayment']) // Rota para processar pagamento com cartão