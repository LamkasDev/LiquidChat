# LiquidChat
![Build](https://travis-ci.org/LamkasDev/liquidchat.svg?branch=master)
![Dependencies](https://david-dm.org/LamkasDev/liquidchat.svg)
[![HitCount](http://hits.dwyl.com/LamkasDev/liquidchat.svg)](http://hits.dwyl.com/LamkasDev/liquidchat)  
⭐ Open-source chat application similar to Discord-  

🚩 **Planned features:**  
> Custom Statuses  
> Server Discovery  
> Better Server Management (Built-in bans, mutes, assigning server moderators)  
> Voice Channels  
> a lot more...  

🏁 **Features:**  
> Servers with Text Channels  
> DM Channels  
> Group Chats  
> File Support (up to 100MB by default)  
> Personal Emotes (max. 500)  
> Server Emotes (max. 400)  
> Idle/DND/Invisible Status  
> Friend Features (Adding/Removing friends)  

💛 Official website: https://nekonetwork.net (need to get a domain, but you know i'm broke)™️  
✔️ Releases: https://github.com/LamkasDev/liquidchat/releases  

📓 Documentation: https://nekonetwork.net/docs  
🔥 API: https://github.com/LamkasDev/liquidchat.js  
🔴 Found a bug or want to contribute?: [Open a pull request!](https://github.com/LamkasDev/liquidchat/pulls)

### Build instructions:
##### a) How to build client (Windows)
> run `npm run createproduction-win`  
> the installer will be built into `client/dist`  

##### b) How to build web version (Windows)
> run `npm run build`  
> all website's assets will be packed into `client/build`

##### c) How to test client (Windows)
> run `yarn start`  

##### d) How to host server yourself
> run `node server.js`  
> run `http-server -p 8081` in a separate directory outside `/server`

##### e) Additional setup
> change `APIEndpoint` in `App.js` to your server's adress:8080  
> change `fileEnpoint` in `App.js` to your server's adress:8081  
> change `filesStorage` in `server.js` to directory where you run your file server  

### Example Screenshots:  
> Client (2020/10/11)
![example1](https://qtlamkas.why-am-i-he.re/4h4YAh.png)

> Documentation (2020/10/11)
![example2](https://qtlamkas.why-am-i-he.re/3LsFwA.png)
