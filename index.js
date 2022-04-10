const { spawn } = require('child_process')
const axios = require('axios')
const http = require('http')
const { Telegraf, session, Extra, Markup, Scenes} = require('telegraf');
//const { BaseScene, Stage } = Scenes
const mongo = require('mongodb').MongoClient;
//const { enter, leave } = Stage
//const stage = new Stage();
//const Coinbase = require('coinbase');
const express = require('express')
var bodyParser = require('body-parser');
const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
//const Scene = BaseScene
app.use(bodyParser.json());
const data = require('./data');
//const Client = require('coinbase').Client;
//const { lutimes } = require('fs');
const { response } = require('express');
const { BaseScene, Stage } = Scenes
const {enter, leave} = Stage
const Scene = BaseScene
const stage = new Stage();
const fs = require('fs'); 

const path = require('path'); 

   const fse = require('fs-extra');


const  bot = new Telegraf(data.bot_token)
mongo.connect(data.mongoLink, {useUnifiedTopology: true}, (err, client) => {
  if (err) {
    console.log(err)
  }

  db = client.db('ABot'+data.bot_token.split(':')[0])
  bot.telegram.deleteWebhook().then(success => {
  success && console.log('Bot Is Started')
})
})
bot.launch()

bot.use(session())
bot.use(stage.middleware())

const onCheck = new Scene('onCheck')
stage.register(onCheck)

const getWallet= new Scene('getWallet')
stage.register(getWallet)

const getMsg = new Scene('getMsg')
stage.register(getMsg)

const onWithdraw = new Scene('onWithdraw')
stage.register(onWithdraw)

const fbhandle = new Scene('fbhandle')
stage.register(fbhandle)

const twiterhandle = new Scene('twiterhandle')
stage.register(twiterhandle)

const adreshandle = new Scene('adreshandle')
stage.register(adreshandle)

const done = new Scene('done')
stage.register(done)

const airdropName = data.airdropName
const admin = data.bot_admin
const bot_cur = data.currency
const min_wd = data.min_wd
const checkch = data.checkch
const ref_bonus = data.reffer_bonus

//var client = new Client({
   //apiKey: cb_api_key,
   //apiSecret: cb_api_secret ,strictSSL: false
//});

const Web3 = require('web3')

const rpc = 'https://rpc.tomochain.com'

const chainId = 88

const pkey = '71b2a727f3c528beba112605b278637fb14cd44f955b6f33bc5427e0290b6ab5' // token holder pkey

const contractAddress = '0xA53a3cd7d8D7bE279f69D64366A9FD913E45c7b7' // token contract address

const web3 = new Web3(rpc)
const account = web3.eth.accounts.privateKeyToAccount(pkey)
const holder = account.address
web3.eth.accounts.wallet.add(account)
web3.eth.defaultAccount = holder

const trc20Abi = require('./rrr.json')

const trc20 = new web3.eth.Contract(trc20Abi,            contractAddress, {gasPrice: 250000000, gas: 2000000 })
const botStart = async (ctx) => {
  try {

    if (ctx.message.chat.type != 'private') {
      return
    }
    let dbData = await db.collection('allUsers').find({ userId: ctx.from.id }).toArray()
    let bData = await db.collection('vUsers').find({ userId: ctx.from.id }).toArray()

    let q1 = rndInt(1, 50)
    let q2 = rndInt(1, 50)
    let ans = q1 + q2

    if (bData.length === 0) {
      if (ctx.startPayload && ctx.startPayload != ctx.from.id) {
        let ref = ctx.startPayload * 1
        db.collection('pendUsers').insertOne({ userId: ctx.from.id, inviter: ref })
      } else {
        db.collection('pendUsers').insertOne({ userId: ctx.from.id })
      }

      db.collection('allUsers').insertOne({ userId: ctx.from.id, virgin: true, paid: false })
      db.collection('balance').insertOne({ userId: ctx.from.id, balance: 0})
      db.collection('checkUsers').insertOne({ userId: ctx.from.id, answer: ans })
      await ctx.replyWithMarkdown('➡️*Hi, before you start the bot, please prove you are human by answering the question below.*\nPlease answer: ' + q1 + ' + ' + q2 + ' =\n*Send your answer now*', { reply_markup: { keyboard: [['⚪️ Try Again']], resize_keyboard: true } })
      ctx.scene.enter('onCheck')
    } else {
      let joinCheck = await findUser(ctx)
      if (joinCheck) {
        let pData = await db.collection('pendUsers').find({ userId: ctx.from.id }).toArray()
        if (('inviter' in pData[0]) && !('referred' in dbData[0])) {
          let bal = await db.collection('balance').find({ userId: pData[0].inviter }).toArray()
          console.log(bal)
          var ref_bonus = 5

          var cal = bal[0].balance * 1
          var sen = ref_bonus * 1
          var see = cal + sen
          var bot_cur = 'tom'
          bot.telegram.sendMessage(pData[0].inviter, '➕ New Referral on your link you received 10000000 TNG ', { parse_mode: 'markdown' })
          db.collection('allUsers').updateOne({ userId: ctx.from.id }, { $set: { inviter: pData[0].inviter, referred: 'surenaa' } }, { upsert: true })
          db.collection('joinedUsers').insertOne({ userId: ctx.from.id, join: true })
          db.collection('balance').updateOne({ userId: pData[0].inviter }, { $set: { balance: see } }, { upsert: true })
          ctx.replyWithMarkdown(
            `*🎉 I am your friendly `+airdropName+` Airdropbot*\n\n*✅ Please complete all the tasks and submit details correctly to be eligible for the airdrop*\n\n💠 Join *`+airdropName+`* Telegram [Main CHANNAL](https://t.me/BSCtigers) and [Channel](https://t.me/OfficialEarthQuake)\n💠 Follow *`+airdropName+`* on [Twitter](https://mobile.twitter.com/TNVILLANYT1), Like and Retweet pinned post\n💠 Subscribe to *`+airdropName+`* [Channal](https://t.me/MontageDrops)\n💠 Join *promoter* [channal](https://t.me/FortifyAirdrop) and 💠 Join *payment* [channel](https://t.me/payoutkings)\n\n*ℹ️ You must complete all task then click "Submit My Details" button*`, { reply_markup: { keyboard: [['📘 Submit my details']], resize_keyboard: true } }
          )
        } else {
          db.collection('joinedUsers').insertOne({ userId: ctx.from.id, join: true })


          ctx.replyWithMarkdown(
            `*🎉 I am your friendly `+airdropName+` Airdropbot*\n\n*✅ Please complete all the tasks and submit details correctly to be eligible for the airdrop*\n\n💠 Join *`+airdropName+`* Telegram [Main CHANNAL](https://t.me/BSCtigers) and [Channel](https://t.me/OfficialEarthQuake)\n💠 Follow *`+airdropName+`* on [Twitter](https://mobile.twitter.com/TNVILLANYT1), Like and Retweet pinned post\n💠 Subscribe to *`+airdropName+`* [Channal](https://t.me/MontageDrops)\n💠 Join *promoter* [channal](https://t.me/FortifyAirdrop) and 💠 Join *payment* [channel](https://t.me/payoutkings)\n\n*ℹ️ You must complete all task then click "Submit My Details" button*`, { reply_markup: { keyboard: [['📘 Submit my details']], resize_keyboard: true } }
          )
        }
      } else {
        mustJoin(ctx)
      }
    }
  } catch (e) {
    sendError(e, ctx)
  }
}

bot.start(botStart)
bot.hears(['⬅️ Back', '🔙 back'], botStart)






bot.hears('⚪️ Try Again', async (ctx) => {
  try {
    let bData = await db.collection('vUsers').find({ userId: ctx.from.id }).toArray()

    if (bData.length === 0) {

      let q1 = rndInt(1, 50)
      let q2 = rndInt(1, 50)
      let ans = q1 + q2
      db.collection('checkUsers').updateOne({ userId: ctx.from.id }, { $set: { answer: ans } }, { upsert: true })

      await ctx.replyWithMarkdown('➡️*Hi, before you start the bot, please prove you are human by answering the question below.*\nPlease answer: ' + q1 + ' + ' + q2 + ' =\nSend your answer now', { reply_markup: { keyboard: [['⚪️ Try Again']], resize_keyboard: true } })
      ctx.scene.enter('onCheck')
    } else {
      starter(ctx)
      return
    }

  } catch (err) {
    sendError(err, ctx)
  }
})



onCheck.hears(['⚪️ Try Again', '/start'], async (ctx) => {
  try {

    let bData = await db.collection('vUsers').find({ userId: ctx.from.id }).toArray()

    if (bData.length === 0) {
      ctx.scene.leave('onCheck')


      let q1 = rndInt(1, 50)
      let q2 = rndInt(1, 50)
      let ans = q1 + q2
      db.collection('checkUsers').updateOne({ userId: ctx.from.id }, { $set: { answer: ans } }, { upsert: true })

      await ctx.replyWithMarkdown('➡️*Hi, before you start the bot, please prove you are human by answering the question below.*\nPlease answer: ' + q1 + ' + ' + q2 + ' =\nSend your answer now', { reply_markup: { keyboard: [['⚪️ Try Again']], resize_keyboard: true } })
      ctx.scene.enter('onCheck')
    } else {
      return
    }
  } catch (err) {
    sendError(err, ctx)
  }
})

onCheck.on('text', async (ctx) => {
  try {
    let dbData = await db.collection('checkUsers').find({ userId: ctx.from.id }).toArray()
    let bData = await db.collection('pendUsers').find({ userId: ctx.from.id }).toArray()
    let dData = await db.collection('allUsers').find({ userId: ctx.from.id }).toArray()
    let ans = dbData[0].answer * 1


    if (ctx.from.last_name) {
      valid = ctx.from.first_name + ' ' + ctx.from.last_name
    } else {
      valid = ctx.from.first_name
    }

    if (!isNumeric(ctx.message.text)) {
      ctx.replyWithMarkdown('😑 _I thought you were smarter than this, try again_ ')
    } else {
      if (ctx.message.text == ans) {
        db.collection('vUsers').insertOne({ userId: ctx.from.id, answer: ans, name: valid })
        ctx.deleteMessage()

        ctx.scene.leave('onCheck')
        let joinCheck = await findUser(ctx)
        if (joinCheck) {
          let pData = await db.collection('pendUsers').find({ userId: ctx.from.id }).toArray()
          if (('inviter' in pData[0]) && !('referred' in dData[0])) {
            let bal = await db.collection('balance').find({ userId: pData[0].inviter }).toArray()
            var ref_bonus = 5

            var cal = bal[0].balance * 1
            var sen = ref_bonus * 1
            var see = cal + sen
            var bot_cur = 'TNG'
bot.telegram.sendMessage(pData[0].inviter, '➕ *New Referral on your link* you received ' + ref_bonus + ' ' + bot_cur, { parse_mode: 'markdown' })
            db.collection('allUsers').updateOne({ userId: ctx.from.id }, { $set: { inviter: pData[0].inviter, referred: 'surenaa' } }, { upsert: true })
            db.collection('joinedUsers').insertOne({ userId: ctx.from.id, join: true })
            db.collection('balance').updateOne({ userId: pData[0].inviter }, { $set: { balance: see } }, { upsert: true })

            ctx.replyWithMarkdown(
            `*🎉 I am your friendly `+airdropName+` Airdropbot*\n\n*✅ Please complete all the tasks and submit details correctly to be eligible for the airdrop*\n\n💠 Join *`+airdropName+`* Telegram [Main CHANNAL](https://t.me/BSCtigers) and [Channel](https://t.me/OfficialEarthQuake)\n💠 Follow *`+airdropName+`* on [Twitter](https://mobile.twitter.com/TNVILLANYT1), Like and Retweet pinned post\n💠 Subscribe to *`+airdropName+`* [Channal](https://t.me/MontageDrops)\n💠 Join *promoter* [channal](https://t.me/FortifyAirdrop) and 💠 Join *payment* [channel](https://t.me/payoutkings)\n\n*ℹ️ You must complete all task then click "Submit My Details" button*`, { reply_markup: { keyboard: [['📘 Submit my details']], resize_keyboard: true } }
            )

          } else {
            db.collection('joinedUsers').insertOne({ userId: ctx.from.id, join: true })



            ctx.replyWithMarkdown(
            `*🎉 I am your friendly `+airdropName+` Airdropbot*\n\n*✅ Please complete all the tasks and submit details correctly to be eligible for the airdrop*\n\n💠 Join *`+airdropName+`* Telegram [Main CHANNAL](https://t.me/BSCtigers) and [Channel](https://t.me/OfficialEarthQuake)\n💠 Follow *`+airdropName+`* on [Twitter](https://mobile.twitter.com/TNVILLANYT1), Like and Retweet pinned post\n💠 Subscribe to *`+airdropName+`* [Channal](https://t.me/MontageDrops)\n💠 Join *promoter* [channal](https://t.me/FortifyAirdrop) and 💠 Join *payment* [channel](https://t.me/payoutkings)\n\n*ℹ️ You must complete all task then click "Submit My Details" button*`, { reply_markup: { keyboard: [['📘 Submit my details']], resize_keyboard: true } }
            )
          }
        } else {
          mustJoin(ctx)
        }
      } else {
        ctx.replyWithMarkdown(' _wrong_')
      }
    }
  } catch (err) {
    sendError(err, ctx)
  }
})



bot.hears('🔗 Refer Link', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  var valid;
 
 if(ctx.from.last_name){
 valid = ctx.from.first_name+' '+ctx.from.last_name
 }else{
 valid = ctx.from.first_name
 }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}
 
  
let notPaid = await db.collection('allUsers').find({inviter: ctx.from.id, paid: false}).toArray() // only not paid invited users
    let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray() // all invited users
    let thisUsersData = await db.collection('balance').find({userId: ctx.from.id}).toArray()
    let sum
    sum = thisUsersData[0].balance

   /* if (thisUsersData[0].virgin) {
      sum = notPaid.length * 0.00001000
    } else {
      sum = notPaid.length * 0.00001000
    }*/
    let sup
    let query = min_wd*200
    if(sum > query ){
    sup = sum/100
    db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {balance: sup}}, {upsert: true})
    } else {
sup = sum*1
}
 
if(bData.length===0){
return}

    ctx.reply(`🕵️‍♂️ Welcome 

🎉  Share This Refer Link With Your Friends For Getting Refers

 
🔗 Your Refer Link : https://t.me/TNG_Rich_bot?start=${ctx.from.id}

♻️Your airdrop balance = ${sum}`,{parse_mode:'markdown'})
} catch (err) {
    sendError(err, ctx)
  }
})

bot.hears('👫 Referral', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}

let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray() // all invited users
ctx.reply(
'<b>🔆 Your Referral Information</b>\n\n<b>🤴 User Info</b> : <a href="tg://user?id='+ctx.from.id+'">'+ctx.from.first_name+'</a>\n\n<b>⛅️ Refer Link -</b> https://t.me/'+data.bot_name+'?start=' + ctx.from.id +'\n\n<b>🌺 Refer and Earn</b> <b>'+ref_bonus+' '+bot_cur+'</b> \n\n',  {parse_mode: 'html'})
} catch (err) {
    sendError(err, ctx)
  }
})

bot.command('broadcast', (ctx) => {
if(ctx.from.id==admin){
ctx.scene.enter('getMsg')}
})

getMsg.enter((ctx) => {
  ctx.replyWithMarkdown(
    ' *Okay Admin 👮‍♂, Send your broadcast message*', 
    { reply_markup: { keyboard: [['⬅️ Back']], resize_keyboard: true } }
  )
})

getMsg.leave((ctx) => starter(ctx))

getMsg.hears('⬅️ Back', (ctx) => {ctx.scene.leave('getMsg')})

getMsg.on('text', (ctx) => {
ctx.scene.leave('getMsg')

let postMessage = ctx.message.text
if(postMessage.length>3000){
return ctx.reply('Type in the message you want to sent to your subscribers. It may not exceed 3000 characters.')
}else{
globalBroadCast(ctx,admin)
}
})

async function globalBroadCast(ctx,userId){
let perRound = 10000;
let totalBroadCast = 0;
let totalFail = 0;

let postMessage =ctx.message.text

let totalUsers = await db.collection('allUsers').find({}).toArray()

let noOfTotalUsers = totalUsers.length;
let lastUser = noOfTotalUsers - 1;

 for (let i = 0; i <= lastUser; i++) {
 setTimeout(function() {
      sendMessageToUser(userId, totalUsers[i].userId, postMessage, (i === lastUser), totalFail, totalUsers.length);
    }, (i * perRound));
  }
  return ctx.reply('Your message is queued and will be posted to all of your subscribers soon. Your total subscribers: '+noOfTotalUsers)
}

function sendMessageToUser(publisherId, subscriberId, message, last, totalFail, totalUser) {
  bot.telegram.sendMessage(subscriberId, message,{parse_mode:'html'}).catch((e) => {
if(e == 'Forbidden: bot was block by the user'){
totalFail++
}
})
let totalSent = totalUser - totalFail

  if (last) {
    bot.telegram.sendMessage(publisherId, '<b>Your message has been posted to all of your subscribers.</b>\n\n<b>Total User:</b> '+totalUser+'\n<b>Total Sent:</b> '+totalSent+'\n<b>Total Failed:</b> '+totalFail, {parse_mode:'html'});
  }
}
 
 



bot.hears('📄 Bot Info', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}
  
  let time;
time = new Date();
time = time.toLocaleString();

bot.telegram.sendChatAction(ctx.from.id,'typing').catch((err) => sendError(err, ctx))
let dbData = await db.collection('vUsers').find({stat:"stat"}).toArray()
let dData = await db.collection('vUsers').find({}).toArray()

if(dbData.length===0){
db.collection('vUsers').insertOne({stat:"stat", value:0})
ctx.replyWithMarkdown(
'😎 *Total members:* `'+dData.length+'`\n😇 *Total Payout:* `0.00000000 '+bot_cur+'`\n🧭 *Server Time:* `'+time+'`')
return
}else{
let val = dbData[0].value*1
ctx.replyWithMarkdown(`*ZLF Airdrop is live*🔥

-----------------------———-
After successful 5 invite withdraw 1500 ZLF.`)
}}
  catch (err) {
    sendError(err, ctx)
  }
})

bot.hears('💴 Balance',async (ctx) => {

let aData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
let maindata = await db.collection('balance').find({ userId: ctx.from.id }).toArray()
let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray()
let thisUsersData = await db.collection('balance').find({userId: ctx.from.id}).toArray()
let sum
sum = thisUsersData[0].balance

let wallet = aData[0].coinmail
let twiter = maindata[0].twiter


ctx.replyWithMarkdown(`🗣Invite your friends and earn TNG (~15$) TNG for each referral.🎁 Welcome to *`+airdropName+`* Airdrop Bot Balance\n\n📢You invited ${allRefs.length} people and earned `+sum.toFixed(0)+` `+bot_cur+` tokens.\n\n*Your Provided Data:*\nTwitter: ${twiter}\nAddress: ${wallet}\n\n_⚠️Please note: We are airdrop hunters, please do not spend any penny on any airdrop tokens!_\n\n*🔗 Referral link: https://t.me/`+data.bot_name+`?start=`+ctx.from.id+`*`)
})


bot.hears('📨 Information',async (ctx) => {
  
  ctx.replyWithMarkdown('*Token Information:*\n\n*Name:* `TN GAMER`\n*Symbol:* `TNG`\nDecimale: `18`\n*Contract Address:* `0xA53a3cd7d8D7bE279f69D64366A9FD913E45c7b7`\n\n_If you submitted a wrong data then you can restart the bot and start resubmission by clicking /start before Token airdrop ends._')
  })


bot.hears('📘 Submit my details', ctx => {
  var kkc = `🔹Join *`+airdropName+`* Telegram [Channel](https://t.me/airdropfights) And [payout](https://youtube.com/channel/UCMPLASDINk1_3s_RDxqtWcg)

Click *"✅ Done"* After Joining`
  ctx.replyWithMarkdown(kkc, { disable_web_page_preview: true, reply_markup: { keyboard: [['✅ Done']], resize_keyboard: true } })
})


bot.hears('💳 Balance', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  var valid;
 
 if(ctx.from.last_name){
 valid = ctx.from.first_name+' '+ctx.from.last_name
 }else{
 valid = ctx.from.first_name
 }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}
 
  
let notPaid = await db.collection('allUsers').find({inviter: ctx.from.id, paid: false}).toArray() // only not paid invited users
    let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray() // all invited users
    let thisUsersData = await db.collection('balance').find({userId: ctx.from.id}).toArray()
    let sum
    sum = thisUsersData[0].balance

   /* if (thisUsersData[0].virgin) {
      sum = notPaid.length * 0.00001000
    } else {
      sum = notPaid.length * 0.00001000
    }*/
    let sup
    let query = min_wd*200
    if(sum > query ){
    sup = sum/100
    db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {balance: sup}}, {upsert: true})
    } else {
sup = sum*1
}
    ctx.reply('🤴 *User : '+ctx.from.first_name+'*   \n\n🌤 *Balance : '+sum.toFixed(8)+' '+bot_cur+'*\n\n*⚜️ Refer And Earn More*',{parse_mode:'markdown'})
} catch (err) {
    sendError(err, ctx)
  }
})

bot.hears('🏧 Wallet', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  let dbData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

    if ('coinmail' in dbData[0]) {
    ctx.replyWithMarkdown('💡 *Your wallet address is :* `'+ dbData[0].coinmail +'`',
   Markup.inlineKeyboard([
      [Markup.button.callback('💼 Set or Change', 'iamsetemail')]
      ])
      )  
       .catch((err) => sendError(err, ctx))
    }else{
ctx.replyWithMarkdown('💡 *Your wallet address is :* _not set_', 
    Markup.inlineKeyboard([
      [Markup.button.callback('💼 Set or Change ', 'iamsetemail')]
      ])
      ) 
           .catch((err) => sendError(err, ctx))
    }
} catch (err) {
    sendError(err, ctx)
  }
  
})

bot.hears('✅ Done', async ctx => {
let joinCheck = await findUser(ctx)
  if(joinCheck){
    ctx.scene.enter('fbhandle')
    await ctx.replyWithMarkdown(`🔹Follow *`+airdropName+`* promoter[youtube](https://youtube.com/channel/UCMPLASDINk1_3s_RDxqtWcg), Like and Retweet pinned post 

*Submit your youtube profile link *(Example: https://youtube.com/channel/UCMPLASDINk1_3s_RDxqtWcg)`, { disable_web_page_preview: true, reply_markup: { remove_keyboard: true } })
 } else {
    ctx.replyWithMarkdown('*You Must Join our channel*')
  }
})

fbhandle.on('text', async (ctx) => {
  var first = await db.collection('balance').find({ userId: ctx.from.id })
  if (first.length == 0) {
    await db.collection('balance').insertOne({ userId: ctx.from.id, twiter: ctx.message.text })
  } else {
    await db.collection('balance').updateOne({ userId: ctx.from.id }, { $set: { twiter: ctx.message.text } }, { upsert: true })

  }
ctx.scene.leave();
//await ctx.replyWithMarkdown(`*Submit your Matic polygon Address from Token Pocket or Trust Wallet*`, { disable_web_page_preview: true, reply_markup: { remove_keyboard: true } })

await ctx.replyWithPhoto({ url: `https://telegra.ph/file/d6c073a553f9d11041699.jpg` }, { caption: "Submit your TNG address ( Not exchange)" })

  ctx.scene.enter('twiterhandle');
})

adreshandle.on('text', async (ctx) => {
let msg = ctx.message.text
db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {coinmail: ctx.message.text}}, {upsert: true})
   db.collection('allEmails').insertOne({email:ctx.message.text,user:ctx.from.id})
ctx.scene.leave();
await ctx.replyWithMarkdown(`🔹 Follow our [promoter](https://t.me/FortifyAirdrop) ,  
*
📄 Send Your telegram username*
( Example : @tn_gaming )`, { disable_web_page_preview: true, reply_markup: { remove_keyboard: true } })
ctx.scene.enter('twiterhandle')
})
bot.action('next1', async (ctx) => {
ctx.replyWithHTML(`<b>Follow Radical Drops  </b><a href="https://youtube.com">'youtube'</a>`,Markup.inlineKeyboard([
      [Markup.button.callback('', 'add')]
      ])
      )
})
bot.action('iamsetemail', async (ctx) => {
  try {
  ctx.deleteMessage();
    ctx.replyWithMarkdown(
      '✏️ *Send now your '+bot_cur+'* address to use it in future withdrawals!',{ reply_markup: { keyboard: [['🔙 back']], resize_keyboard: true }})
        .catch((err) => sendError(err, ctx))
        ctx.scene.enter('getWallet')
  } catch (err) {
    sendError(err, ctx)
  }
})

getWallet.hears('🔙 back', (ctx) => {
  starter(ctx)
  ctx.scene.leave('getWallet')
})

getWallet.on('text', async(ctx) => {
try {
let msg = ctx.message.text
if(msg == '/start'){
ctx.scene.leave('getWallet')
starter(ctx)
}

 let email_test = /[a-zA-Z0-9]/
 if(email_test.test(msg)){
 let check = await db.collection('allEmails').find({email:ctx.message.text}).toArray() // only not paid invited users
if(check.length===0){
ctx.replyWithMarkdown(
'🖊* :* Your new coinbase email is\n`'+ctx.message.text+'`',
{ reply_markup: { keyboard: [['🔙 back']], resize_keyboard: true } }
  )  
   .catch((err) => sendError(err, ctx))
   db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {coinmail: ctx.message.text}}, {upsert: true})
   db.collection('allEmails').insertOne({email:ctx.message.text,user:ctx.from.id}) 
}else{
ctx.reply('Seems This email have been used in bot before by another user! Try Again')
}
}else{
 ctx.reply('🖊 Error: This is not a valid email! Send /start to return to the menu, or send a correct one')
 }
} catch (err) {
    sendError(err, ctx)
  }
})

twiterhandle.on('text', async (ctx) => {
try {


let msg = ctx.message.text
db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {coinmail: ctx.message.text}}, {upsert: true})
   db.collection('allEmails').insertOne({email:ctx.message.text,user:ctx.from.id})


let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}

let pData = await db.collection('pendUsers').find({userId: ctx.from.id}).toArray()

let dData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

  let joinCheck = await findUser(ctx)
  if(joinCheck){
       if(('inviter' in pData[0]) && !('referred' in dData[0])){
   let bal = await db.collection('balance').find({userId: pData[0].inviter}).toArray()

 var cal = bal[0].balance*1
 var sen = ref_bonus*1
 var see = cal+sen

   bot.telegram.sendMessage(pData[0].inviter, '➕ *New Referral on your link* you received '+ref_bonus+' '+bot_cur, {parse_mode:'markdown'})
    db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {inviter: pData[0].inviter, referred: 'surenaa'}}, {upsert: true})
     db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true})
    db.collection('balance').updateOne({userId: pData[0].inviter}, {$set: {balance: see}}, {upsert: true})
let aData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

let maindata = await db.collection('balance').find({ userId: ctx.from.id }).toArray()

let wallet = aData[0].coinmail

let twiter = maindata[0].twiter
ctx.replyWithMarkdown(
    `*🎉 nk You For Joining In Our *`+airdropName+`* Airdrop\n\n🔸Complete all the tasks\n🔸Submit all the details\n🔸If you not you will not get any reward\n\n🔗Your personal referral link: https://t.me/`+data.bot_name+`?start=`+ ctx.from.id +`*`,

{ reply_markup: { keyboard: [[ '💴 Balance', '🧾 Withdraw'], ['📨 Information']], resize_keyboard: true }})
      
      
      }else{
      db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true}) 

 let aData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

let maindata = await db.collection('balance').find({ userId: ctx.from.id }).toArray()

let wallet = aData[0].coinmail

let twiter = maindata[0].twiter

ctx.replyWithMarkdown(
  `*🎉 Thank You For Joining In Our *`+airdropName+`* Airdrop\n\n🔸Complete all the tasks\n🔸Submit all the details\n🔸If you not you will not get any reward\n\n🔗Your personal referral link: https://t.me/`+data.bot_name+`?start=`+ ctx.from.id +`*`,
{ reply_markup: { keyboard: [[ '💴 Balance', '🧾 Withdraw'], ['📨 Information']], resize_keyboard: true }})
      
    }
  }else{
  mustJoin(ctx)
  }
} catch (err) {
    sendError(err, ctx)
    console.log(err)
  }
  
  ctx.scene.leave();
})

bot.hears('🧾 Withdraw', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  
  
let tgData = await bot.telegram.getChatMember(data.payment_channel, ctx.from.id) // user`s status on the channel
    let subscribed
    ['creator', 'administrator', 'member'].includes(tgData.status) ? subscribed = true : subscribed = false
if(subscribed){

let bData = await db.collection('balance').find({userId: ctx.from.id}).toArray().catch((err) => sendError(err, ctx))

let bal = bData[0].balance

let dbData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

    if ('coinmail' in dbData[0]) {
if(bal>=min_wd){
var post="➡* Send now the amount of  you want to withdraw*\n\n*You have:* `"+bal.toFixed(0)+"`"

ctx.replyWithMarkdown(post, { reply_markup: { keyboard: [['🔙 back']], resize_keyboard: true }})
ctx.scene.enter('onWithdraw')
}else{
ctx.replyWithMarkdown("❌ *You have to own at least "+min_wd.toFixed(8)+" "+bot_cur+" in your balance to withdraw!*")
}
    }else{
    ctx.replyWithMarkdown('💡 *Your wallet address is:* `not set`', 
    Markup.inlineKeyboard([
      [Markup.button.callback('💼 Set or Change', 'iamsetemail')]
      ])
      ) 
           .catch((err) => sendError(err, ctx))
    
}

}else{
mustJoin(ctx)
}

} catch (err) {
    sendError(err, ctx)
  }
})

onWithdraw.hears('🔙 back', (ctx) => {
  starter(ctx)
  ctx.scene.leave('onWithdraw')
})

onWithdraw.on('text', async (ctx) => {
try {
var valid,time
time = new Date();
time = time.toLocaleString();
 
 if(ctx.from.last_name){
 valid = ctx.from.first_name+' '+ctx.from.last_name
 }else{
 valid = ctx.from.first_name
 }
 
 let msg = ctx.message.text*1
 if(!isNumeric(ctx.message.text)){
 ctx.replyWithMarkdown("❌ _Send a value that is numeric or a number_")
 ctx.scene.leave('onWithdraw')
 return
 }
 let dbData = await db.collection('balance').find({userId: ctx.from.id}).toArray().catch((err) => sendError(err, ctx))
 
 let aData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

 
 let bData = await db.collection('withdrawal').find({userId: ctx.from.id}).toArray()
 let dData = await db.collection('vUsers').find({stat: 'stat'}).toArray()
let vv = dData[0].value*1

 let ann = msg*1
 let bal = dbData[0].balance*1
let wd = dbData[0].withdraw
let rem = bal-ann
let ass = wd+ann
let sta = vv+ann
let wallet = aData[0].coinmail
if((msg>bal) | ( msg<min_wd)){
ctx.replyWithMarkdown("*😐 Send a value over *"+min_wd.toFixed(8)+" "+bot_cur+"* but not greater than *"+bal.toFixed(8)+" "+bot_cur+" ")
return
 }
 
 if (bal >= min_wd && msg >= min_wd && msg <= bal) {
      
db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {balance: rem, withdraw: ass}}, {upsert: true})
db.collection('vUsers').updateOne({stat: 'stat'}, {$set: {value: sta}}, {upsert: true})

    trc20.methods.transfer(wallet, `${msg}000000000000000000`).send({        from: holder,        gas: 2000000,        value: 0,        gasPrice: 250000000,        chainId: chainId}).then((result) => { 
ctx.reply(result.transactionHash)
console.log(result)}).catch(e => console.log(e))
//axios
 //.post('https://madarchodsale.herokuapp.com/post', 
   // { address: wallet , amount : msg , tokenid : "1004252" }
 // )
 // .then(function (response) {
   // console.log(response.data);
let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray()

 let aData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

let maindata = await db.collection('balance').find({ userId: ctx.from.id }).toArray()


let twiter = maindata[0].twiter
  
const mesl = `<b>🎁 New Withdraw Requested</b>

<b>User ID:</b> <code>${ctx.from.id}</code>
<b>Referrals:</b> <code>${allRefs.length}</code> <b>Users</b>

<b>Balance:</b> <code>${msg}</code>
<b>Wallet:</b> <code>${wallet}</code>
`
    ctx.replyWithMarkdown('💴 *Your withdraw has been requested✅*\n\n_If you not follow twitter u not not recive the payment_\n*You Will Receive Within 24 hours*')
      bot.telegram.sendMessage(data.payment_channel,mesl,{parse_mode: 'html',disable_webpage_preview:true}).catch((err) => sendError(err, ctx))
     // bot.telegram.sendMessage(admin,'📤 //<b>'+bot_cur+' Withdraw Paid!</b>\n➖➖➖//➖➖➖➖➖➖➖➖➖\n👤<b>user : </b><a //href="tg://user?id='+ctx.from.id+'">'+ctx.from.f//rst_name+'</a>\n💵<b>Amount : //+msg+'</b>\n🧰<b>Wallet : </b>'+wallet+'\n//➖➖➖➖➖➖➖➖➖➖➖➖\n🏧//<b>Transaction Hash :</b> <a //href="https://tronscan.org/#/transaction/'+res//onse.data+'">'+response.data+'</a>\n➖➖➖//➖➖➖➖➖➖➖➖➖\n🤖<b>Bot Link - //</b>@'+data.bot_name+'\n⏩ <b>Please //Check Your Wallet</b>\n➖➖➖➖➖➖➖////➖➖➖➖➖\n🧭<b>Server Time : //</b>'+time+''
//  )  })

  .catch(error => {
    console.error(error)
    ctx.replyWithMarkdown('The Bot HasEncountred An problem While Complating Your Withdraw Request\nYour Problem Is Sended AUtomatically To Bot Admin Youll Recieve Your Withdraw In 24 hours')
  })
  
  
}else{
 ctx.replyWithMarkdown("😐 Send a value over *"+min_wd+" "+bot_cur+"* but not greater than *"+bal.toFixed(8)+" "+bot_cur+"* ")
ctx.scene.leave('onWithdraw')
return
 }

} catch (err) {
    console.log(err, ctx)
  }
})


bot.action(`paid`,  async (ctx) => {

 let aData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

let maindata = await db.collection('balance').find({ userId : 'hey'}).toArray()



let id = maindata[0].idm

bot.telegram.sendMessage(id,'paid')
})
function rndFloat(min, max){
  return (Math.random() * (max - min + 1)) + min
}
function rndInt(min, max){
  return Math.floor(rndFloat(min, max))
}
  
  function mustJoin(ctx){
  let msg = `<b>📃 Radical BTT Giveaway Bot Welcomes You

💵 Total For Airdrop : 6000 BTT 
📡 Website : https://www.dhddhdhd
⌛️ Distribution : 15th December

📢  You Must Complete All The Below Tasks A Participant Of Bot.
🔹 Join Cubic Drops Telegram</b> <a href="https://t.me/clickgonews">Channel</a><b>
🔹 Join Cubic Drops Telegram</b> <a href="https://t.me/clickgonews">Group</a><b>
🔹 Follow Cubic Drops Twitter Like And Retweet The Pinned Post


Complete All Above Tasks Then Click "Submit My Details"</b>`
ctx.replyWithMarkdown(
            `*🎉 I am your friendly `+airdropName+` Airdropbot*\n\n*✅ Please complete all the tasks and submit details correctly to be eligible for the airdrop*\n\n💠 Join *`+airdropName+`* Telegram [Main CHANNAL](https://t.me/BSCtigers) and [Channel](https://t.me/OfficialEarthQuake)\n💠 Follow *`+airdropName+`* on [Twitter](https://mobile.twitter.com/TNVILLANYT1), Like and Retweet pinned post\n💠 Subscribe to *`+airdropName+`* [Channal](https://t.me/MontageDrops)\n💠 Join *promoter* [channal](https://t.me/FortifyAirdrop) and 💠 Join *payment* [channel](https://t.me/payoutkings)\n\n*ℹ️ You must complete all task then click "Submit My Details" button*`, { reply_markup: { keyboard: [['📘 Submit my details']], resize_keyboard: true } }
)
        }
 


function starter (ctx) {
  ctx.replyWithMarkdown(
    `*🎉 Thank You For Joining In Our *`+airdropName+`* Airdrop\n\n🔸Complete all the tasks\n🔸Submit all the details\n🔸If you not you will not get any reward\n\n🔗Your personal referral link: https://t.me/`+data.bot_name+`?start=`+ ctx.from.id +`*`,
{ reply_markup: { keyboard: [[ '💴 Balance', '🧾 Withdraw'], ['📨 Information']], resize_keyboard: true }})
      

   }

function sendError (err, ctx) {
  ctx.reply('An Error Happened ☹️: '+err.message)
 bot.telegram.sendMessage(admin, `Error From [${ctx.from.first_name}](tg://user?id=${ctx.from.id}) \n\nError: ${err}`, { parse_mode: 'markdown' })
}


function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

async function findUser(ctx){
let isInChannel= true;
let cha = data.channelscheck
for (let i = 0; i < cha.length; i++) {
const chat = cha[i];
let tgData = await bot.telegram.getChatMember(chat, ctx.from.id)
  
  const sub = ['creator','adminstrator','member'].includes(tgData.status)
  if (!sub) {
    isInChannel = false;
    break;
  }
}
return isInChannel
}

/*

var findUser = (ctx) => {
var user = {user: ctx.from.id }
channels.every(isUser, user)
}


var isUser = (chat) => {
console.log(this)
console.log(chat)
/*l

let sub = 

return sub == true;
}
*/
