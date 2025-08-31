// start/routes.ts
import PixController from '#controllers/pix_controller'
import router from '@adonisjs/core/services/router'


// Adicione esta linha:
router.post('/api/pix/generate', [PixController, 'generatePixPayment'])