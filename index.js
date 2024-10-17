let fs = await import('fs')
let path = await import('path')
let config = await import('./config.js')
let readlineSync = await import('readline-sync')
import fetch from 'node-fetch'

(async () => {
    let botToken = config.botToken
    if (!botToken) {
        botToken = readlineSync.question('botToken: ')
    }
    let stickersUrl = readlineSync.question('stickersUrl: ')
    if (!stickersUrl) {
        return
    }

    let regex = /\/([^\/]+)$/;
    let match = stickersUrl.match(regex)
    let stickersName = match && match[1];
    if (!fs.existsSync(`downloads/${stickersName}`)) {
        fs.mkdir(`downloads/${stickersName}`, {recursive: true}, (err) => {
            if (err) {
                console.error('Error creating folder:', err)
            }
        })
    }

    console.log(`保存位置: downloads/${stickersName}`)

    let res = await fetch(`https://api.telegram.org/bot${botToken}/getStickerSet?name=${stickersName}`)
        .then(res => res.json())
    let stickers = Array.from(res['result']['stickers'])
    let i = 1
    for (let sticker of stickers) {
        process.stdout.write(`\r${i++}/${stickers.length}`)
        let file_id = sticker['file_id']
        res = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${file_id}`)
            .then(res => res.json())

        let file_path = res['result']['file_path']
        let savePath = `downloads/${stickersName}/${path.basename(file_path)}`

        res = await fetch(`https://api.telegram.org/file/bot${botToken}/${file_path}?file_id=${file_id}`)
        let dest = fs.createWriteStream(savePath)
        res.body.pipe(dest)
    }
})()
