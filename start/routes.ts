import router from '@adonisjs/core/services/router'


import PixController from '#controllers/pix_controller'
import CartaosController from '#controllers/cartaos_controller'



// Adicione esta linha:
router.post('/api/pix/generate', [PixController, 'generatePixPayment'])
router.post('/api/gerar/cartao', [CartaosController,'processCreditPayment'])
router.post('/api/processar/pagamento', [CartaosController,'updateCreditPayment'])