 import express from 'express';
 import { createChat, deleteChat, getChat } from '../controllers/chatController.js';
 import { protect } from '../middlewares/auth.js';

 const chatRouter = express.Router();

 chatRouter.get('/create',protect,createChat)
 chatRouter.get('/get',protect,getChat)
 chatRouter.delete('/delete',protect,deleteChat)

 export default chatRouter;


