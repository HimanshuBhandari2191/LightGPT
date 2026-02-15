import Chat from "../models/chat.js"
import User from "../models/user.js" 
import axios from "axios"
import imagekit from "../configs/imageKit.js"
import openai from "../configs/openai.js"
//text-based ai chat message controller

export const textMessageController = async(req,res)=>{
    try{
        const userId = req.user._id

        if(req.user.credits < 1){
            return res.json({success:false, message:"Insufficient credits"})
        }
        const {chatId, prompt} = req.body

        const chat = await Chat.findOne({userId,_id:chatId})
        chat.messages.push({role:"user", content:prompt, timestamp:Date.now(),isImage: false})

    const {choices} = await openai.chat.completions.create({
    model: "gemini-3-flash-preview",
    messages: [
        {
            role: "user",
            content: prompt,
        },
    ],
});

const reply = {...choices[0].message, timestamp: Date.now(), isImage: false}

chat.messages.push(reply)
await chat.save()
res.json({success:true, message:"Message sent successfully", data: reply})
await User.updateOne({_id:userId},{$inc : {credits: -1}})
       }catch(error){
        res.json({success:false, message:error.message})
    }
}

//image-based ai chat message controller

export const imageMessageController = async(req,res)=>{
    try{
        const userId = req.user._id

        //check credits
        if(req.user.credits < 2){
            return res.json({success:false, message:"Insufficient credits"})
        }
        const {chatId, prompt, isPublished} = req.body
        //find chat
        const chat = await Chat.findOne({userId,_id:chatId})
        //push user message 
        chat.messages.push({role:"user",
             content:prompt, 
             timestamp:Date.now(),
             isImage: true});
        
             //encode the prompt
             const encodedPrompt = encodeURIComponent(prompt);
             //construct the image url
             const generatedImageUrl = `${process.env.IMAGE_KIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/lightgpt/${Date.now()}.png?tr=w-800,h-800`;
             console.log("IMAGEKIT URL:", process.env.IMAGE_KIT_URL_ENDPOINT);
             console.log("Generated URL:", generatedImageUrl);

            //trigger generation by fetching from imagekit
            const aiImageResponse = await axios.get(generatedImageUrl,{responseType:"arraybuffer"})
            //convert the image to base64
            const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString("base64")}`;
            //upload to imagekit media library

            const uploadResponse = await imagekit.upload({
                file: base64Image,
                fileName: `${Date.now()}.png`,
                folder: "/lightgpt/ai-images"
            })
    const reply = {role:"assistant",content: uploadResponse.url, timestamp: Date.now(), isImage: true, isPublished}
            res.json({success:true,reply})
            chat.messages.push(reply)
            await chat.save()
        await User.updateOne({_id:userId},{$inc : {credits: -2}})

    }catch(error){
        res.json({success:false, message:"Api limit reached for image generation, try again later till then you can use text-based chat for free"})
    }
}
