<p align="center">
<img src="https://qtlamkas.why-am-i-he.re/eWPzV8.png">
</p>

<p align="center">
Open-source chat application similar to Discord-
</p>

<p align="center" style="display :flex;">
<img src="https://img.shields.io/github/workflow/status/LamkasDev/liquidchat/Node.js%20CI"/>
<img src="https://img.shields.io/github/downloads/LamkasDev/liquidchat/total"/>
<img src="https://img.shields.io/github/contributors/LamkasDev/liquidchat"/>
<img src="https://img.shields.io/uptimerobot/ratio/7/m786204603-8c2555ef72f2fddab53b181a"/>
</p>

<p align="center">
💛 Official website: <a href="https://nekonetwork.net">https://nekonetwork.net</a>
<br/>
✔️ Releases: <a href="https://github.com/LamkasDev/liquidchat/releases  ">https://github.com/LamkasDev/liquidchat/releases</a>  
</p>

<p align="center">
📓 Documentation: <a href="https://nekonetwork.net/docs">https://nekonetwork.net/docs</a>
<br/>
🔥 API: <a href="https://github.com/LamkasDev/liquidchat.js">https://github.com/LamkasDev/liquidchat.js</a>  
<br/>
🔴 Found a bug or want to contribute?:
<a href="https://github.com/LamkasDev/liquidchat/pulls">[Open a pull request]</a>
</p>


🏁 **Features:**
- [x] Servers with Text and Voice Channels
- [x] DM Channels
- [x] Group Chats
- [x] File Support (up to 100MB by default)
- [x] Personal Emotes (max. 500)
- [x] Server Emotes (max. 400)
- [x] Idle/DND/Invisible Status
- [x] Custom Statuses
- [x] Friend Features (Adding/Removing friends)
- [x] Searches, Pinned Messages, Connections, Notes
- [x] Server banners and animated avatars for free
- [ ] Better Server Management (Built-in bans, mutes, assigning server moderators)
- [ ] Server Discovery
- [ ] Voice Channels
- [ ] Android/IOS Support
- [ ] Rich Presence
- [ ]  a lot more...


### Build instructions:
##### a) How to build client (Windows)
<pre>
run <b>npm run createproduction-win</b>
the installer will be built into /client/dist
</pre>

##### c) How to test client (Windows)
<pre>
run <b>yarn start</b>
</pre>

##### d) How to host server yourself
<pre>
1) Setup your folder structure to look like the following:

<a href="https://pastebin.com/1pNnc6EA">lc-full.sh</a>
/lc
   <a href="https://github.com/LamkasDev/liquidchat/archive/master.zip">/liquidchat<a/>
      /client
      /server
   /liquidchat-fileserver
      /public
      /keys
      <a href="https://pastebin.com/VWsgQmCP">simpleserver.js</a>
   /liquidchat-web
      /public
      /keys
      <a href="https://pastebin.com/zXxF1PGx">server.js</a>
  
 2) (Alternative, but recommended) Get a certificate and key for your server's domain, if you don't have one already
 3) (Alternative, but recommended) Put key.pem and cert.pem into each /keys directories
 4) You will need MySQL installed so do it if you don't have it already (<a href="https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04">for Ubuntu here</a>)
 5) Import the MySQL template file from here to create the needed datebase structure (will add later™)
 6) Create a /data folder in liquidchat/server and a file named config_persistent.txt
 7) Edit this file to fit the format (will add later™)
 8) Run <b>sudo lc-full.sh /home/YOUR_USERNAME/lc/</b>
</pre>

##### d) How to deploy web versions...
<pre>
1) On your local machine, in the /client directory run <b>npm run build</b>
2) Zip all the files in the /client/build folder (not the folder) into a file named build.zip
3) Place this file into /lc folder on your server
4) Restart your server (that'll unpack the assets from build.zip and place them into /liquidchat-web/public)
</pre>

##### or alternatively use Github Actions where web versions are built automatically

##### f) Additional setup
<pre>
change <b>APIEndpoint</b> in /client/App.js to your server's domain:8080  
change <b>fileEnpoint</b> in /client/App.js to your server's domain:8081  
change <b>filesStorage</b> in /server/server.js to directory where you run your file server 
</pre>

##### g) Known issues
<pre>
if using the insecure useHTTP flag, websocket sessions can't exchange browser cookies,
so server uses the first logged in session
</pre>

### Example Screenshots:  
> Client (2021/2/1)
![example1](https://qtlamkas.why-am-i-he.re/5X3X1x.png)

> Documentation (2021/2/1)
![example2](https://qtlamkas.why-am-i-he.re/RL0Ksh.png)
